"use client";

// ═══════════════════════════════════════════════════════════════
//  AIVisibilityDashboard.tsx — REAL AI VISIBILITY PROBING
//
//  Full-page panel that lets a brand-monitor user:
//    1. Type a company name and trigger a real probe
//       (10 queries × 8 engines = 80 LLM calls, max 5 concurrent).
//    2. Watch live progress as the probe runs.
//    3. Explore the results:
//         • Visibility Score (0-100, big number)
//         • Radar chart — 8 engines × 4 dimensions (mention, rank,
//           sentiment, share)
//         • Heatmap — 10 queries × 8 engines, color = mention +
//           sentiment
//         • Engine comparison table (virtualized with @tanstack/react-virtual)
//         • Per-engine detail drawer — all 10 query responses
//         • Trend chart — visibility score over past probe batches
//
//  Honesty contract:
//    • "HarchIQ-LLM" is the real LLM (z-ai-web-dev-sdk, server-side).
//    • All other engines are labeled "(simulated)" — same LLM, different
//      system prompt. The UI surfaces the `simulated` flag everywhere.
//    • If the LLM SDK is unavailable, the route returns `live=false`
//      and a banner warns the user that the data is fallback stub data.
// ═══════════════════════════════════════════════════════════════

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { useVirtualizer } from "@tanstack/react-virtual";
import { C as TOKENS } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

// ─── Design tokens (mirror of ConsoleShell.tsx local C) ──────────
const C = {
  ...TOKENS,
  surface: TOKENS.bg,
  surfaceAlt: TOKENS.bgHover,
  borderLight: TOKENS.border,
  textPrimary: TOKENS.text,
  textSecondary: TOKENS.textBody,
  textFaint: TOKENS.textOnDarkBody,
  accentDark: TOKENS.accentHover,
  sage: TOKENS.accent,
  sageBright: TOKENS.accentBright,
  sageBg: "rgba(120,113,108,0.08)",
  red: TOKENS.danger,
  redBg: TOKENS.dangerBg,
  neutral: TOKENS.textMuted,
  neutralBg: "rgba(115,115,115,0.10)",
};

const FONT = { sans: C.fontSans, mono: C.fontMono };

// Offer accent (matches the brand-monitor emerald-500 used elsewhere)
const ACCENT = "#059669";
const ACCENT_BG = "rgba(5,150,105,0.08)";
const COL_POS = ACCENT;
const COL_NEU = C.textMuted;
const COL_NEG = C.danger;
const COL_WARN = C.warning;

// ─── Types (mirror of src/lib/harchiq/ai-probe.ts) ───────────────

type Sentiment = "positive" | "negative" | "neutral";

interface ProbeQueryResult {
  query: string;
  mentioned: boolean;
  rank: number | null;
  sentiment: Sentiment;
  sentimentScore: number;
  mentions: number;
  share: number;
  excerpt: string;
  response: string;
}

interface EngineResult {
  engine: string;
  simulated: boolean;
  queriesRun: number;
  mentionCount: number;
  avgRank: number | null;
  sentiment: Sentiment;
  shareOfVoice: number;
  results: ProbeQueryResult[];
}

interface ProbeSummary {
  companyName: string;
  probedAt: string;
  batchId: string;
  engines: EngineResult[];
  summary: {
    totalMentions: number;
    avgRankAcrossEngines: number | null;
    visibilityScore: number;
    topEngine: string;
    weakestEngine: string;
  };
  live: boolean;
}

// ─── ECharts base helper ────────────────────────────────────────

function echartsBase(): Record<string, unknown> {
  return {
    backgroundColor: "transparent",
    textStyle: { fontFamily: FONT.mono, color: C.textMuted },
  };
}

// ─── Helpers ────────────────────────────────────────────────────

const SENTIMENT_COLOR: Record<Sentiment, string> = {
  positive: COL_POS,
  neutral: COL_NEU,
  negative: COL_NEG,
};

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  positive: "Positive",
  neutral: "Neutral",
  negative: "Negative",
};

function sentimentIcon(s: Sentiment): string {
  return s === "positive" ? "\u25B2" : s === "negative" ? "\u25BC" : "\u25CF";
}

function fmtRank(rank: number | null): string {
  if (rank === null) return "—";
  const suffix =
    rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
  return `${rank}${suffix}`;
}

function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

// Short label for the engine (strip " (simulated)" for compactness)
function engineShort(engine: string): string {
  return engine.replace(/\s*\(simulated\)\s*$/i, "");
}

// ─── Component ──────────────────────────────────────────────────

export interface AIVisibilityDashboardProps {
  userName: string;
  companyName: string;
}

export function AIVisibilityDashboard({
  userName,
  companyName: defaultCompanyName,
}: AIVisibilityDashboardProps) {
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [probe, setProbe] = useState<ProbeSummary | null>(null);
  const [trend, setTrend] = useState<Array<{ probedAt: string; visibilityScore: number; totalMentions: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);

  const firstName = (userName || "").split(" ")[0] || "there";

  // ─── Load the latest historical probe on mount (so the dashboard
  //     isn't empty if the user has probed before). ────────────────
  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/console/probe-ai", { method: "GET" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.summary) {
        setProbe(data.summary as ProbeSummary);
        setCompanyName(data.summary.companyName || defaultCompanyName);
      }
      // Load trend from the existing ai-visibility-trend endpoint.
      // It returns per-day per-engine aggregates which we collapse to
      // one visibility score per day (rough proxy for the trend chart).
      const trendRes = await fetch("/api/console/ai-visibility-trend?range=30d");
      if (trendRes.ok) {
        const trendData = await trendRes.json();
        const rows: Array<{ probedAt: string; visibilityScore: number; totalMentions: number }> = [];
        if (Array.isArray(trendData?.data)) {
          for (const day of trendData.data as Array<Record<string, unknown>>) {
            const date = day.date as string;
            if (!date) continue;
            // Sum cited counts across engines for that day
            let mentions = 0;
            let enginesWithCited = 0;
            let enginesTotal = 0;
            for (const [k, v] of Object.entries(day)) {
              if (k === "date" || v === null) continue;
              if (typeof v === "object" && v !== null && "cited" in (v as Record<string, unknown>)) {
                const cell = v as { cited?: number; mentions?: number };
                mentions += (cell.cited ?? 0) + (cell.mentions ?? 0);
                enginesWithCited += (cell.cited ?? 0) > 0 ? 1 : 0;
                enginesTotal++;
              }
            }
            if (enginesTotal === 0) continue;
            const visibilityScore = Math.min(100, Math.round((mentions / Math.max(1, enginesTotal)) * 10));
            rows.push({ probedAt: date, visibilityScore, totalMentions: mentions });
          }
        }
        setTrend(rows);
      }
    } catch {
      // Silent — historical load is best-effort.
    } finally {
      setLoadingHistory(false);
    }
  }, [defaultCompanyName]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // ─── Trigger a new probe ────────────────────────────────────────
  const runProbe = useCallback(async () => {
    if (!companyName.trim() || loading) return;
    setLoading(true);
    setError(null);
    setProgress({ done: 0, total: 80 });
    setProbe(null);
    setSelectedEngine(null);

    // Simulated progress tracker — the API blocks until done, so we
    // animate progress based on elapsed time, capped at 95% until the
    // response arrives. This gives the user visible feedback during
    // the 30-60s the probe takes.
    const startedAt = Date.now();
    const estimatedTotalMs = 60_000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const ratio = Math.min(0.95, elapsed / estimatedTotalMs);
      const done = Math.round(ratio * 80);
      setProgress({ done, total: 80 });
    }, 500);

    try {
      const res = await fetch("/api/console/probe-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: companyName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || `Probe failed (${res.status})`);
      }
      const data = await res.json();
      if (!data?.summary) throw new Error("Probe returned no summary.");
      setProbe(data.summary as ProbeSummary);
      setProgress({ done: 80, total: 80 });
      // Refresh the trend chart after a successful probe.
      loadHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Probe failed.");
    } finally {
      clearInterval(timer);
      setLoading(false);
      // Clear the progress bar after a short delay so the user sees 100%.
      setTimeout(() => setProgress(null), 800);
    }
  }, [companyName, loading, loadHistory]);

  // ─── Derived data ───────────────────────────────────────────────
  const visibilityScore = probe?.summary.visibilityScore ?? 0;

  // ─── Radar chart: 8 engines × 4 dimensions ─────────────────────
  // Dimensions normalized to 0-100:
  //   mention   = mentionCount / 10 * 100
  //   rank      = 100 - (avgRank - 1) * 20 (null → 0)
  //   sentiment = 100 / 50 / 0 for pos / neu / neg
  //   share     = shareOfVoice (already 0-100)
  const radarOption: EChartsOption | null = useMemo(() => {
    if (!probe || probe.engines.length === 0) return null;
    const indicators = [
      { name: "Mention", max: 100 },
      { name: "Rank", max: 100 },
      { name: "Sentiment", max: 100 },
      { name: "Share", max: 100 },
    ];
    const series = probe.engines.map((e) => {
      const mention = (e.mentionCount / Math.max(1, e.queriesRun)) * 100;
      const rank = e.avgRank !== null ? Math.max(0, 100 - (e.avgRank - 1) * 20) : 0;
      const sentiment =
        e.sentiment === "positive" ? 100 : e.sentiment === "neutral" ? 50 : 0;
      const share = Math.min(100, e.shareOfVoice);
      return {
        name: e.engine,
        value: [mention, rank, sentiment, share],
        lineStyle: { color: e.simulated ? C.textMuted : ACCENT, width: e.simulated ? 1 : 2 },
        itemStyle: { color: e.simulated ? C.textMuted : ACCENT },
        areaStyle: { opacity: e.simulated ? 0.02 : 0.08 },
      };
    });
    return {
      ...echartsBase(),
      legend: {
        bottom: 0,
        textStyle: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 10 },
        icon: "circle",
        itemWidth: 6,
        itemHeight: 6,
        type: "scroll",
      },
      radar: {
        indicator: indicators,
        radius: "58%",
        center: ["50%", "46%"],
        axisName: { color: C.textBody, fontFamily: FONT.mono, fontSize: 9 },
        splitLine: { lineStyle: { color: C.border } },
        splitArea: { areaStyle: { color: [C.bg, C.bgSubtle] } },
        axisLine: { lineStyle: { color: C.border } },
      },
      series: [
        {
          type: "radar",
          data: series,
          symbol: "circle",
          symbolSize: 4,
        },
      ],
    } as EChartsOption;
  }, [probe]);

  // ─── Heatmap: 10 queries × 8 engines ────────────────────────────
  // Cell value: 0 (not mentioned) → 1 (mentioned positive) / 0.5 (neutral) / 0 (negative)
  // Color: gray (not mentioned) / green (pos) / amber (neu) / red (neg)
  const heatmapOption: EChartsOption | null = useMemo(() => {
    if (!probe || probe.engines.length === 0) return null;
    const engines = probe.engines.map((e) => engineShort(e.engine));
    // Use the first engine's results for the query axis (all engines
    // ran the same 10 queries in the same order).
    const queries = probe.engines[0]?.results.map((r) => r.query) ?? [];
    if (queries.length === 0) return null;

    // Shorten query labels for the Y axis (truncate at 40 chars).
    const shortQueries = queries.map((q) =>
      q.length > 40 ? q.slice(0, 38) + "\u2026" : q,
    );

    const data: Array<[number, number, number]> = [];
    const sentimentLabels: Array<[number, number, string]> = [];
    for (let qIdx = 0; qIdx < queries.length; qIdx++) {
      for (let eIdx = 0; eIdx < probe.engines.length; eIdx++) {
        const r = probe.engines[eIdx].results[qIdx];
        if (!r) continue;
        const value = r.mentioned
          ? r.sentiment === "positive"
            ? 3
            : r.sentiment === "neutral"
              ? 2
              : 1
          : 0;
        data.push([eIdx, qIdx, value]);
        sentimentLabels.push([eIdx, qIdx, r.mentioned ? r.sentiment : "absent"]);
      }
    }

    return {
      ...echartsBase(),
      tooltip: {
        position: "top",
        backgroundColor: C.bg,
        borderColor: C.border,
        textStyle: { color: C.textBody, fontFamily: FONT.mono, fontSize: 11 },
        formatter: (params: unknown) => {
          const p = params as { value: [number, number, number] };
          const [eIdx, qIdx] = p.value;
          const engine = probe.engines[eIdx];
          const r = engine?.results[qIdx];
          if (!r) return "";
          const sim = engine.simulated ? " (simulated)" : "";
          return `<b>${engine.engine}${sim}</b><br/>` +
            `<span style="color:${C.textMuted}">Query:</span> ${r.query}<br/>` +
            `<span style="color:${C.textMuted}">Mentioned:</span> ${r.mentioned ? "Yes" : "No"}<br/>` +
            (r.mentioned
              ? `<span style="color:${C.textMuted}">Rank:</span> ${fmtRank(r.rank)}<br/>` +
                `<span style="color:${C.textMuted}">Sentiment:</span> ${SENTIMENT_LABEL[r.sentiment]}<br/>` +
                `<span style="color:${C.textMuted}">Mentions:</span> ${r.mentions}<br/>` +
                `<span style="color:${C.textMuted}">Share:</span> ${fmtPct(r.share)}`
              : "");
        },
      },
      grid: { left: 200, right: 30, top: 10, bottom: 30 },
      xAxis: {
        type: "category",
        data: engines,
        axisLabel: {
          color: C.textBody,
          fontFamily: FONT.mono,
          fontSize: 9,
          rotate: 30,
          formatter: (v: string) => (v.length > 12 ? v.slice(0, 11) + "\u2026" : v),
        },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: C.border } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "category",
        data: shortQueries,
        axisLabel: { color: C.textBody, fontFamily: FONT.mono, fontSize: 9 },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: C.border } },
        axisTick: { show: false },
      },
      visualMap: {
        min: 0,
        max: 3,
        show: true,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemWidth: 10,
        itemHeight: 80,
        textStyle: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 10 },
        inRange: { color: [C.neutralBg, COL_NEG, COL_WARN, COL_POS] },
        categories: ["Absent", "Negative", "Neutral", "Positive"],
      },
      series: [
        {
          type: "heatmap",
          data,
          label: { show: false },
          emphasis: {
            itemStyle: { borderColor: C.text, borderWidth: 1 },
          },
        },
      ],
    } as EChartsOption;
  }, [probe]);

  // ─── Trend chart: visibility score over past batches ────────────
  const trendOption: EChartsOption | null = useMemo(() => {
    if (trend.length === 0) return null;
    return {
      ...echartsBase(),
      grid: { left: 30, right: 20, top: 10, bottom: 30 },
      xAxis: {
        type: "category",
        data: trend.map((t) => t.probedAt.slice(5)),
        axisLabel: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 9 },
        axisLine: { lineStyle: { color: C.border } },
        axisTick: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 100,
        axisLabel: { color: C.textMuted, fontFamily: FONT.mono, fontSize: 9 },
        splitLine: { lineStyle: { color: C.border } },
      },
      tooltip: {
        backgroundColor: C.bg,
        borderColor: C.border,
        textStyle: { color: C.textBody, fontFamily: FONT.mono, fontSize: 11 },
      },
      series: [
        {
          type: "line",
          data: trend.map((t) => t.visibilityScore),
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          lineStyle: { color: ACCENT, width: 2 },
          itemStyle: { color: ACCENT },
          areaStyle: { color: ACCENT_BG },
        },
      ],
    } as EChartsOption;
  }, [trend]);

  // ─── Per-engine detail drawer ──────────────────────────────────
  const selectedEngineData = selectedEngine
    ? probe?.engines.find((e) => e.engine === selectedEngine) ?? null
    : null;

  // ═══ RENDER ═══

  return (
    <div
      className="dash-main"
      style={{ padding: "16px", background: C.bg, overflowX: "hidden" }}
    >
      {/* Responsive collapse */}
      <style>{`
        @media (max-width: 900px) {
          .aiv-grid { grid-template-columns: 1fr !important; }
          .aiv-grid > * { grid-column: span 1 !important; }
        }
      `}</style>

      {/* ─── Welcome banner ─── */}
      <div
        style={{
          padding: "14px 16px",
          background: ACCENT_BG,
          borderRadius: "4px",
          marginBottom: "12px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, lineHeight: 1.5 }}>
          {firstName}, probe how 8 AI engines talk about your company.
        </div>
        <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>
          10 queries × 8 engines = 80 LLM calls per probe. 1 real engine + 7 honestly-labeled simulations.
        </div>
      </div>

      {/* ─── Page title + probe trigger ─── */}
      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            AI Visibility
          </div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: C.text,
              margin: "2px 0 0 0",
              letterSpacing: "-0.02em",
            }}
          >
            Probe 8 AI Engines
          </h3>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company name (e.g. OCP Group)"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) runProbe();
            }}
            style={{
              padding: "7px 12px",
              fontSize: "12px",
              fontFamily: FONT.mono,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              background: C.bg,
              color: C.text,
              minWidth: "240px",
              outline: "none",
            }}
          />
          <button
            onClick={runProbe}
            disabled={loading || !companyName.trim()}
            style={{
              padding: "7px 16px",
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              border: `1px solid ${ACCENT}`,
              borderRadius: "4px",
              background: ACCENT,
              color: "#ffffff",
              cursor: loading || !companyName.trim() ? "not-allowed" : "pointer",
              letterSpacing: "0.05em",
              opacity: loading || !companyName.trim() ? 0.6 : 1,
              transition: "all 0.15s ease",
            }}
          >
            {loading ? "Probing\u2026" : "Probe 8 AI Engines"}
          </button>
        </div>
      </div>

      {/* ─── Progress bar ─── */}
      {progress && (
        <div
          style={{
            padding: "12px 16px",
            background: C.bgSubtle,
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textBody }}>
              Probing {companyName} — {progress.done}/{progress.total} LLM calls
            </span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>
              {Math.round((progress.done / progress.total) * 100)}%
            </span>
          </div>
          <div
            style={{
              height: "4px",
              background: C.border,
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
                height: "100%",
                background: ACCENT,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>
            10 queries × 8 engines (max 5 concurrent). Each call has a 20s timeout.
          </div>
        </div>
      )}

      {/* ─── Error banner ─── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: C.redBg,
            border: `1px solid ${C.red}`,
            borderRadius: "4px",
            marginBottom: "12px",
            fontSize: "12px",
            color: C.red,
            fontFamily: FONT.mono,
          }}
        >
          {error}
        </div>
      )}

      {/* ─── Live / fallback warning ─── */}
      {probe && !probe.live && (
        <div
          style={{
            padding: "10px 14px",
            background: "rgba(245,158,11,0.08)",
            border: `1px solid ${COL_WARN}`,
            borderRadius: "4px",
            marginBottom: "12px",
            fontSize: "11px",
            color: C.warningText ?? "#b45309",
            fontFamily: FONT.mono,
          }}
        >
          Warning: the LLM SDK was unavailable during this probe. Results are fallback stub data, not real LLM responses. Retry in a moment.
        </div>
      )}

      {/* ─── Empty state (no probe yet) ─── */}
      {!probe && !loading && !loadingHistory && !error && (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            border: `1px dashed ${C.border}`,
            borderRadius: "4px",
            background: C.bgSubtle,
          }}
        >
          <div style={{ fontSize: "13px", fontFamily: FONT.mono, color: C.textBody, lineHeight: 1.6 }}>
            Type a company name above and click <strong style={{ color: C.text }}>Probe 8 AI Engines</strong> to
            measure how ChatGPT, Claude, Gemini, Perplexity, Copilot, Llama, Mistral, and HarchIQ-LLM talk about it.
          </div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "12px" }}>
            1 real engine + 7 honestly-labeled simulations. ~30-60 seconds per probe.
          </div>
        </div>
      )}

      {/* ─── Loading skeleton (history load) ─── */}
      {!probe && loadingHistory && !loading && (
        <div style={{ padding: "16px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: "4px" }}>
          <SkeletonLoader accent={ACCENT} lines={3} height={40} />
        </div>
      )}

      {/* ─── Results ─── */}
      {probe && (
        <div
          className="aiv-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "12px",
          }}
        >
          {/* Visibility Score (big number) — spans 4 cols */}
          <div
            style={{
              gridColumn: "span 4",
              padding: "20px",
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "180px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Visibility Score
              </div>
              <div
                style={{
                  fontSize: "56px",
                  fontWeight: 700,
                  color:
                    visibilityScore >= 67 ? COL_POS : visibilityScore >= 34 ? COL_WARN : COL_NEG,
                  fontFamily: FONT.mono,
                  lineHeight: 1.1,
                  marginTop: "8px",
                  letterSpacing: "-0.04em",
                }}
              >
                {visibilityScore}
                <span style={{ fontSize: "18px", color: C.textMuted, marginLeft: "4px" }}>/100</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "12px", flexWrap: "wrap" }}>
              <Metric label="Mentions" value={String(probe.summary.totalMentions)} />
              <Metric
                label="Avg Rank"
                value={probe.summary.avgRankAcrossEngines !== null ? fmtRank(probe.summary.avgRankAcrossEngines) : "—"}
              />
              <Metric label="Top Engine" value={engineShort(probe.summary.topEngine)} />
              <Metric label="Weakest" value={engineShort(probe.summary.weakestEngine)} />
            </div>
          </div>

          {/* Radar chart — spans 4 cols */}
          <Panel title="Engine Radar" subtitle="8 engines × 4 dimensions" span={4}>
            {radarOption ? (
              <ReactECharts option={radarOption} style={{ height: "240px", minHeight: "240px" }} opts={{ renderer: "svg" }} />
            ) : (
              <EmptyChart />
            )}
          </Panel>

          {/* Trend chart — spans 4 cols */}
          <Panel title="Visibility Trend" subtitle="Past 30 days" span={4}>
            {trendOption ? (
              <ReactECharts option={trendOption} style={{ height: "240px", minHeight: "240px" }} opts={{ renderer: "svg" }} />
            ) : (
              <EmptyChart message="No historical probes yet. Run one to start the trend." />
            )}
          </Panel>

          {/* Heatmap — full width */}
          <Panel title="Query × Engine Heatmap" subtitle="10 queries × 8 engines · cell color = mention + sentiment" span={12}>
            {heatmapOption ? (
              <ReactECharts
                option={heatmapOption}
                style={{ height: "340px", minHeight: "340px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            ) : (
              <EmptyChart />
            )}
          </Panel>

          {/* Engine comparison table — full width, virtualized */}
          <Panel title="Engine Comparison" subtitle="Click a row to see all 10 query responses" span={12}>
            <EngineComparisonTable
              engines={probe.engines}
              selectedEngine={selectedEngine}
              onSelect={setSelectedEngine}
            />
          </Panel>

          {/* Per-engine detail drawer — full width */}
          {selectedEngineData && (
            <Panel
              title={`${selectedEngineData.engine} — 10 Responses`}
              subtitle={
                selectedEngineData.simulated
                  ? "Simulated engine — same LLM, different system prompt"
                  : "Real LLM (z-ai-web-dev-sdk, server-side)"
              }
              span={12}
              onClose={() => setSelectedEngine(null)}
            >
              <EngineDetailTable engine={selectedEngineData} />
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "9px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          fontFamily: FONT.mono,
          color: C.text,
          fontWeight: 600,
          marginTop: "2px",
          maxWidth: "120px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  span,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  span: number;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        padding: "16px",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 600,
              color: C.text,
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                marginTop: "2px",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: FONT.mono,
              border: `1px solid ${C.border}`,
              borderRadius: "3px",
              background: C.bg,
              color: C.textBody,
              cursor: "pointer",
            }}
            title="Close"
          >
            {"\u2715"}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message = "No data yet." }: { message?: string }) {
  return (
    <div
      style={{
        height: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: C.textMuted,
        fontFamily: FONT.mono,
        fontSize: "11px",
      }}
    >
      {message}
    </div>
  );
}

// ─── Engine comparison table (virtualized) ──────────────────────

function EngineComparisonTable({
  engines,
  selectedEngine,
  onSelect,
}: {
  engines: EngineResult[];
  selectedEngine: string | null;
  onSelect: (engine: string) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: engines.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 4,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: "420px",
        overflow: "auto",
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 2fr) 100px 100px 120px 120px 110px",
          gap: "0",
          padding: "8px 12px",
          background: C.bgSubtle,
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <HeaderCell>Engine</HeaderCell>
        <HeaderCell align="right">Mentioned</HeaderCell>
        <HeaderCell align="right">Avg Rank</HeaderCell>
        <HeaderCell align="right">Sentiment</HeaderCell>
        <HeaderCell align="right">Share of Voice</HeaderCell>
        <HeaderCell align="right">Simulated?</HeaderCell>
      </div>

      {/* Virtualized rows */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const e = engines[virtualRow.index];
          if (!e) return null;
          const isSelected = e.engine === selectedEngine;
          return (
            <div
              key={e.engine}
              onClick={() => onSelect(e.engine)}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "minmax(180px, 2fr) 100px 100px 120px 120px 110px",
                gap: "0",
                padding: "10px 12px",
                borderBottom: `1px solid ${C.border}`,
                background: isSelected ? ACCENT_BG : C.bg,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(ev) => {
                if (!isSelected) ev.currentTarget.style.background = C.bgSubtle;
              }}
              onMouseLeave={(ev) => {
                if (!isSelected) ev.currentTarget.style.background = C.bg;
              }}
            >
              <Cell>
                <span style={{ fontWeight: 600, color: C.text }}>{engineShort(e.engine)}</span>
                {e.simulated && (
                  <span
                    style={{
                      marginLeft: "6px",
                      fontSize: "9px",
                      fontFamily: FONT.mono,
                      padding: "1px 5px",
                      background: C.neutralBg,
                      color: C.textMuted,
                      borderRadius: "2px",
                    }}
                    title="Simulated via prompt variation"
                  >
                    SIM
                  </span>
                )}
              </Cell>
              <Cell align="right">
                <span style={{ color: C.text }}>
                  {e.mentionCount}
                </span>
                <span style={{ color: C.textMuted, fontSize: "10px" }}>/{e.queriesRun}</span>
              </Cell>
              <Cell align="right" mono>
                {fmtRank(e.avgRank)}
              </Cell>
              <Cell align="right">
                <span style={{ color: SENTIMENT_COLOR[e.sentiment], fontFamily: FONT.mono, fontSize: "11px" }}>
                  {sentimentIcon(e.sentiment)} {SENTIMENT_LABEL[e.sentiment]}
                </span>
              </Cell>
              <Cell align="right" mono>{fmtPct(e.shareOfVoice)}</Cell>
              <Cell align="right">
                {e.simulated ? (
                  <span style={{ color: C.textMuted, fontFamily: FONT.mono, fontSize: "11px" }}>Yes</span>
                ) : (
                  <span style={{ color: ACCENT, fontFamily: FONT.mono, fontSize: "11px", fontWeight: 600 }}>
                    Real
                  </span>
                )}
              </Cell>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeaderCell({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div
      style={{
        fontSize: "10px",
        fontFamily: FONT.mono,
        color: C.textMuted,
        letterSpacing: "0.10em",
        textTransform: "uppercase",
        textAlign: align,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function Cell({
  children,
  align = "left",
  mono = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) {
  const style: CSSProperties = {
    fontSize: "12px",
    fontFamily: mono ? FONT.mono : FONT.sans,
    color: C.textBody,
    textAlign: align,
    display: "flex",
    alignItems: "center",
    justifyContent: align === "right" ? "flex-end" : "flex-start",
    gap: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };
  return <div style={style}>{children}</div>;
}

// ─── Per-engine detail table (all 10 query responses) ───────────

function EngineDetailTable({ engine }: { engine: EngineResult }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: engine.results.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 110,
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      style={{
        maxHeight: "560px",
        overflow: "auto",
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 2fr) 70px 70px 110px 60px minmax(280px, 3fr)",
          gap: "0",
          padding: "8px 12px",
          background: C.bgSubtle,
          borderBottom: `1px solid ${C.border}`,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <HeaderCell>Query</HeaderCell>
        <HeaderCell align="right">Mentioned</HeaderCell>
        <HeaderCell align="right">Rank</HeaderCell>
        <HeaderCell align="right">Sentiment</HeaderCell>
        <HeaderCell align="right">Mentions</HeaderCell>
        <HeaderCell>Response Excerpt</HeaderCell>
      </div>

      <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const r = engine.results[virtualRow.index];
          if (!r) return null;
          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: "minmax(220px, 2fr) 70px 70px 110px 60px minmax(280px, 3fr)",
                gap: "0",
                padding: "10px 12px",
                borderBottom: `1px solid ${C.border}`,
                background: C.bg,
                alignItems: "flex-start",
              }}
            >
              <Cell>
                <span
                  style={{
                    fontSize: "11px",
                    color: C.text,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={r.query}
                >
                  {r.query}
                </span>
              </Cell>
              <Cell align="right" mono>
                {r.mentioned ? (
                  <span style={{ color: ACCENT, fontWeight: 600 }}>Yes</span>
                ) : (
                  <span style={{ color: C.textMuted }}>No</span>
                )}
              </Cell>
              <Cell align="right" mono>{fmtRank(r.rank)}</Cell>
              <Cell align="right">
                <span style={{ color: SENTIMENT_COLOR[r.sentiment], fontFamily: FONT.mono, fontSize: "11px" }}>
                  {sentimentIcon(r.sentiment)} {SENTIMENT_LABEL[r.sentiment]}
                </span>
              </Cell>
              <Cell align="right" mono>{r.mentions}</Cell>
              <Cell>
                <span
                  style={{
                    fontSize: "11px",
                    color: C.textBody,
                    lineHeight: 1.4,
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontFamily: FONT.mono,
                  }}
                  title={r.response}
                >
                  {r.excerpt || "(empty response)"}
                </span>
              </Cell>
            </div>
          );
        })}
      </div>
    </div>
  );
}

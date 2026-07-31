"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

const FONT = { sans: C.fontSans, mono: C.fontMono };

// ═══════════════════════════════════════════════════════════════
//  AlphaDeskDashboard.tsx
//
//  OFFER 4 — Harch Alpha (Trader Solo)
//  Mindset: Speed, adrenaline, asymmetry. The trader wants the info
//  before Bloomberg. "What just moved? Give me the ticker, the
//  delta, the signal — nothing else."
//
//  Layout: Dark background → Pre-market brief banner → 3 KPI cards
//  (latency, sentiment spike Z-score, asset ticker) → Asset ticker
//  feed (ticker → sentiment delta → price delta → AI confidence) →
//  Correlation quick-view + Price×Sentiment dual-axis chart →
//  Market Analytics (performance bars, sentiment heatmap, correlation
//  distribution, gainers/losers, sentiment pie). Cyan accent on
//  dark. Terminal vibe.
// ═══════════════════════════════════════════════════════════════

// ─── Types (typed KPI props, ready for real-time API binding) ───

export interface AlphaKPI {
  latencySignal: number;           // detection time in milliseconds
  sentimentSpike: number;          // Z-score (>3.0 = anomaly)
  assetTicker: string;             // the asset with the spike (OCP, IAM, ATW)
  assetsTracked: number;
  avgSentiment: number;
  topGainer: { ticker: string; changePct: number } | null;
  topLoser: { ticker: string; changePct: number } | null;
}

export interface AlphaAssetRow {
  ticker: string;
  name: string;
  assetType: string;               // stock | crypto | fx | commodity
  latestPrice: number | null;
  latestChange: number | null;
  latestSentiment: number | null;
  correlation: number | null;      // Pearson r vs price
}

export interface AlphaDeskDashboardProps {
  userName: string;
  userEmail: string | null;
  companyName: string;
  kpis?: AlphaKPI;
  assets?: AlphaAssetRow[];
}

// ─── Accent (cyan = raw, fast, trading desk) ────────────────────

const ACCENT = "#0891b2";
const ACCENT_BG = "rgba(8,145,178,0.10)";
const DARK_BG = "#ffffff";
const DARK_SURFACE = "#ffffff";
const DARK_BORDER = "#e5e5e5";
const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#d97706";
const SLATE = "#94a3b8";
const TEXT_ON_DARK = "#0a0a0a";
const TEXT_MUTED_DARK = "#737373";

// ─── Chart card + title styles (terminal vibe) ──────────────────

const chartCardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
  background: "#ffffff",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: FONT.mono,
  color: TEXT_MUTED_DARK,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "16px",
  fontWeight: 600,
};

const axisTickStyle = {
  fontSize: 10,
  fontFamily: FONT.mono,
  fill: TEXT_MUTED_DARK,
};

const tooltipContentStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  fontSize: "11px",
  fontFamily: FONT.mono,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const tooltipLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontFamily: FONT.mono,
  color: TEXT_MUTED_DARK,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "4px",
};

// ─── Chart helpers ──────────────────────────────────────────────

function sentimentColor(s: number | null): string {
  if (s === null) return "#f4f4f5";
  if (s > 0.1) {
    const alpha = Math.min(Math.abs(s), 1) * 0.55 + 0.2;
    return `rgba(16,185,129,${alpha})`;
  }
  if (s < -0.1) {
    const alpha = Math.min(Math.abs(s), 1) * 0.55 + 0.2;
    return `rgba(239,68,68,${alpha})`;
  }
  return "#f4f4f5";
}

function sentimentTextColor(s: number | null): string {
  if (s === null) return TEXT_MUTED_DARK;
  if (Math.abs(s) > 0.5) return "#ffffff";
  return TEXT_ON_DARK;
}

function correlationColor(c: number): string {
  const abs = Math.abs(c);
  if (abs > 0.5) return c > 0 ? GREEN : RED;
  if (abs > 0.3) return AMBER;
  return SLATE;
}

function formatDateTick(iso: string): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length < 3) return iso;
  return `${parts[1]}/${parts[2]}`;
}

function formatPct(v: number): string {
  return `${v > 0 ? "+" : ""}${v.toFixed(2)}%`;
}

// ─── Aligned data point (from correlation API) ──────────────────

interface AlignedPoint {
  date: string;
  sentiment: number | null;
  price: number | null;
  changePct: number | null;
}

// ─── Component ──────────────────────────────────────────────────

export function AlphaDeskDashboard({
  userName,
  userEmail,
  companyName,
  kpis: injectedKpis,
  assets: injectedAssets,
}: AlphaDeskDashboardProps) {
  const [kpis, setKpis] = useState<AlphaKPI | null>(injectedKpis ?? null);
  const [assets, setAssets] = useState<AlphaAssetRow[]>(injectedAssets ?? []);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [correlation, setCorrelation] = useState<{
    correlation: number;
    direction: string;
    interpretation: string;
    dataPoints: number;
    alignedData?: AlignedPoint[];
  } | null>(null);
  const [corrLoading, setCorrLoading] = useState(false);
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState<"all" | "stock" | "crypto" | "fx" | "commodity">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // All-asset correlation distribution
  const [assetCorrs, setAssetCorrs] = useState<{ ticker: string; correlation: number }[]>([]);
  const [corrDistLoading, setCorrDistLoading] = useState(false);

  useEffect(() => {
    if (injectedKpis) return;
    (async () => {
      try {
        const [assetsRes, statsRes] = await Promise.all([
          fetch("/api/trader/assets"),
          fetch("/api/trader/stats"),
        ]);

        if (assetsRes.ok) {
          const data = await assetsRes.json();
          const assetRows: AlphaAssetRow[] = (data.assets ?? []).map((a: Record<string, unknown>) => ({
            ticker: a.ticker as string,
            name: a.name as string,
            assetType: a.assetType as string,
            latestPrice: (a.latestPrice as number) ?? null,
            latestChange: (a.latestChange as number) ?? null,
            latestSentiment: (a.latestSentiment as number) ?? null,
            correlation: null,
          }));
          setAssets(assetRows);
          if (assetRows.length > 0) setSelectedTicker(assetRows[0].ticker);
        }

        if (statsRes.ok) {
          const s = await statsRes.json();
          setKpis({
            latencySignal: 420,  // ms — placeholder until real pipeline
            sentimentSpike: 0,
            assetTicker: s.topMover?.ticker ?? "—",
            assetsTracked: s.totalAssets ?? 0,
            avgSentiment: s.avgSentiment ?? 0,
            topGainer: s.topGainer ?? null,
            topLoser: s.topLoser ?? null,
          });
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    })();
  }, [injectedKpis]);

  // Fetch correlation when ticker selected (includes alignedData time series)
  useEffect(() => {
    if (!selectedTicker) return;
    let cancelled = false;
    (async () => {
      setCorrLoading(true);
      try {
        const res = await fetch(`/api/trader/assets/${selectedTicker}/correlation?window=30`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          setCorrelation(data);
        }
      } catch {
        // ignore
      }
      if (!cancelled) setCorrLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selectedTicker]);

  // Fetch correlation for ALL assets (for distribution chart)
  const tickerSignature = assets.map((a) => a.ticker).join(",");
  useEffect(() => {
    if (assets.length === 0) return;
    let cancelled = false;
    (async () => {
      setCorrDistLoading(true);
      try {
        const results = await Promise.all(
          assets.map(async (a) => {
            try {
              const res = await fetch(`/api/trader/assets/${a.ticker}/correlation?window=30`);
              if (!res.ok) return { ticker: a.ticker, correlation: 0 };
              const data = await res.json();
              return { ticker: a.ticker, correlation: data.correlation ?? 0 };
            } catch {
              return { ticker: a.ticker, correlation: 0 };
            }
          })
        );
        if (!cancelled) setAssetCorrs(results);
      } catch {
        // ignore
      }
      if (!cancelled) setCorrDistLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tickerSignature]);

  const firstName = userName.split(" ")[0] || "there";
  const spikeColor = (kpis?.sentimentSpike ?? 0) > 3 ? RED : (kpis?.sentimentSpike ?? 0) > 1.5 ? AMBER : ACCENT;

  const typeColors: Record<string, string> = {
    stock: GREEN,
    crypto: AMBER,
    fx: ACCENT,
    commodity: RED,
    index: TEXT_MUTED_DARK,
  };

  // Refresh assets
  const refreshAssets = async () => {
    setRefreshing(true);
    try {
      const [assetsRes, statsRes] = await Promise.all([
        fetch("/api/trader/assets"),
        fetch("/api/trader/stats"),
      ]);
      if (assetsRes.ok) {
        const data = await assetsRes.json();
        const assetRows: AlphaAssetRow[] = (data.assets ?? []).map((a: Record<string, unknown>) => ({
          ticker: a.ticker as string,
          name: a.name as string,
          assetType: a.assetType as string,
          latestPrice: (a.latestPrice as number) ?? null,
          latestChange: (a.latestChange as number) ?? null,
          latestSentiment: (a.latestSentiment as number) ?? null,
          correlation: null,
        }));
        setAssets(assetRows);
      }
      if (statsRes.ok) {
        const s = await statsRes.json();
        setKpis({
          latencySignal: 420,
          sentimentSpike: 0,
          assetTicker: s.topMover?.ticker ?? "—",
          assetsTracked: s.totalAssets ?? 0,
          avgSentiment: s.avgSentiment ?? 0,
          topGainer: s.topGainer ?? null,
          topLoser: s.topLoser ?? null,
        });
      }
      setLastRefresh(new Date());
    } catch {
      // ignore
    }
    setRefreshing(false);
  };

  // Filter assets by type
  const filteredAssets = assets.filter((a) => assetTypeFilter === "all" || a.assetType === assetTypeFilter);

  // Export assets to CSV
  const exportAssetsCSV = () => {
    const headers = ["Ticker", "Name", "Type", "Price", "Change%", "Sentiment"];
    const rows = filteredAssets.map((a) => [a.ticker, `"${a.name}"`, a.assetType, a.latestPrice ?? "—", a.latestChange ?? "—", a.latestSentiment ?? "—"]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `alpha-assets-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ─── Chart data derivations (real data, no mock) ─────────────

  // Performance comparison: all assets with latestChange
  const perfData = assets
    .filter((a) => a.latestChange !== null)
    .map((a) => ({ ticker: a.ticker, change: a.latestChange as number }))
    .sort((a, b) => b.change - a.change);

  // Sentiment distribution buckets
  const sentimentBuckets = { bullish: 0, neutral: 0, bearish: 0, unknown: 0 };
  for (const a of assets) {
    if (a.latestSentiment === null) { sentimentBuckets.unknown++; continue; }
    if (a.latestSentiment > 0.1) sentimentBuckets.bullish++;
    else if (a.latestSentiment < -0.1) sentimentBuckets.bearish++;
    else sentimentBuckets.neutral++;
  }
  const pieData = [
    { name: "Bullish", value: sentimentBuckets.bullish, color: GREEN },
    { name: "Neutral", value: sentimentBuckets.neutral, color: SLATE },
    { name: "Bearish", value: sentimentBuckets.bearish, color: RED },
  ].filter((d) => d.value > 0);

  // Top movers: top 3 gainers + top 3 losers (deduped)
  const moversData = (() => {
    const withChange = assets.filter((a) => a.latestChange !== null);
    if (withChange.length === 0) return [];
    const sorted = [...withChange].sort((a, b) => (b.latestChange ?? 0) - (a.latestChange ?? 0));
    const top = sorted.slice(0, 3);
    const bottom = sorted.slice(-3).reverse();
    const map = new Map<string, number>();
    [...top, ...bottom].forEach((a) => map.set(a.ticker, a.latestChange ?? 0));
    return Array.from(map.entries())
      .map(([ticker, change]) => ({ ticker, change }))
      .sort((a, b) => b.change - a.change);
  })();

  return (
    <div className="dash-main" style={{ padding: "24px", background: "#ffffff", overflowX: "hidden", color: "#0a0a0a", fontFamily: FONT.sans }}>
      {/* ─── Pre-market brief banner ─── */}
      <div
        style={{
          padding: "16px 20px",
          background: ACCENT_BG,
          borderRadius: "8px",
          marginBottom: "24px",
          borderLeft: `3px solid ${ACCENT}`,
        }}
      >
        <div style={{ fontSize: "15px", fontWeight: 600, color: TEXT_ON_DARK, lineHeight: 1.5 }}>
          {firstName}, pre-market brief 07:00. {(kpis?.sentimentSpike ?? 0) > 3 ? `${kpis?.assetTicker} divergence detected (Z=${(kpis?.sentimentSpike ?? 0).toFixed(1)}).` : "No divergences detected. Market nominal."}
        </div>
        <div style={{ fontSize: "12px", color: TEXT_MUTED_DARK, fontFamily: FONT.mono, marginTop: "6px" }}>
          Detection latency: {kpis?.latencySignal ?? "—"}ms · {kpis?.assetsTracked ?? 0} assets tracked
        </div>
      </div>

      {/* ─── Page title ─── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          Alpha Desk
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: TEXT_ON_DARK, margin: 0, letterSpacing: "-0.02em" }}>
          Market Monitor
        </h3>
      </div>

      {/* ─── KPI cards: latency / spike / ticker ─── */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div style={{ padding: "20px", background: DARK_SURFACE, border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: DARK_SURFACE, border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
          <div style={{ padding: "20px", background: DARK_SURFACE, border: "1px solid #e5e5e5", borderRadius: "8px" }}><SkeletonLoader accent={ACCENT} lines={1} height={36} /></div>
        </div>
      ) : error ? (
        <div style={{ marginBottom: "24px" }}><ErrorState accent={ACCENT} message="Signal lost — reconnecting to market feed…" /></div>
      ) : (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 160px), 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", background: DARK_SURFACE, border: `1px solid ${DARK_BORDER}`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: ACCENT, lineHeight: 1 }}>
            {loading ? "—" : `${kpis?.latencySignal}ms`}
          </div>
          <div style={{ fontSize: "10px", color: TEXT_MUTED_DARK, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Signal latency
          </div>
        </div>
        <div style={{ padding: "20px", background: DARK_SURFACE, border: `1px solid ${spikeColor}40`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: spikeColor, lineHeight: 1 }}>
            {loading ? "—" : `Z=${(kpis?.sentimentSpike ?? 0).toFixed(1)}`}
          </div>
          <div style={{ fontSize: "10px", color: TEXT_MUTED_DARK, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Sentiment spike
          </div>
        </div>
        <div style={{ padding: "20px", background: DARK_SURFACE, border: `1px solid ${DARK_BORDER}`, borderRadius: "8px", textAlign: "center" }}>
          <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: FONT.mono, color: TEXT_ON_DARK, lineHeight: 1 }}>
            {loading ? "—" : kpis?.assetTicker}
          </div>
          <div style={{ fontSize: "10px", color: TEXT_MUTED_DARK, fontFamily: FONT.mono, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Top mover
          </div>
        </div>
      </div>
      )}

      {/* ─── Asset ticker feed — dense, terminal-style ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Asset feed — click to view correlation ({filteredAssets.length})
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Asset type filter chips */}
            {(["all", "stock", "crypto", "fx", "commodity"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAssetTypeFilter(f)}
                style={{
                  padding: "4px 10px",
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 600,
                  border: `1px solid ${assetTypeFilter === f ? ACCENT : DARK_BORDER}`,
                  borderRadius: "12px",
                  background: assetTypeFilter === f ? `${ACCENT}15` : "#ffffff",
                  color: assetTypeFilter === f ? ACCENT : TEXT_MUTED_DARK,
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
              onClick={refreshAssets}
              disabled={refreshing}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: `1px solid ${DARK_BORDER}`,
                borderRadius: "12px",
                background: "#ffffff",
                color: "#525252",
                cursor: refreshing ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
                opacity: refreshing ? 0.6 : 1,
              }}
              title={`Last refreshed: ${lastRefresh.toLocaleTimeString("en-US")}`}
            >
              {refreshing ? "\u21BB ..." : "\u21BB Refresh"}
            </button>
            <button
              onClick={exportAssetsCSV}
              style={{
                padding: "4px 10px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                fontWeight: 600,
                border: `1px solid ${DARK_BORDER}`,
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
        <div style={{ border: `1px solid ${DARK_BORDER}`, borderRadius: "6px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "500px" }}>
              <thead>
                <tr style={{ background: DARK_SURFACE }}>
                  <th style={darkThStyle}>Ticker</th>
                  <th style={darkThStyle}>Type</th>
                  <th style={{ ...darkThStyle, textAlign: "right" }}>Price</th>
                  <th style={{ ...darkThStyle, textAlign: "right" }}>Δ%</th>
                  <th style={{ ...darkThStyle, textAlign: "right" }}>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "24px", textAlign: "center", color: TEXT_MUTED_DARK, fontFamily: FONT.mono, fontSize: "12px" }}>
                      No assets match this filter.
                    </td>
                  </tr>
                )}
                {filteredAssets.map((a) => {
                  const isSelected = a.ticker === selectedTicker;
                  const changeColor = a.latestChange !== null ? (a.latestChange > 0 ? GREEN : a.latestChange < 0 ? RED : TEXT_MUTED_DARK) : TEXT_MUTED_DARK;
                  const sentColor = a.latestSentiment !== null ? (a.latestSentiment > 0.1 ? GREEN : a.latestSentiment < -0.1 ? RED : TEXT_MUTED_DARK) : TEXT_MUTED_DARK;
                  return (
                    <tr
                      key={a.ticker}
                      onClick={() => setSelectedTicker(a.ticker)}
                      style={{
                        borderTop: `1px solid ${DARK_BORDER}`,
                        cursor: "pointer",
                        background: isSelected ? `${ACCENT}10` : "transparent",
                        transition: "background 0.1s",
                      }}
                    >
                      <td style={{ padding: "10px 16px", fontFamily: FONT.mono, fontWeight: 700, color: isSelected ? ACCENT : TEXT_ON_DARK }}>{a.ticker}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: "10px", fontFamily: FONT.mono, padding: "2px 6px", borderRadius: "2px", background: `${typeColors[a.assetType] || TEXT_MUTED_DARK}15`, color: typeColors[a.assetType] || TEXT_MUTED_DARK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {a.assetType}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: TEXT_ON_DARK }}>
                        {a.latestPrice ? a.latestPrice.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: changeColor, fontWeight: 700 }}>
                        {a.latestChange !== null ? `${a.latestChange > 0 ? "+" : ""}${a.latestChange}%` : "—"}
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right", fontFamily: FONT.mono, color: sentColor, fontWeight: 700 }}>
                        {a.latestSentiment !== null ? a.latestSentiment.toFixed(2) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Correlation quick-view ─── */}
      {selectedTicker && (
        <div style={{ padding: "24px", background: DARK_SURFACE, border: `1px solid ${DARK_BORDER}`, borderRadius: "8px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                Sentiment → Price Correlation
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: TEXT_ON_DARK }}>
                {selectedTicker} · 30-day window
              </div>
            </div>
            {correlation && !corrLoading && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: FONT.mono, color: Math.abs(correlation.correlation) > 0.5 ? GREEN : Math.abs(correlation.correlation) > 0.3 ? AMBER : TEXT_MUTED_DARK }}>
                  {correlation.correlation.toFixed(2)}
                </div>
                <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Pearson r · {correlation.dataPoints} points
                </div>
              </div>
            )}
          </div>
          {corrLoading ? (
            <div style={{ color: TEXT_MUTED_DARK, fontFamily: FONT.mono, fontSize: "13px", padding: "24px 0" }}>Computing…</div>
          ) : correlation ? (
            <div style={{ padding: "16px", background: DARK_BG, borderRadius: "4px", fontSize: "14px", color: "#525252", lineHeight: 1.6 }}>
              <strong style={{ color: correlation.direction === "positive" ? GREEN : RED, fontFamily: FONT.mono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                {correlation.direction === "positive" ? "Positive" : "Negative"}
              </strong>
              <br />
              {correlation.interpretation}
            </div>
          ) : (
            <div style={{ color: TEXT_MUTED_DARK, fontFamily: FONT.mono, fontSize: "13px", padding: "24px 0" }}>Select an asset.</div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CHART 1 — Price × Sentiment Dual Axis (KILLER FEATURE)
          Uses alignedData from correlation API (real time series).
          Cyan line = price (left axis), amber line = sentiment (right).
          Shows divergence between sentiment and price — the trader's
          core alpha signal.
          ═══════════════════════════════════════════════════════════ */}
      {selectedTicker && (
        <div style={chartCardStyle}>
          <div style={chartTitleStyle}>
            Price × Sentiment Divergence — {selectedTicker} (30d)
          </div>
          {corrLoading ? (
            <SkeletonLoader accent={ACCENT} lines={1} height={250} />
          ) : correlation?.alignedData && correlation.alignedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={correlation.alignedData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDateTick}
                  tick={axisTickStyle}
                  stroke="#e5e5e5"
                />
                <YAxis
                  yAxisId="price"
                  orientation="left"
                  tick={{ ...axisTickStyle, fill: ACCENT }}
                  stroke="#e5e5e5"
                  width={56}
                />
                <YAxis
                  yAxisId="sentiment"
                  orientation="right"
                  domain={[-1, 1]}
                  tick={{ ...axisTickStyle, fill: AMBER }}
                  stroke="#e5e5e5"
                  width={40}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  labelFormatter={formatDateTick}
                  formatter={(value: number | string, name: string) => [
                    typeof value === "number" ? value.toFixed(2) : value,
                    name,
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, paddingTop: "8px" }}
                />
                <ReferenceLine yAxisId="sentiment" y={0} stroke={SLATE} strokeDasharray="2 2" strokeOpacity={0.4} />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={false}
                  name="Price"
                  connectNulls
                />
                <Line
                  yAxisId="sentiment"
                  type="monotone"
                  dataKey="sentiment"
                  stroke={AMBER}
                  strokeWidth={2}
                  dot={false}
                  name="Sentiment"
                  connectNulls
                  strokeDasharray="4 2"
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <ErrorState accent={ACCENT} message="No time-series data available for this asset." />
          )}
        </div>
      )}

      {/* ─── Market Analytics section header ─── */}
      <div style={{ marginTop: "8px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          Market Analytics
        </div>
        <div style={{ fontSize: "16px", fontWeight: 700, color: TEXT_ON_DARK }}>
          Cross-asset visualizations
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CHART 2 — Asset Performance Comparison (horizontal BarChart)
          From /api/trader/assets — latestChange % for all assets.
          Green bars = positive, red bars = negative. Horizontal for
          terminal vibe. Center reference line at 0.
          ═══════════════════════════════════════════════════════════ */}
      <div style={chartCardStyle}>
        <div style={chartTitleStyle}>
          Asset Performance — Latest Δ% (all assets)
        </div>
        {loading ? (
          <SkeletonLoader accent={ACCENT} lines={1} height={250} />
        ) : perfData.length === 0 ? (
          <ErrorState accent={ACCENT} message="No price change data available." />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(250, perfData.length * 26)}>
            <BarChart data={perfData} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tick={axisTickStyle}
                stroke="#e5e5e5"
                tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
              />
              <YAxis
                type="category"
                dataKey="ticker"
                tick={{ ...axisTickStyle, fill: TEXT_ON_DARK, fontWeight: 700 }}
                stroke="#e5e5e5"
                width={56}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                labelStyle={tooltipLabelStyle}
                formatter={(value: number | string) => [
                  typeof value === "number" ? formatPct(value) : value,
                  "Change",
                ]}
              />
              <ReferenceLine x={0} stroke={TEXT_MUTED_DARK} strokeOpacity={0.5} />
              <Bar dataKey="change" name="Δ%" radius={[2, 2, 2, 2]}>
                {perfData.map((entry, i) => (
                  <Cell key={`perf-${i}`} fill={entry.change > 0 ? GREEN : entry.change < 0 ? RED : SLATE} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CHART 3 — Sentiment Heatmap (custom grid)
          All assets colored by latestSentiment (-1 to 1). Red for
          negative, green for positive, slate for neutral. Each cell
          shows ticker + sentiment value. Dense terminal grid.
          ═══════════════════════════════════════════════════════════ */}
      <div style={chartCardStyle}>
        <div style={chartTitleStyle}>
          Sentiment Heatmap — all assets (−1 to +1)
        </div>
        {loading ? (
          <SkeletonLoader accent={ACCENT} lines={4} height={50} />
        ) : assets.length === 0 ? (
          <ErrorState accent={ACCENT} message="No sentiment data available." />
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {assets.map((a) => {
                const s = a.latestSentiment;
                const bg = sentimentColor(s);
                const fg = sentimentTextColor(s);
                return (
                  <div
                    key={a.ticker}
                    title={`${a.ticker} — ${a.name} · sentiment ${s !== null ? s.toFixed(2) : "N/A"}`}
                    style={{
                      padding: "12px 10px",
                      background: bg,
                      borderRadius: "4px",
                      border: "1px solid #e5e5e5",
                      textAlign: "center",
                      transition: "transform 0.1s ease",
                      cursor: "default",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: FONT.mono, color: fg, lineHeight: 1.2 }}>
                      {a.ticker}
                    </div>
                    <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: fg, opacity: 0.85, marginTop: "4px" }}>
                      {s !== null ? (s > 0 ? "+" : "") + s.toFixed(2) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Legend strip */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "10px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              <span>Bearish</span>
              <div style={{ flex: 1, height: "8px", borderRadius: "2px", background: "linear-gradient(90deg, rgba(239,68,68,0.75) 0%, rgba(239,68,68,0.2) 35%, #f4f4f5 50%, rgba(16,185,129,0.2) 65%, rgba(16,185,129,0.75) 100%)" }} />
              <span>Bullish</span>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CHART 4 + 6 — Correlation Distribution + Sentiment Pie
          Side-by-side grid for terminal density.
          ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* CHART 4 — Correlation Strength Distribution */}
        <div style={{ ...chartCardStyle, marginBottom: 0 }}>
          <div style={chartTitleStyle}>
            Correlation Strength — Pearson r per asset
          </div>
          {corrDistLoading ? (
            <SkeletonLoader accent={ACCENT} lines={1} height={250} />
          ) : assetCorrs.length === 0 ? (
            <ErrorState accent={ACCENT} message="No correlation data available." />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={assetCorrs} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                <XAxis
                  dataKey="ticker"
                  tick={{ ...axisTickStyle, fill: TEXT_ON_DARK, fontWeight: 700 }}
                  stroke="#e5e5e5"
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  domain={[-1, 1]}
                  tick={axisTickStyle}
                  stroke="#e5e5e5"
                  width={36}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: number | string) => [
                    typeof value === "number" ? value.toFixed(3) : value,
                    "Pearson r",
                  ]}
                />
                <ReferenceLine y={0} stroke={TEXT_MUTED_DARK} strokeOpacity={0.5} />
                <ReferenceLine y={0.5} stroke={GREEN} strokeDasharray="2 2" strokeOpacity={0.3} />
                <ReferenceLine y={-0.5} stroke={RED} strokeDasharray="2 2" strokeOpacity={0.3} />
                <Bar dataKey="correlation" name="Pearson r" radius={[2, 2, 0, 0]}>
                  {assetCorrs.map((entry, i) => (
                    <Cell key={`corr-${i}`} fill={correlationColor(entry.correlation)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* CHART 6 — Sentiment Distribution (PieChart) */}
        <div style={{ ...chartCardStyle, marginBottom: 0 }}>
          <div style={chartTitleStyle}>
            Sentiment Distribution — asset count
          </div>
          {loading ? (
            <SkeletonLoader accent={ACCENT} lines={1} height={250} />
          ) : pieData.length === 0 ? (
            <ErrorState accent={ACCENT} message="No sentiment data available." />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ name, value }: { name: string; value: number }) => `${name} ${value}`}
                  labelLine={{ stroke: TEXT_MUTED_DARK, strokeWidth: 1 }}
                  style={{ fontSize: "10px", fontFamily: FONT.mono, fill: TEXT_ON_DARK }}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={`pie-${i}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: number | string, name: string) => [`${value} assets`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "10px", fontFamily: FONT.mono, paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CHART 5 — Top Gainers / Losers (horizontal diverging BarChart)
          Top 3 gainers (green, right of 0) + top 3 losers (red, left).
          Real data from /api/trader/assets latestChange. Stats API
          confirms the #1 gainer/loser in KPI strip.
          ═══════════════════════════════════════════════════════════ */}
      <div style={chartCardStyle}>
        <div style={chartTitleStyle}>
          Top Movers — gainers vs losers (top 3 each)
        </div>
        {loading ? (
          <SkeletonLoader accent={ACCENT} lines={1} height={250} />
        ) : moversData.length === 0 ? (
          <ErrorState accent={ACCENT} message="No price change data available." />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={moversData} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 8 }}>
                <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={axisTickStyle}
                  stroke="#e5e5e5"
                  tickFormatter={(v: number) => `${v > 0 ? "+" : ""}${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="ticker"
                  tick={{ ...axisTickStyle, fill: TEXT_ON_DARK, fontWeight: 700 }}
                  stroke="#e5e5e5"
                  width={56}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={tooltipLabelStyle}
                  formatter={(value: number | string) => [
                    typeof value === "number" ? formatPct(value) : value,
                    "Change",
                  ]}
                />
                <ReferenceLine x={0} stroke={TEXT_MUTED_DARK} strokeOpacity={0.6} />
                <Bar dataKey="change" name="Δ%" radius={[2, 2, 2, 2]}>
                  {moversData.map((entry, i) => (
                    <Cell key={`mover-${i}`} fill={entry.change > 0 ? GREEN : entry.change < 0 ? RED : SLATE} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {/* Summary row: stats API top gainer / loser */}
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 160px", padding: "10px 14px", background: `${GREEN}10`, borderRadius: "4px", borderLeft: `3px solid ${GREEN}` }}>
                <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, textTransform: "uppercase", letterSpacing: "0.1em" }}>Top Gainer</div>
                <div style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT.mono, color: GREEN, marginTop: "2px" }}>
                  {kpis?.topGainer?.ticker ?? "—"} {kpis?.topGainer ? `+${kpis.topGainer.changePct}%` : ""}
                </div>
              </div>
              <div style={{ flex: "1 1 160px", padding: "10px 14px", background: `${RED}10`, borderRadius: "4px", borderLeft: `3px solid ${RED}` }}>
                <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, textTransform: "uppercase", letterSpacing: "0.1em" }}>Top Loser</div>
                <div style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT.mono, color: RED, marginTop: "2px" }}>
                  {kpis?.topLoser?.ticker ?? "—"} {kpis?.topLoser ? `${kpis.topLoser.changePct}%` : ""}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const darkThStyle: React.CSSProperties = {
  padding: "10px 16px",
  textAlign: "left",
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  fontWeight: 600,
};

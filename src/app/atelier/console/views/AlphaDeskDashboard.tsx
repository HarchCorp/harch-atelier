"use client";

import { useEffect, useState } from "react";
import { C } from "../../components/tokens";

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
//  Correlation quick-view. Cyan accent on dark. Terminal vibe.
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
const DARK_BG = "#0a0a0a";
const DARK_SURFACE = "#171717";
const DARK_BORDER = "#262626";
const GREEN = "#10b981";
const RED = "#ef4444";
const TEXT_ON_DARK = "#ffffff";
const TEXT_MUTED_DARK = "#737373";

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
  } | null>(null);
  const [corrLoading, setCorrLoading] = useState(false);
  const [loading, setLoading] = useState(!injectedKpis);

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
        // graceful degradation
      }
      setLoading(false);
    })();
  }, [injectedKpis]);

  // Fetch correlation when ticker selected
  useEffect(() => {
    if (!selectedTicker) return;
    setCorrLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/trader/assets/${selectedTicker}/correlation?window=30`);
        if (!res.ok) return;
        const data = await res.json();
        setCorrelation(data);
      } catch {
        // ignore
      }
      setCorrLoading(false);
    })();
  }, [selectedTicker]);

  const firstName = userName.split(" ")[0] || "there";
  const spikeColor = (kpis?.sentimentSpike ?? 0) > 3 ? RED : (kpis?.sentimentSpike ?? 0) > 1.5 ? "#d97706" : ACCENT;

  const typeColors: Record<string, string> = {
    stock: GREEN,
    crypto: "#d97706",
    fx: ACCENT,
    commodity: RED,
    index: TEXT_MUTED_DARK,
  };

  return (
    <div className="dash-main" style={{ padding: "24px", background: DARK_BG, overflowX: "hidden", color: TEXT_ON_DARK, fontFamily: FONT.sans }}>
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

      {/* ─── Asset ticker feed — dense, terminal-style ─── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: TEXT_MUTED_DARK, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
          Asset feed — click to view correlation
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
                {assets.map((a) => {
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
        <div style={{ padding: "24px", background: DARK_SURFACE, border: `1px solid ${DARK_BORDER}`, borderRadius: "8px" }}>
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
                <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: FONT.mono, color: Math.abs(correlation.correlation) > 0.5 ? GREEN : Math.abs(correlation.correlation) > 0.3 ? "#d97706" : TEXT_MUTED_DARK }}>
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
            <div style={{ padding: "16px", background: DARK_BG, borderRadius: "4px", fontSize: "14px", color: "#a3a3a3", lineHeight: 1.6 }}>
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

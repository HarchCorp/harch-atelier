"use client";

import { useEffect, useState } from "react";
import { C } from "../../components/tokens";
import { SkeletonLoader, ErrorState } from "./SkeletonLoader";

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
  const [loading, setLoading] = useState(!injectedKpis);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (injectedKpis) return;
    (async () => {
      try {
        const res = await fetch("/api/console/weather");
        if (!res.ok) return;
        const data = await res.json();
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
      } catch {
        setError(true);
      }
      setLoading(false);
    })();
  }, [injectedKpis]);

  const firstName = userName.split(" ")[0] || "there";
  const score = kpis?.reputationScore ?? 67;
  const skyColor = score >= 70 ? ACCENT : score >= 50 ? "#f59e0b" : "#ef4444";

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
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
          {companyName}
        </div>
        <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.02em" }}>
          Reputation Weather
        </h3>
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

      {/* ─── Today's signals ─── */}
      {signals.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: "#737373", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Today's signals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {signals.map((signal, i) => (
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
                }}
              >
                <span style={{ fontFamily: FONT.mono, fontSize: "12px", color: "#737373", minWidth: "48px" }}>{signal.time}</span>
                <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: ACCENT, minWidth: "80px" }}>{signal.source}</span>
                <span style={{ fontSize: "14px", color: "#0a0a0a", flex: 1, minWidth: "200px" }}>{signal.title}</span>
              </div>
            ))}
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

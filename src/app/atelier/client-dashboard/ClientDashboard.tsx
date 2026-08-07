"use client";

import { useState, useEffect } from "react";
import { C } from "../components/tokens";
import BrandBadge from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  CLIENT DASHBOARD — the page a paying client sees
//
//  This is the REAL B2B SaaS dashboard. Not the console shell
//  (which is for demo/internal). This is what a client sees when
//  they log in: their company's reputation score, their alerts,
//  their articles, their AI visibility, their WhatsApp digest.
//
//  Everything is fetched from Neon with their companyId.
// ═══════════════════════════════════════════════════════════════

interface DashboardData {
  companyName: string;
  score: number;
  trend: string;
  crisisScore: number;
  crisisLevel: string;
  mentionCount24h: number;
  sentiment: { positive: number; neutral: number; negative: number };
  aiVisibility: { engine: string; score: number }[];
  topArticle: string | null;
  alertCount: number;
  recommendation: string;
  source: string;
}

export function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/console/brand-health").then(r => r.ok ? r.json() : null),
      fetch("/api/console/crisis-alerts").then(r => r.ok ? r.json() : null),
      fetch("/api/console/whatsapp-digest").then(r => r.ok ? r.json() : null),
    ]).then(([health, alerts, digest]) => {
      if (health) {
        setData({
          companyName: digest?.companyName || "Your Company",
          score: health.score,
          trend: health.trend,
          crisisScore: health.crisisScore,
          crisisLevel: health.crisisLevel,
          mentionCount24h: health.mentionCount24h,
          sentiment: health.sentiment,
          aiVisibility: health.aiVisibility,
          topArticle: digest?.topArticle,
          alertCount: alerts?.count || 0,
          recommendation: health.recommendation,
          source: health.source,
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.fontMono, color: C.textMuted, fontSize: "14px" }}>Loading your dashboard…</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ minHeight: "100vh", background: C.bgSubtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <div style={{ fontFamily: C.fontMono, color: C.text, fontSize: "16px", fontWeight: 600 }}>No data available</div>
          <div style={{ fontFamily: C.fontMono, color: C.textMuted, fontSize: "13px", marginTop: "8px" }}>Contact support@harchcorp.com</div>
        </div>
      </div>
    );
  }

  const crisisColor = data.crisisLevel === "critical" ? "#ef4444" : data.crisisLevel === "warning" ? "#f59e0b" : data.crisisLevel === "watch" ? "#3b82f6" : "#10b981";

  return (
    <div style={{ minHeight: "100vh", background: C.bgSubtle, fontFamily: C.fontSans, color: C.text, display: "flex", flexDirection: "column" }}>
      <header style={{
        padding: "16px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        background: C.bg,
      }}>
        <BrandBadge size="sm" theme="light" />
        <span style={{
          fontFamily: C.fontMono,
          fontSize: "10px",
          color: C.accent,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          borderLeft: `1px solid ${C.border}`,
          paddingLeft: "10px",
        }}>
          Client Dashboard
        </span>
      </header>
      
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px", flex: 1, width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: C.accent, textTransform: "uppercase", marginBottom: "8px" }}>
            {data.source === "neon" ? "LIVE DATA" : "DEMO DATA"} · {data.companyName}
          </div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Reputation Intelligence
          </h1>
        </div>

        {/* KPI Strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Reputation Score</div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: data.score >= 70 ? "#10b981" : data.score >= 50 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>{data.score}<span style={{ fontSize: "16px", color: C.textMuted }}>/100</span></div>
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>Trend: {data.trend}</div>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Crisis Level</div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: crisisColor, textTransform: "uppercase" }}>{data.crisisLevel}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>Score: {data.crisisScore}/100</div>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Mentions 24h</div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: C.text, lineHeight: 1 }}>{data.mentionCount24h.toLocaleString()}</div>
            <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px" }}>{data.alertCount} alerts</div>
          </div>

          <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>Sentiment</div>
            <div style={{ display: "flex", height: "24px", borderRadius: "4px", overflow: "hidden", gap: "2px", marginBottom: "8px" }}>
              <div style={{ width: `${data.sentiment.positive}%`, background: "#10b981" }} />
              <div style={{ width: `${data.sentiment.neutral}%`, background: "#71717a", opacity: 0.4 }} />
              <div style={{ width: `${data.sentiment.negative}%`, background: "#ef4444" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: C.fontMono }}>
              <span style={{ color: "#10b981" }}>{data.sentiment.positive}%</span>
              <span style={{ color: C.textMuted }}>{data.sentiment.neutral}%</span>
              <span style={{ color: "#ef4444" }}>{data.sentiment.negative}%</span>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px", borderLeft: `4px solid ${crisisColor}` }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>
            HarchIQ Recommendation
          </div>
          <p style={{ margin: 0, fontSize: "15px", color: C.text, lineHeight: 1.6 }}>{data.recommendation}</p>
        </div>

        {/* AI Visibility */}
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "16px" }}>
            AI Engine Visibility
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.aiVisibility.map((ai, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 40px", gap: "12px", alignItems: "center" }}>
                <span style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.textBody }}>{ai.engine}</span>
                <div style={{ height: "8px", background: C.bgHover, borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${ai.score}%`, background: ai.score >= 70 ? "#10b981" : ai.score >= 50 ? "#f59e0b" : "#ef4444", borderRadius: "4px", transition: "width 1s" }} />
                </div>
                <span style={{ fontFamily: C.fontMono, fontSize: "13px", fontWeight: 700, color: C.text, textAlign: "right" }}>{ai.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a href="/atelier/console/brand-monitor" style={{ padding: "14px 24px", background: C.cta, color: "#fff", borderRadius: "10px", textDecoration: "none", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600 }}>
            Open Full Console →
          </a>
        </div>
      </main>

      <footer style={{
        padding: "12px 24px",
        borderTop: `1px solid ${C.border}`,
        background: C.bg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: C.fontMono,
        fontSize: "10px",
        color: C.textMuted,
        letterSpacing: "0.05em",
      }}>
        <span>HarchIQ · Client Dashboard</span>
        <span>Private workspace · English only</span>
      </footer>
    </div>
  );
}

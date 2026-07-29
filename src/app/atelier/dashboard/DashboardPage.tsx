"use client";

import { useState, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", text: "#0A0A0A", textSec: "#525252",
  textMuted: "#71717A", accent: "#4A5D6E", sage: "#4A7B5F",
  sageBright: "#6FA386", red: "#A0524B",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

// ─── DEMO AUDIT DATA ───────────────────────────────────────────────
// Anonymous visitors (no NextAuth session) get a 401 from
// /atelier/api/audit. Instead of erroring out, we render this static
// mock payload so the dashboard is still useful for prospects and
// investors exploring the product. All numbers are illustrative.
const DEMO_AUDIT_DATA = {
  reportDate: new Date().toISOString().slice(0, 10),
  processingTimeMs: 0,
  reputation: {
    score: 72,
    scoreComponents: { sentiment: 68, aiVisibility: 75, volume: 70, authority: 65 },
    mediaMetrics: { totalArticles: 142, totalMentions: 318, uniqueSources: 27 },
    aiMetrics: {
      totalCitations: 3,
      chatgpt: { cited: true, position: 2 },
      perplexity: { cited: true, position: 1 },
      googleAI: { cited: true, position: 4 },
      glm: { cited: false, position: "—" },
    },
    sentiment: { positive: 54, neutral: 31, negative: 15 },
    risk: {
      overallRisk: 38,
      riskLevel: "moderate",
      activeRisks: [
        { topic: "Governance — board reshuffle coverage", severity: 52, recommendation: "Prepare a holding statement and brief tier-1 journalists before the next earnings call." },
      ],
    },
    recommendations: [
      { priority: "high", action: "Issue a clarifying press release on Q2 governance changes", rationale: "Coverage tone shifted negative after the AGM; a proactive statement would reset the narrative.", timeline: "5 days" },
      { priority: "medium", action: "Engage GLM-4 visibility probe for francophone queries", rationale: "GLM is the only major engine not yet citing the brand — likely a corpus gap, not a sentiment issue.", timeline: "2 weeks" },
    ],
  },
  topics: [
    { riskLevel: "medium", label: "Gouvernance & conseil d'administration", articleCount: 18 },
    { riskLevel: "low", label: "Résultats financiers Q2", articleCount: 31 },
    { riskLevel: "low", label: "Inclusion financière & mobile banking", articleCount: 24 },
    { riskLevel: "high", label: "Risque pays — note Moody's", articleCount: 9 },
  ],
  topArticles: [
    { title: "Bank of Africa publie un résultat net en hausse de 12% au premier semestre", url: "https://example.com/bofa-q2", sourceName: "L'Économiste", publishedAt: "2026-07-12", sentiment: "positive" },
    { title: "Remaniement du conseil d'administration : ce qu'il faut retenir", url: "https://example.com/bofa-board", sourceName: "Médias24", publishedAt: "2026-07-09", sentiment: "neutral" },
    { title: "Moody's revoit à la baisse la perspective du secteur bancaire marocain", url: "https://example.com/moodys", sourceName: "TelQuel", publishedAt: "2026-07-05", sentiment: "negative" },
  ],
};

export default function DashboardPage() {
  const [companyName, setCompanyName] = useState("Bank of Africa");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // Non-blocking status banner (demo mode, async-queued, …). Kept
  // separate from `error` so we can style it as info, not as a fault.
  const [notice, setNotice] = useState<string | null>(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/atelier/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      // 401 — the audit endpoint is NextAuth-gated and we have no
      // session. Fall back to demo data so the page is still useful
      // to anonymous visitors (prospects, investors).
      if (res.status === 401) {
        setData({ ...DEMO_AUDIT_DATA, companyName });
        setNotice(
          "Demo mode — sign in to run a live audit. Numbers below are illustrative sample data.",
        );
        setLoading(false);
        return;
      }

      // 202 — the audit API is async (BullMQ-enqueued). It returns
      // { jobId, status, pollUrl, company } — NOT the legacy
      // { success, data } contract this dashboard was originally
      // written against. Surface the jobId so the user knows the
      // request was accepted; live polling is a separate workstream.
      if (res.status === 202) {
        const queued = await res.json().catch(() => null);
        setNotice(
          `Audit queued${queued?.jobId ? ` (job #${queued.jobId})` : ""}. ` +
            "Live progress polling coming soon — you'll receive the result via your WhatsApp daily digest.",
        );
        setLoading(false);
        return;
      }

      // Other non-OK responses — surface the API's error message.
      if (!res.ok) {
        let msg = `Audit failed (HTTP ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson?.error) msg = errJson.error;
        } catch {
          /* response body wasn't JSON */
        }
        setError(msg);
        setLoading(false);
        return;
      }

      // Legacy happy path — kept for forward-compat in case the API
      // ever returns a synchronous { success, data } payload again.
      const json = await res.json();
      if (json?.success && json?.data) {
        setData(json.data);
      } else {
        setError("Unexpected response from audit API");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    }
    setLoading(false);
  };

  // NOTE: we intentionally do NOT call runAudit() on mount. The audit
  // endpoint requires a NextAuth session AND enqueues a BullMQ job —
  // auto-firing on every page load would (a) 401 for anonymous
  // visitors and (b) waste queue capacity. The user must explicitly
  // click "Run audit". (Previous code did `useEffect(() => runAudit(),
  // [])` which was the root cause of AUDIT-1 P1 dashboard bug.)

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* Hero */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px 40px" }}>
        <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Live Dashboard
        </div>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: C.text, margin: "0 0 16px" }}>
          Reputation Intelligence
        </h1>
        <p style={{ fontSize: "18px", color: C.textSec, maxWidth: "640px", marginBottom: "32px" }}>
          Real-time reputation monitoring powered by HarchIQ. Enter any company name to run a full audit.
        </p>

        {/* Search bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runAudit()}
            placeholder="Company name (e.g. Bank of Africa, Maroc Telecom, OCP Group)"
            style={{
              flex: 1, padding: "14px 20px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "8px",
              fontSize: "15px", color: C.text, fontFamily: "'Inter', sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={runAudit}
            disabled={loading}
            style={{
              padding: "14px 28px", background: C.sage, color: "#FFFFFF",
              border: "none", borderRadius: "8px", fontSize: "15px",
              fontWeight: 600, fontFamily: "'Inter', sans-serif",
              cursor: loading ? "wait" : "pointer", whiteSpace: "nowrap",
            }}
          >
            {loading ? "Analyzing..." : "Run audit →"}
          </button>
        </div>
      </section>

      {/* Results */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px 80px" }}>
        {notice && !loading && (
          <div style={{
            padding: "16px 20px", marginBottom: "24px",
            background: "rgba(74,93,110,0.06)",
            border: `1px solid ${C.accent}`, borderRadius: "8px",
            color: C.text, fontSize: "14px",
          }}>
            <strong style={{ color: C.accent }}>ℹ</strong> {notice}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
            <div style={{ fontSize: "18px", color: C.textSec }}>Scraping 30+ media sources and analyzing sentiment...</div>
            <div style={{ fontSize: "14px", color: C.textMuted, marginTop: "8px", fontFamily: "'JetBrains Mono', monospace" }}>
              This takes 30-60 seconds
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: "24px", background: "rgba(160,82,75,0.05)", border: `1px solid ${C.red}`, borderRadius: "8px", color: C.red }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {data && !loading && (
          <div>
            {/* Score header */}
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "32px", marginBottom: "40px", alignItems: "center" }}>
              <ScoreRing score={data.reputation.score} />
              <div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>
                  {data.companyName}
                </div>
                <div style={{ fontSize: "14px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
                  {data.reportDate} · Processed in {(data.processingTimeMs / 1000).toFixed(1)}s
                </div>
                {/* Score breakdown */}
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  <ScoreComponent label="Sentiment" value={data.reputation.scoreComponents.sentiment} weight="40%" />
                  <ScoreComponent label="AI Visibility" value={data.reputation.scoreComponents.aiVisibility} weight="30%" />
                  <ScoreComponent label="Volume" value={data.reputation.scoreComponents.volume} weight="20%" />
                  <ScoreComponent label="Authority" value={data.reputation.scoreComponents.authority} weight="10%" />
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
              <KPICard label="Articles" value={data.reputation.mediaMetrics.totalArticles} />
              <KPICard label="Mentions" value={data.reputation.mediaMetrics.totalMentions} />
              <KPICard label="Sources" value={data.reputation.mediaMetrics.uniqueSources} />
              <KPICard label="AI Citations" value={`${data.reputation.aiMetrics.totalCitations}/4`} />
            </div>

            {/* Sentiment bar */}
            <Card title="Sentiment Breakdown">
              <SentimentBar
                positive={data.reputation.sentiment.positive}
                neutral={data.reputation.sentiment.neutral}
                negative={data.reputation.sentiment.negative}
              />
              <div style={{ display: "flex", gap: "24px", marginTop: "12px" }}>
                <Legend color={C.sage} label="Positive" value={`${data.reputation.sentiment.positive}%`} />
                <Legend color={C.textMuted} label="Neutral" value={`${data.reputation.sentiment.neutral}%`} />
                <Legend color={C.red} label="Negative" value={`${data.reputation.sentiment.negative}%`} />
              </div>
            </Card>

            {/* AI Visibility */}
            <Card title="AI Engine Visibility">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {[
                  { name: "ChatGPT", data: data.reputation.aiMetrics.chatgpt },
                  { name: "Perplexity", data: data.reputation.aiMetrics.perplexity },
                  { name: "Google AI", data: data.reputation.aiMetrics.googleAI },
                  { name: "Claude", data: data.reputation.aiMetrics.glm },
                ].map(engine => (
                  <div key={engine.name} style={{ textAlign: "center", padding: "20px", background: C.surfaceAlt, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: C.text, marginBottom: "8px" }}>{engine.name}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: engine.data.cited ? C.sage : C.red }}>
                      {engine.data.cited ? "✓" : "✗"}
                    </div>
                    <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                      {engine.data.position}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card title="Risk Assessment">
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <div style={{
                  fontSize: "36px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: data.reputation.risk.overallRisk >= 60 ? C.red : data.reputation.risk.overallRisk >= 40 ? "#C4964A" : C.sage,
                }}>
                  {data.reputation.risk.overallRisk}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{data.reputation.risk.riskLevel.toUpperCase()}</div>
                  <div style={{ fontSize: "12px", color: C.textMuted }}>Overall risk score</div>
                </div>
              </div>
              {data.reputation.risk.activeRisks.length > 0 ? (
                <div>
                  {data.reputation.risk.activeRisks.slice(0, 3).map((risk: any, i: number) => (
                    <div key={i} style={{ padding: "12px 16px", background: "rgba(160,82,75,0.05)", borderRadius: "6px", marginBottom: "8px", border: `1px solid rgba(160,82,75,0.15)` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{risk.topic}</span>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: C.red, fontFamily: "'JetBrains Mono', monospace" }}>{risk.severity}/100</span>
                      </div>
                      <div style={{ fontSize: "13px", color: C.textSec }}>{risk.recommendation}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "14px", color: C.textMuted }}>No active risks detected.</div>
              )}
            </Card>

            {/* Topic clusters */}
            {data.topics.length > 0 && (
              <Card title="Topic Clusters">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.topics.slice(0, 8).map((topic: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: C.surfaceAlt, borderRadius: "6px", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px",
                          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                          background: topic.riskLevel === "critical" ? C.red : topic.riskLevel === "high" ? "rgba(160,82,75,0.2)" : topic.riskLevel === "medium" ? "rgba(196,150,74,0.2)" : "rgba(74,123,95,0.1)",
                          color: topic.riskLevel === "critical" ? "#FFFFFF" : topic.riskLevel === "high" ? C.red : topic.riskLevel === "medium" ? "#C4964A" : C.sage,
                        }}>
                          {topic.riskLevel}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 500, color: C.text }}>{topic.label}</span>
                      </div>
                      <span style={{ fontSize: "13px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{topic.articleCount} articles</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations */}
            {data.reputation.recommendations.length > 0 && (
              <Card title="AI-Generated Recommendations">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {data.reputation.recommendations.map((rec: any, i: number) => (
                    <div key={i} style={{ padding: "16px", background: C.surfaceAlt, borderRadius: "8px", border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <span style={{
                          fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "4px",
                          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase",
                          background: rec.priority === "critical" ? C.red : rec.priority === "high" ? "rgba(160,82,75,0.15)" : rec.priority === "medium" ? "rgba(196,150,74,0.15)" : "rgba(74,123,95,0.1)",
                          color: rec.priority === "critical" ? "#FFFFFF" : rec.priority === "high" ? C.red : rec.priority === "medium" ? "#C4964A" : C.sage,
                        }}>
                          {rec.priority}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{rec.action}</span>
                      </div>
                      <div style={{ fontSize: "13px", color: C.textSec, marginBottom: "4px" }}>{rec.rationale}</div>
                      <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>Timeline: {rec.timeline}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Top articles */}
            {data.topArticles.length > 0 && (
              <Card title="Top Articles">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.topArticles.map((article: any, i: number) => (
                    <a key={i} href={article.url} target="_blank" rel="noopener noreferrer" style={{
                      display: "block", padding: "14px 16px", background: C.surfaceAlt,
                      borderRadius: "8px", border: `1px solid ${C.border}`, textDecoration: "none",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 600, color: C.text, flex: 1 }}>{article.title}</span>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px",
                          fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", flexShrink: 0,
                          background: article.sentiment === "positive" ? "rgba(74,123,95,0.1)" : article.sentiment === "negative" ? "rgba(160,82,75,0.1)" : "rgba(113,113,122,0.1)",
                          color: article.sentiment === "positive" ? C.sage : article.sentiment === "negative" ? C.red : C.textMuted,
                        }}>
                          {article.sentiment}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
                        {article.sourceName} · {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* WhatsApp preview */}
            <Card title="WhatsApp Daily Digest Preview">
              <WhatsAppPreview message={generateWhatsAppPreview(data)} />
            </Card>
          </div>
        )}

        {!data && !loading && !error && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.textMuted }}>
            Enter a company name and click "Run audit"
          </div>
        )}
      </section>

      {/* ─── Real Agent Intelligence (from /api/intel) ─── */}
      <AgentIntelPanel />

      <AtelierFooter />
      <BackToTop />

      <style>{`
        a:focus-visible, button:focus-visible, input:focus-visible {
          outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px;
        }
      `}</style>
    </>
  );
}

// ─── COMPONENTS ──────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? C.sage : score >= 50 ? C.accent : C.red;
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={radius} fill="none" stroke={C.border} strokeWidth="6" />
      <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 60 60)" />
      <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="800" fill={C.text} fontFamily="JetBrains Mono, monospace">{score}</text>
      <text x="60" y="76" textAnchor="middle" fontSize="10" fill={C.textMuted} fontFamily="JetBrains Mono, monospace">/ 100</text>
    </svg>
  );
}

function ScoreComponent({ label, value, weight }: { label: string; value: number; weight: string }) {
  return (
    <div>
      <div style={{ fontSize: "20px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>{label} ({weight})</div>
    </div>
  );
}

function KPICard({ label, value }: { label: string; value: any }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "20px", boxShadow: C.shadow }}>
      <div style={{ fontSize: "28px", fontWeight: 800, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "6px" }}>{label}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "28px", marginBottom: "24px", boxShadow: C.shadow }}>
      <div style={{ fontSize: "11px", fontWeight: 600, color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "20px" }}>{title}</div>
      {children}
    </div>
  );
}

function SentimentBar({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  return (
    <div style={{ display: "flex", height: "32px", borderRadius: "6px", overflow: "hidden" }}>
      <div style={{ width: `${positive}%`, background: C.sage, transition: "width 0.5s" }} />
      <div style={{ width: `${neutral}%`, background: C.textMuted, transition: "width 0.5s" }} />
      <div style={{ width: `${negative}%`, background: C.red, transition: "width 0.5s" }} />
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: color }} />
      <span style={{ fontSize: "13px", color: C.textSec }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  );
}

function WhatsAppPreview({ message }: { message: string }) {
  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ background: "#075E54", color: "#FFFFFF", padding: "12px 16px", borderRadius: "12px 12px 0 0", fontSize: "14px", fontWeight: 600 }}>
        Harch Intelligence
      </div>
      <div style={{ background: "#DCF8C6", padding: "12px 16px", borderRadius: "0 0 12px 12px", fontSize: "14px", color: "#1A1A1A", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {message}
      </div>
      <div style={{ textAlign: "right", color: "#34B7F1", fontSize: "14px", padding: "4px 16px" }}>✓✓</div>
    </div>
  );
}

function generateWhatsAppPreview(data: any): string {
  const r = data.reputation;
  const today = new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  let msg = `📊 ${data.companyName} — Veille du ${today}\n\n`;
  msg += `Médias: ${r.mediaMetrics.totalArticles} articles (${r.sentiment.positive}% pos, ${r.sentiment.neutral}% neu, ${r.sentiment.negative}% neg)\n`;
  msg += `Score: ${r.score}/100\n`;
  msg += `IA: ${r.aiMetrics.totalCitations}/4 moteurs citent ${data.companyName}\n`;
  if (r.risk.riskLevel === "critical" || r.risk.riskLevel === "high") {
    msg += `\n⚠️ ALERTE: Risque ${r.risk.riskLevel.toUpperCase()}\n`;
  }
  if (r.recommendations.length > 0) {
    msg += `\n→ ${r.recommendations[0].action}\n`;
  }
  msg += `\n→ dashboard.harchcorp.com`;
  return msg;
}

/* ─── Real Agent Intelligence Panel ─── */
function AgentIntelPanel() {
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intel")
      .then((r) => r.json())
      .then((d) => { setIntel(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const mentions = intel?.mentions || [];
  const scores = intel?.scores || [];
  const agents = intel?.agents || [];

  return (
    <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #4A7B5F, #4A5D6E)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z"/><path d="M9 12l2 2 4-4"/></svg>
        </span>
        <div>
          <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Live Agent Intelligence
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "4px 0 0", letterSpacing: "-0.02em" }}>
            Real scraped data — {mentions.length} mentions · {scores.length} brands scored
          </h2>
        </div>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "#4A7B5F15", border: "1px solid #4A7B5F30", fontSize: 11, fontWeight: 700, color: C.sage }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
          AGENTS LIVE
        </span>
      </div>

      {/* Agent status row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        {agents.map((a: any) => (
          <div key={a.agentName} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>{a.agentName}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: a.status === "success" ? "#4A7B5F20" : a.status === "running" ? "#4A5D6E20" : "#A0524B20", color: a.status === "success" ? C.sage : a.status === "running" ? C.accent : C.red }}>{a.status}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{a.itemsProcessed}</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>items processed</div>
          </div>
        ))}
      </div>

      {/* HarchIQ scores */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          HarchIQ Scores — 7 Moroccan brands
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {scores.sort((a: any, b: any) => b.score - a.score).map((s: any) => (
            <div key={s.brand} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.surfaceAlt}` }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: C.textMuted, minWidth: 24, fontSize: 13 }}>#{scores.indexOf(s) + 1}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.text }}>{s.brand}</span>
              <div style={{ width: 100, height: 6, borderRadius: 3, background: C.surfaceAlt, overflow: "hidden" }}>
                <div style={{ width: `${s.score}%`, height: "100%", background: s.score >= 90 ? C.sage : s.score >= 75 ? "#D97706" : C.red, borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, color: C.text, minWidth: 32, textAlign: "right", fontSize: 15 }}>{s.score}</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: s.score >= 90 ? C.sage : s.score >= 75 ? "#D97706" : C.red, minWidth: 28, fontSize: 13 }}>{s.grade}</span>
              <span style={{ fontSize: 12, color: s.trend === "up" ? C.sage : s.trend === "down" ? C.red : C.textMuted, minWidth: 30 }}>{s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest mentions */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
          Latest Media Mentions — scraped from Moroccan sources
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32, color: C.textMuted, fontSize: 13 }}>Loading agent data…</div>
        ) : mentions.length === 0 ? (
          <div style={{ textAlign: "center", padding: 32, color: C.textMuted, fontSize: 13 }}>No mentions yet — run the agents.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mentions.slice(0, 8).map((m: any) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, borderRadius: 8, textDecoration: "none", border: `1px solid ${C.border}`, background: C.surfaceAlt, transition: "border-color 0.15s" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.sentiment === "positive" ? C.sage : m.sentiment === "negative" ? C.red : C.textMuted, marginTop: 5, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{m.title}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, color: C.textMuted }}>
                    <span style={{ fontWeight: 600, color: C.accent }}>{m.brand}</span>
                    <span>·</span>
                    <span>{m.source}</span>
                    <span>·</span>
                    <span style={{ textTransform: "capitalize" }}>{m.sentiment}</span>
                    <span>·</span>
                    <span style={{ background: C.surface, padding: "1px 5px", borderRadius: 3, border: `1px solid ${C.border}`, fontSize: 9, fontWeight: 600 }}>{m.pillar}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 10, color: C.textMuted, textAlign: "center" }}>
          Data scraped by Harch Atelier agents from Le Matin, L'Économiste, Hespress, TelQuel, Médias24 + more · GLM-4 sentiment classification
        </div>
      </div>
    </section>
  );
}

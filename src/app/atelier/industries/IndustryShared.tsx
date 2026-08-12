"use client";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER · INDUSTRY PROFILE — SHARED LAYOUT
//  Reusable template for all 6 industry pages:
//  Banking · Telecom · Mining · Aviation · Retail · Energy
//  14 sections · 5+ chart components · ~1500 words content per page
// ═══════════════════════════════════════════════════════════════

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";
import {
  BarChart,
  HorizontalBarChart,
  LineChart,
  DonutChart,
  Gauge,
  Heatmap,
  RadarChart,
  StackedBar,
  StatCard,
} from "../components/charts/Charts";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

// ─── DATA TYPES ──────────────────────────────────────────────────
export interface TopCompany {
  rank: number;
  name: string;
  score: number;
  sentiment: number;      // %
  shareOfVoice: number;   // %
  aiVisibility: number;   // 0-100
  trend: number[];        // sparkline
}

export interface IndustryData {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  heroStat: string;       // e.g. "Banking · 8 banks tracked · 1,842 data points"

  // Top 4 stat cards
  topStats: {
    companies: number;
    dataPoints: number;
    reputationScore: number;
    riskLevel: string;
    riskLevelColor: string;
  };

  // Reputation gauge + rank distribution
  reputationScore: number;
  rankDistribution: { tier: string; range: string; count: number; color: string }[];

  // Top companies
  topCompanies: TopCompany[];

  // Quarterly trend
  quarterlyTrend: {
    series: { name: string; color: string; points: number[] }[];
    xLabels: string[];
  };

  // Sentiment distribution
  sentiment: { label: string; value: number; color: string }[];

  // Risk radar (7 axes)
  riskRadar: {
    axes: string[];
    series: { name: string; color: string; values: number[] }[];
  };

  // Top 5 risks
  topRisks: { label: string; value: number; sublabel?: string; color?: string }[];

  // Pillar breakdown — top 3 companies (Innovation/Performance/Purpose)
  pillars: {
    company: string;
    segments: { label: string; value: number; color: string }[];
  }[];

  // Topic heatmap — companies × topics
  heatmap: {
    rows: string[];
    cols: string[];
    data: { row: string; col: string; value: number; label?: string }[];
  };

  // Key insights
  insights: { heading: string; body: string }[];

  // AI visibility comparison
  aiVisibility: { label: string; value: number; color?: string }[];
  aiVisibilityNote: string;

  // Methodology note
  methodology: string;

  // Metadata
  meta: {
    title: string;
    description: string;
    keywords: string[];
  };
}

// ─── STYLE HELPERS ───────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: "12px",
  padding: "28px",
  boxShadow: C.shadow,
};

const sectionStyle: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "48px 16px",
  borderTop: `1px solid ${C.border}`,
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: "11px",
  fontFamily: "'JetBrains Mono', monospace",
  color: C.accent,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  marginBottom: "12px",
};

const h2Style: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 40px)",
  fontWeight: 700,
  letterSpacing: "-0.03em",
  lineHeight: 1.1,
  color: C.text,
  margin: "0 0 12px",
  maxWidth: "900px",
};

const subheadStyle: React.CSSProperties = {
  fontSize: "17px",
  color: C.textSec,
  lineHeight: 1.6,
  maxWidth: "760px",
  margin: "0 0 40px",
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: "13px",
  fontFamily: "'JetBrains Mono', monospace",
  color: C.textMuted,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "20px",
};

// ─── MAIN LAYOUT COMPONENT ───────────────────────────────────────
export function IndustryPageLayout({ data }: { data: IndustryData }) {
  const D = data;
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* 1. HERO ────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: D.color, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: D.color, animation: "pulse 2s infinite" }} />
            Industry Profile · {D.slug}
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 24px", maxWidth: "900px",
          }}>
            {D.name}
          </h1>
          <p style={{
            fontSize: "clamp(18px, 2.5vw, 22px)", color: D.color, fontWeight: 600,
            lineHeight: 1.4, marginBottom: "32px", maxWidth: "820px",
          }}>
            {D.tagline}
          </p>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "12px",
            padding: "10px 18px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "8px",
            fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
            color: C.textSec,
          }}>
            <span style={{ color: D.color, fontWeight: 700 }}>{D.heroStat}</span>
          </div>
        </div>
      </section>

      {/* 2. TOP 4 STAT CARDS ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>At a glance</div>
        <h2 style={h2Style}>The numbers behind the industry.</h2>
        <p style={subheadStyle}>
          Continuously monitored across 200+ Moroccan and international sources — newspapers,
          financial filings, social platforms, and AI engine outputs — refreshed every 6 hours.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          <StatCard
            value={D.topStats.companies}
            label="Companies monitored"
            sublabel="Tracked daily across all sources"
            color={D.color}
            trend={{ direction: "stable", value: "since Q1 2025" }}
          />
          <StatCard
            value={D.topStats.dataPoints.toLocaleString()}
            label="Total data points"
            sublabel="Articles × mentions × AI citations"
            color={D.color}
            trend={{ direction: "up", value: "+12% QoQ" }}
          />
          <StatCard
            value={D.topStats.reputationScore}
            label="Industry reputation score"
            sublabel="Weighted average (0–100)"
            color={D.color}
            sparklineData={D.quarterlyTrend.series[0]?.points || []}
          />
          <StatCard
            value={D.topStats.riskLevel}
            label="Risk level"
            sublabel="Composite of 32 risk categories"
            color={D.topStats.riskLevelColor}
            trend={{ direction: D.topStats.riskLevel === "High" || D.topStats.riskLevel === "Elevated" ? "up" : "stable", value: "vs last quarter" }}
          />
        </div>
      </section>

      {/* 3. REPUTATION GAUGE + RANK DISTRIBUTION ─────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Reputation score</div>
        <h2 style={h2Style}>Industry reputation, quantified.</h2>
        <p style={subheadStyle}>
          The Harch Reputation Index blends share of voice, sentiment polarity, AI engine citation
          frequency, and ESG narrative strength into a single 0–100 score, benchmarked quarterly.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Composite score</div>
            <Gauge score={D.reputationScore} color={D.color} label="out of 100" size={220} />
            <div style={{
              marginTop: "16px", padding: "14px 16px",
              background: C.surfaceAlt, borderRadius: "8px",
              fontSize: "13px", color: C.textSec, lineHeight: 1.55,
            }}>
              {D.name} sits at <strong style={{ color: C.text }}>{D.reputationScore}/100</strong> on the
              Harch Reputation Index — benchmarked against {D.topStats.companies} monitored companies
              and {D.topStats.dataPoints.toLocaleString()} analysed data points.
            </div>
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Rank distribution</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {D.rankDistribution.map((r, i) => {
                const total = D.rankDistribution.reduce((s, x) => s + x.count, 0) || 1;
                const pct = (r.count / total) * 100;
                return (
                  <div key={i}>
                    <div style={{
                      display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "baseline",
                      marginBottom: "6px",
                    }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{r.tier}</span>
                        <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>{r.range}</span>
                      </div>
                      <span style={{
                        fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                        color: r.color,
                      }}>
                        {r.count} <span style={{ color: C.textMuted, fontWeight: 400 }}>({Math.round(pct)}%)</span>
                      </span>
                    </div>
                    <div style={{ height: "10px", background: C.surfaceAlt, borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%", background: r.color,
                        borderRadius: "100px",
                        transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: "24px", paddingTop: "20px",
              borderTop: `1px solid ${C.borderLight}`,
              fontSize: "12px", color: C.textMuted, lineHeight: 1.55,
            }}>
              Tier thresholds: <strong style={{ color: C.textSec }}>Tier 1</strong> 80+ (market leader) ·
              <strong style={{ color: C.textSec }}> Tier 2</strong> 65–79 (strong) ·
              <strong style={{ color: C.textSec }}> Tier 3</strong> 50–64 (developing) ·
              <strong style={{ color: C.textSec }}> Tier 4</strong> &lt;50 (at risk).
            </div>
          </div>
        </div>
      </section>

      {/* 4. TOP 5 COMPANIES TABLE ───────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Leaderboard</div>
        <h2 style={h2Style}>Top companies by reputation score.</h2>
        <p style={subheadStyle}>
          Ranked by composite Harch Reputation Index. Sentiment is the share of positive vs negative
          mentions across all monitored sources. AI visibility measures citation frequency by the five
          leading generative AI engines.
        </p>
        <div style={cardStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["#", "Company", "Score", "Sentiment", "Share of voice", "AI visibility", "Trend (4Q)"].map(h => (
                    <th key={h} style={{
                      padding: "12px 14px", fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace", color: C.textMuted,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      textAlign: h === "#" || h === "Score" || h === "Trend (4Q)" ? "center" : "left",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {D.topCompanies.map((c, i) => (
                  <tr key={c.rank} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                    <td style={{ padding: "16px 14px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: i === 0 ? `${D.color}15` : C.surfaceAlt,
                        color: i === 0 ? D.color : C.textSec,
                        fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      }}>{c.rank}</span>
                    </td>
                    <td style={{ padding: "16px 14px", fontSize: "14px", fontWeight: 600, color: C.text }}>
                      {c.name}
                    </td>
                    <td style={{ padding: "16px 14px", textAlign: "center" }}>
                      <span style={{
                        fontSize: "16px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                        color: c.score >= 70 ? C.sage : c.score >= 55 ? C.amber : C.red,
                      }}>{c.score}</span>
                    </td>
                    <td style={{ padding: "16px 14px" }}>
                      <SentimentBar value={c.sentiment} />
                    </td>
                    <td style={{
                      padding: "16px 14px", fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace", color: C.textSec,
                    }}>
                      {c.shareOfVoice}%
                      <div style={{ height: "4px", width: "60px", background: C.surfaceAlt, borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${c.shareOfVoice * 2}%`, height: "100%", background: D.color, borderRadius: "2px" }} />
                      </div>
                    </td>
                    <td style={{
                      padding: "16px 14px", fontSize: "13px",
                      fontFamily: "'JetBrains Mono', monospace", color: C.textSec,
                    }}>
                      {c.aiVisibility}%
                      <div style={{ height: "4px", width: "60px", background: C.surfaceAlt, borderRadius: "2px", marginTop: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${c.aiVisibility}%`, height: "100%", background: C.accent, borderRadius: "2px" }} />
                      </div>
                    </td>
                    <td style={{ padding: "16px 14px", textAlign: "center" }}>
                      <MiniTrend data={c.trend} color={c.trend[c.trend.length - 1] >= c.trend[0] ? C.sage : C.red} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. QUARTERLY TREND LINE CHART ──────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Trajectory</div>
        <h2 style={h2Style}>Quarterly reputation trend.</h2>
        <p style={subheadStyle}>
          The industry's composite reputation score over the last four quarters, benchmarked against
          the cross-industry Harch 100 average where applicable.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Industry reputation score — last 4 quarters</div>
          <LineChart
            series={D.quarterlyTrend.series}
            xLabels={D.quarterlyTrend.xLabels}
            height={280}
            yMax={100}
          />
        </div>
      </section>

      {/* 6. SENTIMENT DISTRIBUTION DONUT ────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Sentiment</div>
        <h2 style={h2Style}>What the conversation feels like.</h2>
        <p style={subheadStyle}>
          Share of positive, neutral, and negative mentions across all monitored sources for the
          industry over the trailing 90 days. A high neutral share often signals low narrative
          engagement — a quieter, less differentiated reputation.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Sentiment split — trailing 90 days</div>
            <DonutChart
              data={D.sentiment}
              size={220}
              thickness={28}
              centerValue={`${Math.round(D.sentiment[0].value / D.sentiment.reduce((s, x) => s + x.value, 0) * 100)}%`}
              centerLabel="positive"
            />
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>How to read this</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <SentimentInsight color={C.sage} label="Positive" value={D.sentiment[0].value}
                desc="Strong coverage of financial results, leadership moves, and product launches. The dominant narrative engine for this industry." />
              <SentimentInsight color={C.accent} label="Neutral" value={D.sentiment[1].value}
                desc="Factual reporting — earnings releases, regulatory filings, routine announcements. Healthy baseline but signals limited share of voice." />
              <SentimentInsight color={C.red} label="Negative" value={D.sentiment[2].value}
                desc="Risk events, disputes, customer complaints, and critical op-eds. The share that comms teams need to actively manage down." />
            </div>
          </div>
        </div>
      </section>

      {/* 7. RISK RADAR ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Risk profile</div>
        <h2 style={h2Style}>Where the industry is most exposed.</h2>
        <p style={subheadStyle}>
          Seven risk dimensions scored 0–100 by Harch's risk engine, which combines mention frequency,
          severity weighting, and forward-looking velocity indicators. Higher scores mean greater
          exposure.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>7-dimension risk radar</div>
            <RadarChart
              axes={D.riskRadar.axes}
              series={D.riskRadar.series}
              size={320}
            />
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Dimension breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {D.riskRadar.axes.map((axis, i) => {
                const v = D.riskRadar.series[0].values[i];
                const color = v >= 70 ? C.red : v >= 50 ? C.amber : C.sage;
                return (
                  <div key={axis} style={{
                    display: "grid", gridTemplateColumns: "120px 1fr 40px",
                    gap: "12px", alignItems: "center",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{axis}</span>
                    <div style={{ height: "8px", background: C.surfaceAlt, borderRadius: "100px", overflow: "hidden" }}>
                      <div style={{ width: `${v}%`, height: "100%", background: color, borderRadius: "100px" }} />
                    </div>
                    <span style={{
                      fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      color, textAlign: "right",
                    }}>{v}</span>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: "20px", paddingTop: "16px",
              borderTop: `1px solid ${C.borderLight}`,
              fontSize: "12px", color: C.textMuted, lineHeight: 1.55,
            }}>
              <span style={{ color: C.red, fontWeight: 700 }}>≥ 70</span> elevated ·
              <span style={{ color: C.amber, fontWeight: 700 }}> 50–69</span> moderate ·
              <span style={{ color: C.sage, fontWeight: 700 }}> &lt;50</span> contained.
            </div>
          </div>
        </div>
      </section>

      {/* 8. TOP 5 RISKS HORIZONTAL BAR ──────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Active risks</div>
        <h2 style={h2Style}>Top 5 risks, ranked by severity.</h2>
        <p style={subheadStyle}>
          Severity score = Frequency × Impact × Velocity, normalised 0–100. These are the five most
          material reputational risks Harch's engine has flagged for the industry in the last 90 days.
        </p>
        <div style={cardStyle}>
          <HorizontalBarChart
            data={D.topRisks}
            color={D.color}
            showValues
          />
          <div style={{
            marginTop: "24px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "16px",
          }}>
            {[
              { band: "Critical", range: "75+", color: C.red, action: "War-room now" },
              { band: "High", range: "60–74", color: C.amber, action: "Comms plan active" },
              { band: "Moderate", range: "40–59", color: C.accent, action: "Monitor weekly" },
              { band: "Low", range: "<40", color: C.sage, action: "Quarterly review" },
            ].map(b => (
              <div key={b.band} style={{
                padding: "12px 14px", background: C.surfaceAlt, borderRadius: "8px",
                borderLeft: `3px solid ${b.color}`,
              }}>
                <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{b.band}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace", margin: "4px 0" }}>{b.range}</div>
                <div style={{ fontSize: "12px", color: C.textSec }}>{b.action}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PILLAR BREAKDOWN STACKED BAR ────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Reputation composition</div>
        <h2 style={h2Style}>How the top players are built.</h2>
        <p style={subheadStyle}>
          The Harch Reputation Index weights three pillars — <strong>Innovation</strong>,
          <strong> Performance</strong>, and <strong>Purpose</strong> — to compute each company's
          composite score. The mix reveals whether reputation is driven by financial strength,
          forward-looking narrative, or ESG/social licence.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Pillar weighting — top 3 companies</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {D.pillars.map((p, i) => (
              <div key={i}>
                <div style={{
                  display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "baseline",
                  marginBottom: "8px",
                }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>{p.company}</span>
                  <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                    {p.segments.reduce((s, x) => s + x.value, 0)} pts total
                  </span>
                </div>
                <StackedBar segments={p.segments} height={36} />
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "28px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "16px", fontSize: "12px", color: C.textSec, lineHeight: 1.55,
          }}>
            <div><strong style={{ color: C.accent }}>Innovation</strong> — patents, R&amp;D spend, digital transformation narrative, AI visibility.</div>
            <div><strong style={{ color: C.sage }}>Performance</strong> — financial results, market share, leadership stability, operational excellence.</div>
            <div><strong style={{ color: C.amber }}>Purpose</strong> — ESG, sustainability, community impact, DEI, regulatory standing.</div>
          </div>
        </div>
      </section>

      {/* 10. TOPIC HEATMAP ──────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Topic intensity</div>
        <h2 style={h2Style}>Who owns which conversation.</h2>
        <p style={subheadStyle}>
          Article counts across the ten most material conversation topics for each tracked company.
          Darker cells mean more coverage — and more share of voice in that narrative lane.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Articles per company × topic — trailing 90 days</div>
          <Heatmap
            rows={D.heatmap.rows}
            cols={D.heatmap.cols}
            data={D.heatmap.data}
            colorScale={[C.surfaceAlt, C.sageBright, C.sage, C.amber, C.red]}
          />
          <div style={{
            marginTop: "20px", paddingTop: "16px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex", alignItems: "center", gap: "16px",
            fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span>Low</span>
            <div style={{ display: "flex", gap: "2px", flex: 1, maxWidth: "200px" }}>
              {[C.surfaceAlt, C.sageBright, C.sage, C.amber, C.red].map((c, i) => (
                <div key={i} style={{ flex: 1, height: "12px", background: c, borderRadius: "2px" }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
      </section>

      {/* 11. KEY INSIGHTS ───────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Analysis</div>
        <h2 style={h2Style}>What the data is telling us.</h2>
        <p style={subheadStyle}>
          Six analytical lenses on {D.name.toLowerCase()}, grounded in the numbers above and benchmarked
          against Harch's full Moroccan corporate universe (320+ entities tracked).
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
        }}>
          {D.insights.map((ins, i) => (
            <div key={i} style={{
              ...cardStyle,
              borderTop: `3px solid ${D.color}`,
              padding: "32px",
            }}>
              <div style={{
                display: "flex", alignItems: "baseline", gap: "12px",
                marginBottom: "16px",
              }}>
                <span style={{
                  fontSize: "32px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: D.color, lineHeight: 1, letterSpacing: "-0.04em",
                }}>{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: C.text,
                  letterSpacing: "-0.02em", margin: 0, lineHeight: 1.3,
                }}>{ins.heading}</h3>
              </div>
              <p style={{
                fontSize: "14px", color: C.textSec, lineHeight: 1.7, margin: 0,
              }}>
                {ins.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 12. AI VISIBILITY COMPARISON ───────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>AI visibility</div>
        <h2 style={h2Style}>Who gets cited when AI talks about {D.name.toLowerCase()}.</h2>
        <p style={subheadStyle}>
          When a stakeholder asks ChatGPT, Claude, Gemini, Perplexity, or Copilot about
          {" "}{D.name.toLowerCase()} in Morocco, which companies do they get back? Average citation
          rate across the industry's tracked companies, per AI engine.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Citation rate by AI engine — {D.topStats.companies} companies</div>
          <BarChart
            data={D.aiVisibility}
            color={D.color}
            height={260}
            formatValue={(v) => `${v}%`}
          />
          <div style={{
            marginTop: "24px", padding: "16px 18px",
            background: C.surfaceAlt, borderRadius: "8px",
            fontSize: "13px", color: C.textSec, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text }}>Read this chart:</strong> {D.aiVisibilityNote}
          </div>
        </div>
      </section>

      {/* 13. METHODOLOGY NOTE ───────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Methodology</div>
        <h2 style={h2Style}>How we built this profile.</h2>
        <div style={cardStyle}>
          <p style={{
            fontSize: "14px", color: C.textSec, lineHeight: 1.75, margin: 0,
          }}>
            {D.methodology}
          </p>
          <div style={{
            marginTop: "24px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
            gap: "20px",
          }}>
            {[
              { k: "Sources", v: "200+" },
              { k: "Refresh cycle", v: "6 hours" },
              { k: "Risk categories", v: "32" },
              { k: "AI engines", v: "5" },
              { k: "Languages", v: "FR · EN · AR" },
              { k: "Lookback", v: "Trailing 90d" },
            ].map(m => (
              <div key={m.k}>
                <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: D.color, lineHeight: 1 }}>
                  {m.v}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                  {m.k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 14. CTA ────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: "1280px", margin: "0 auto", padding: "48px 16px 80px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${D.color} 0%, ${C.accent} 100%)`,
          borderRadius: "16px",
          padding: "64px 48px",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
            borderRadius: "50%",
            transform: "translate(40%, -40%)",
          }} />
          <div style={{ maxWidth: "760px", position: "relative" }}>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.14em", textTransform: "uppercase",
              marginBottom: "16px", opacity: 0.85,
            }}>
              Industry-specific report · {D.name}
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 16px", color: "#FFFFFF",
            }}>
              Get your industry-specific report →
            </h2>
            <p style={{
              fontSize: "17px", lineHeight: 1.55, opacity: 0.92,
              maxWidth: "640px", margin: "0 0 32px",
            }}>
              A 40-page PDF benchmarking your company against {D.topStats.companies - 1} other
              {" "}{D.name.toLowerCase()} players — with company-level reputation scores, risk
              register, AI visibility breakdown, and a 90-day comms action plan.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a href="/atelier/audit" style={{
                display: "inline-block", padding: "14px 28px",
                background: "#FFFFFF", color: D.color,
                fontSize: "15px", fontWeight: 700,
                textDecoration: "none", borderRadius: "6px",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}>
                Request the report →
              </a>
              <a href="/atelier/audit" style={{
                display: "inline-block", padding: "14px 28px",
                background: "transparent", color: "#FFFFFF",
                fontSize: "15px", fontWeight: 600,
                textDecoration: "none", borderRadius: "6px",
                border: "1px solid rgba(255,255,255,0.4)",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.2s",
              }}>
                Talk to an analyst
              </a>
            </div>
          </div>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────
function SentimentBar({ value }: { value: number }) {
  // value is % positive
  const color = value >= 60 ? C.sage : value >= 40 ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div style={{ width: "70px", height: "6px", background: C.surfaceAlt, borderRadius: "100px", overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: "100px" }} />
      </div>
      <span style={{
        fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color, minWidth: "36px",
      }}>{value}%</span>
    </div>
  );
}

function MiniTrend({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80, h = 28;
  const step = w / (data.length - 1);
  const path = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const delta = data[data.length - 1] - data[0];
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{
        fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
        color: delta >= 0 ? C.sage : C.red,
      }}>
        {delta >= 0 ? "+" : ""}{delta}
      </span>
    </div>
  );
}

function SentimentInsight({ color, label, value, desc }: { color: string; label: string; value: number; desc: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "auto 1fr",
      gap: "16px", alignItems: "start",
    }}>
      <div style={{ textAlign: "center", minWidth: "60px" }}>
        <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, lineHeight: 1 }}>
          {value}%
        </div>
        <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
          {label}
        </div>
      </div>
      <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: 0, paddingTop: "2px" }}>
        {desc}
      </p>
    </div>
  );
}

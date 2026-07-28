"use client";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER · COMPANY PROFILE — SHARED LAYOUT
//  Reusable template for all Harch 100 company profile pages.
//  14 sections · 8+ chart components · ~2000 words per page
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
export interface CompanyData {
  slug: string;
  name: string;
  shortName: string;
  sector: string;
  color: string;
  tagline: string;
  heroDescription: string;
  analysisBody: string;

  rank: number;
  logoInitial: string;

  score: number;
  prevScore: number;
  trend: "up" | "down" | "stable";
  change: string;
  industryRank: number;
  industryTotal: number;

  topStats: {
    articles: number;
    sources: number;
    aiCitations: number;
    aiCitationsTotal: number;
    shareOfVoice: number;
  };

  pillars: {
    innovation: { weight: number; score: number };
    performance: { weight: number; score: number };
    purpose: { weight: number; score: number };
  };

  radar: {
    axes: string[];
    series: { name: string; color: string; values: number[] }[];
  };

  sentimentSplit: { label: string; value: number; color: string }[];
  sentimentByLanguage: { label: string; value: number; color?: string }[];
  topSources: { label: string; value: number; sublabel?: string; color?: string }[];

  quarterly: {
    series: { name: string; color: string; points: number[] }[];
    xLabels: string[];
  };

  narratives: {
    statement: string;
    strength: number;
    sentiment: number;
    articles: number;
    trajectory: "emerging" | "growing" | "peak" | "declining";
  }[];

  risks: {
    label: string;
    category: string;
    frequency: number;
    impact: number;
    velocity: number;
    composite: number;
    trajectory: "rising" | "stable" | "falling";
    mitigation: string;
  }[];

  aiEngines: {
    name: string;
    cited: boolean;
    position: string;
    sentiment: number;
  }[];

  topicHeatmap: {
    rows: string[];
    cols: string[];
    data: { row: string; col: string; value: number; label?: string }[];
  };

  competitorRadar: {
    axes: string[];
    series: { name: string; color: string; values: number[] }[];
  };
  competitorsList: { name: string; score: number }[];

  recentArticles: {
    title: string;
    source: string;
    date: string;
    sentiment: "positive" | "neutral" | "negative";
    relevance: number;
  }[];

  recommendations: {
    priority: "critical" | "high" | "medium" | "low";
    action: string;
    rationale: string;
    timeline: string;
    owner: string;
  }[];

  methodology: string;
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
  padding: "80px 32px",
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

const bodyTextStyle: React.CSSProperties = {
  fontSize: "15px",
  color: C.textSec,
  lineHeight: 1.75,
  margin: "0 0 20px",
  maxWidth: "820px",
};

// ─── MAIN LAYOUT COMPONENT ───────────────────────────────────────
export function CompanyPageLayout({ data }: { data: CompanyData }) {
  const D = data;
  const trendArrow = D.trend === "up" ? "▲" : D.trend === "down" ? "▼" : "—";
  const trendColor = D.trend === "up" ? C.sage : D.trend === "down" ? C.red : C.textMuted;

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* 1. HERO ────────────────────────────────────────────────── */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "80px 32px 64px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "32px", fontSize: "12px",
            fontFamily: "'JetBrains Mono', monospace", color: C.textMuted,
          }}>
            <a href="/atelier/harch-100" style={{ color: C.accent, textDecoration: "none" }}>Harch 100</a>
            <span>/</span>
            <span>Companies</span>
            <span>/</span>
            <span style={{ color: C.text }}>{D.shortName}</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "32px",
            alignItems: "center",
            marginBottom: "32px",
          }}>
            {/* Logo placeholder — first letter in colored square */}
            <div style={{
              width: "96px", height: "96px",
              borderRadius: "12px",
              background: D.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "44px", fontWeight: 800, color: "#FFFFFF",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              flexShrink: 0,
            }} aria-hidden>
              {D.logoInitial}
            </div>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "10px",
                padding: "6px 14px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: "100px",
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: D.color, letterSpacing: "0.14em", textTransform: "uppercase",
                marginBottom: "16px",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: D.color }} />
                {D.sector}
              </div>
              <h1 style={{
                fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 800,
                letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
                margin: "0 0 12px",
              }}>
                {D.name}
              </h1>
              <div style={{
                display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center",
                fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
                color: C.textSec,
              }}>
                <span>
                  <span style={{ color: C.textMuted }}>Harch 100 rank </span>
                  <strong style={{ color: D.color, fontSize: "16px" }}>#{D.rank}</strong>
                </span>
                <span style={{ color: C.borderLight }}>·</span>
                <span>
                  <span style={{ color: C.textMuted }}>Industry rank </span>
                  <strong style={{ color: C.text }}>#{D.industryRank}</strong>
                  <span style={{ color: C.textMuted }}> of {D.industryTotal}</span>
                </span>
                <span style={{ color: C.borderLight }}>·</span>
                <span>
                  <span style={{ color: trendColor, fontWeight: 700 }}>{trendArrow} {D.change}</span>
                  <span style={{ color: C.textMuted }}> vs prev. month</span>
                </span>
              </div>
            </div>
          </div>

          <p style={{
            fontSize: "clamp(18px, 2.2vw, 22px)", color: D.color, fontWeight: 600,
            lineHeight: 1.4, maxWidth: "900px",
          }}>
            {D.tagline}
          </p>
        </div>
      </section>

      {/* 2. BIG SCORE PANEL ─────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Reputation score</div>
        <h2 style={h2Style}>The number that defines {D.shortName}'s reputation.</h2>
        <p style={subheadStyle}>{D.heroDescription}</p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
          marginBottom: "24px",
        }}>
          {/* Gauge card */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Composite reputation score</div>
            <Gauge score={D.score} color={D.color} label="out of 100" size={220} />
            <div style={{
              marginTop: "16px", padding: "14px 16px",
              background: C.surfaceAlt, borderRadius: "8px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>Previous month</div>
                <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{D.prevScore}</div>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                color: trendColor,
                padding: "6px 12px", borderRadius: "100px",
                background: D.trend === "up" ? "rgba(74,123,95,0.08)" :
                            D.trend === "down" ? "rgba(160,82,75,0.08)" : C.surfaceAlt,
              }}>
                {trendArrow} {D.change} pts
              </div>
            </div>
          </div>

          {/* Ranks + summary */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Position in Harch 100</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <RankRow label="Harch 100 cross-industry rank" value={`#${D.rank}`} subtitle="of 100 Moroccan companies tracked" color={D.color} />
              <RankRow label={`${D.sector} industry rank`} value={`#${D.industryRank}`} subtitle={`of ${D.industryTotal} ${D.sector.toLowerCase()} companies`} color={C.accent} />
              <RankRow label="AI visibility rank" value={`#${D.topStats.aiCitations === D.topStats.aiCitationsTotal ? "1" : "2"}`} subtitle={`Cited by ${D.topStats.aiCitations} of ${D.topStats.aiCitationsTotal} AI engines`} color={C.sage} />
            </div>
            <div style={{
              marginTop: "24px", paddingTop: "20px",
              borderTop: `1px solid ${C.borderLight}`,
              fontSize: "12px", color: C.textMuted, lineHeight: 1.55,
            }}>
              {D.shortName} sits at <strong style={{ color: C.text }}>{D.score}/100</strong> on the Harch Reputation Index.
              {D.trend === "up" && ` Trending upward — ${D.change} points gained over the trailing quarter.`}
              {D.trend === "down" && ` Trending downward — ${D.change} points lost over the trailing quarter. Action recommended.`}
              {D.trend === "stable" && ` Stable trajectory — no significant movement in the trailing quarter.`}
            </div>
          </div>
        </div>

        {/* 4 stat cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          <StatCard
            value={D.topStats.articles}
            label="Articles analyzed"
            sublabel="Trailing 90 days · 3 languages"
            color={D.color}
            trend={{ direction: "up", value: "+8% QoQ" }}
          />
          <StatCard
            value={D.topStats.sources}
            label="Distinct sources"
            sublabel="Newspapers, wires, social, AI"
            color={D.color}
            trend={{ direction: "stable", value: "no change" }}
          />
          <StatCard
            value={`${D.topStats.aiCitations}/${D.topStats.aiCitationsTotal}`}
            label="AI engines citing"
            sublabel="ChatGPT · Perplexity · Gemini · Claude"
            color={D.topStats.aiCitations === D.topStats.aiCitationsTotal ? C.sage : C.amber}
            trend={{ direction: D.topStats.aiCitations === D.topStats.aiCitationsTotal ? "up" : "stable", value: "trailing 30d" }}
          />
          <StatCard
            value={`${D.topStats.shareOfVoice}%`}
            label="Share of voice"
            sublabel={`% of ${D.sector.toLowerCase()} conversation`}
            color={D.color}
            trend={{ direction: "up", value: "+1.2 pts QoQ" }}
          />
        </div>
      </section>

      {/* 3. PILLAR BREAKDOWN ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Reputation composition</div>
        <h2 style={h2Style}>Three pillars, one composite score.</h2>
        <p style={subheadStyle}>
          The Harch Reputation Index blends Innovation, Performance, and Purpose into a single 0–100
          composite. The mix reveals whether reputation is driven by financial strength, forward-looking
          narrative, or ESG and social licence.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Pillar weighting — {D.shortName}</div>
            <StackedBar
              segments={[
                { label: "Innovation", value: D.pillars.innovation.weight, color: C.accent },
                { label: "Performance", value: D.pillars.performance.weight, color: C.sage },
                { label: "Purpose", value: D.pillars.purpose.weight, color: C.amber },
              ]}
              height={40}
            />
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <PillarRow label="Innovation" weight={D.pillars.innovation.weight} score={D.pillars.innovation.score} color={C.accent} />
              <PillarRow label="Performance" weight={D.pillars.performance.weight} score={D.pillars.performance.score} color={C.sage} />
              <PillarRow label="Purpose" weight={D.pillars.purpose.weight} score={D.pillars.purpose.score} color={C.amber} />
            </div>
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>9-theme radar vs industry average</div>
            <RadarChart
              axes={D.radar.axes}
              series={D.radar.series}
              size={320}
            />
            <div style={{
              marginTop: "16px", padding: "14px 16px",
              background: C.surfaceAlt, borderRadius: "8px",
              fontSize: "12px", color: C.textSec, lineHeight: 1.55,
            }}>
              <strong style={{ color: C.text }}>How to read:</strong> Each axis is a 0–100 sub-score.
              {D.shortName}'s shape is the larger polygon; the industry average is the inner reference.
              Areas where {D.shortName} extends beyond the average signal narrative advantage.
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px", marginTop: "20px",
        }}>
          <PillarStatCard label="Innovation" weight={D.pillars.innovation.weight} score={D.pillars.innovation.score} color={C.accent} />
          <PillarStatCard label="Performance" weight={D.pillars.performance.weight} score={D.pillars.performance.score} color={C.sage} />
          <PillarStatCard label="Purpose" weight={D.pillars.purpose.weight} score={D.pillars.purpose.score} color={C.amber} />
        </div>
      </section>

      {/* 4. SENTIMENT ANALYSIS ──────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Sentiment analysis</div>
        <h2 style={h2Style}>What the conversation feels like.</h2>
        <p style={subheadStyle}>
          Share of positive, neutral, and negative mentions across {D.topStats.sources} monitored sources
          over the trailing 90 days. We slice the data by language and by source to surface where
          {D.shortName}'s narrative is strongest and weakest.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Overall sentiment split — trailing 90 days</div>
            <DonutChart
              data={D.sentimentSplit}
              size={220}
              thickness={28}
              centerValue={`${Math.round(D.sentimentSplit[0].value / D.sentimentSplit.reduce((s, x) => s + x.value, 0) * 100)}%`}
              centerLabel="positive"
            />
          </div>

          <div style={cardStyle}>
            <div style={cardTitleStyle}>Sentiment by language — articles per language</div>
            <BarChart
              data={D.sentimentByLanguage}
              color={D.color}
              height={240}
              formatValue={(v) => `${v}`}
            />
            <div style={{
              marginTop: "20px", paddingTop: "16px",
              borderTop: `1px solid ${C.borderLight}`,
              fontSize: "12px", color: C.textMuted, lineHeight: 1.55,
            }}>
              {D.sentimentByLanguage[0].value > D.sentimentByLanguage[1].value
                ? `${D.shortName}'s strongest sentiment comes from ${D.sentimentByLanguage[0].label}-language coverage, reflecting its domestic footprint.`
                : `International ${D.sentimentByLanguage[1].label}-language coverage is a material narrative channel.`}
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitleStyle}>Top 10 sources by article count — color-coded by dominant sentiment</div>
          <HorizontalBarChart
            data={D.topSources}
            color={D.color}
            showValues
          />
          <div style={{
            marginTop: "24px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex", gap: "20px", flexWrap: "wrap",
            fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", background: C.sage, borderRadius: "2px" }} />
              Positive-leaning source
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", background: C.accent, borderRadius: "2px" }} />
              Neutral source
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "10px", height: "10px", background: C.red, borderRadius: "2px" }} />
              Negative-leaning source
            </span>
          </div>
        </div>
      </section>

      {/* 5. QUARTERLY TREND ─────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Trajectory</div>
        <h2 style={h2Style}>Quarterly reputation trend — {D.shortName} vs industry.</h2>
        <p style={subheadStyle}>
          {D.shortName}'s composite reputation score over the last four quarters, benchmarked against the
          {" "}{D.sector.toLowerCase()} industry average. A widening gap signals compounding narrative
          advantage; a narrowing gap signals erosion.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Reputation score — last 4 quarters</div>
          <LineChart
            series={D.quarterly.series}
            xLabels={D.quarterly.xLabels}
            height={300}
            yMax={100}
          />
          <div style={{
            marginTop: "24px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}>
            <TrendStat label="4-quarter delta" value={`${D.quarterly.series[0].points[3] - D.quarterly.series[0].points[0] >= 0 ? "+" : ""}${D.quarterly.series[0].points[3] - D.quarterly.series[0].points[0]} pts`} color={D.quarterly.series[0].points[3] >= D.quarterly.series[0].points[0] ? C.sage : C.red} />
            <TrendStat label="Best quarter" value={D.quarterly.xLabels[D.quarterly.series[0].points.indexOf(Math.max(...D.quarterly.series[0].points))]} color={C.text} />
            <TrendStat label="Gap vs industry" value={`${(() => { const gap = D.quarterly.series[0].points[3] - D.quarterly.series[1].points[3]; return gap >= 0 ? `+${gap}` : `${gap}`; })()} pts`} color={D.color} />
            <TrendStat label="Trend direction" value={D.trend === "up" ? "Upward" : D.trend === "down" ? "Downward" : "Stable"} color={D.trend === "up" ? C.sage : D.trend === "down" ? C.red : C.textMuted} />
          </div>
        </div>
      </section>

      {/* 6. TOP NARRATIVES ──────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Narrative detection</div>
        <h2 style={h2Style}>The five stories shaping {D.shortName}'s reputation.</h2>
        <p style={subheadStyle}>
          Harch's narrative engine clusters articles into coherent storylines and scores each on
          strength (volume × prominence), sentiment polarity (−1 to +1), and trajectory (emerging,
          growing, peak, declining). These are the five most material narratives right now.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "20px",
        }}>
          {D.narratives.map((n, i) => {
            const trajColor = n.trajectory === "emerging" ? C.sage :
                               n.trajectory === "growing" ? C.sageBright :
                               n.trajectory === "peak" ? C.amber : C.red;
            const sentColor = n.sentiment > 0.3 ? C.sage : n.sentiment < -0.3 ? C.red : C.accent;
            return (
              <div key={i} style={{
                ...cardStyle,
                borderTop: `3px solid ${trajColor}`,
                padding: "28px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  marginBottom: "16px",
                }}>
                  <span style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    Narrative {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{
                    fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                    color: "#FFFFFF", background: trajColor,
                    padding: "3px 10px", borderRadius: "100px",
                    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                  }}>
                    {n.trajectory}
                  </span>
                </div>
                <h3 style={{
                  fontSize: "17px", fontWeight: 700, color: C.text,
                  letterSpacing: "-0.02em", lineHeight: 1.35,
                  margin: "0 0 20px",
                }}>
                  {n.statement}
                </h3>
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px", paddingTop: "16px",
                  borderTop: `1px solid ${C.borderLight}`,
                }}>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text, lineHeight: 1 }}>
                      {n.strength}
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>Strength</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: sentColor, lineHeight: 1 }}>
                      {n.sentiment > 0 ? "+" : ""}{n.sentiment.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>Sentiment</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text, lineHeight: 1 }}>
                      {n.articles}
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>Articles</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. ACTIVE RISKS TABLE ──────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Risk register</div>
        <h2 style={h2Style}>The five most active reputational risks.</h2>
        <p style={subheadStyle}>
          Harch's risk engine scores each risk on three dimensions — frequency, impact, and velocity —
          and combines them into a composite 0–100 score. Each risk is paired with a mitigation
          recommendation from Harch's analyst team.
        </p>
        <div style={cardStyle}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {["Risk", "Category", "Freq.", "Impact", "Vel.", "Composite", "Trajectory", "Mitigation"].map(h => (
                    <th key={h} style={{
                      padding: "12px 14px", fontSize: "10px",
                      fontFamily: "'JetBrains Mono', monospace", color: C.textMuted,
                      letterSpacing: "0.1em", textTransform: "uppercase",
                      textAlign: ["Freq.", "Impact", "Vel.", "Composite"].includes(h) ? "center" : "left",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {D.risks.map((r, i) => {
                  const riskColor = r.composite >= 60 ? C.red : r.composite >= 40 ? C.amber : C.sage;
                  const trajColor = r.trajectory === "rising" ? C.red : r.trajectory === "stable" ? C.accent : C.sage;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ padding: "16px 14px", fontSize: "13px", fontWeight: 600, color: C.text }}>
                        {r.label}
                      </td>
                      <td style={{ padding: "16px 14px", fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                        {r.category}
                      </td>
                      <td style={{ padding: "16px 14px", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>{r.frequency}</td>
                      <td style={{ padding: "16px 14px", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>{r.impact}</td>
                      <td style={{ padding: "16px 14px", textAlign: "center", fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>{r.velocity}</td>
                      <td style={{ padding: "16px 14px", textAlign: "center" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          minWidth: "36px", padding: "4px 10px",
                          background: `${riskColor}15`, color: riskColor,
                          fontSize: "14px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                          borderRadius: "6px",
                        }}>{r.composite}</span>
                      </td>
                      <td style={{ padding: "16px 14px", textAlign: "center" }}>
                        <span style={{
                          fontSize: "11px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                          color: trajColor, textTransform: "uppercase", letterSpacing: "0.08em",
                        }}>
                          {r.trajectory === "rising" ? "▲ Rising" : r.trajectory === "falling" ? "▼ Falling" : "— Stable"}
                        </span>
                      </td>
                      <td style={{ padding: "16px 14px", fontSize: "12px", color: C.textSec, lineHeight: 1.5, maxWidth: "280px" }}>
                        {r.mitigation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{
            marginTop: "24px", paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}>
            {[
              { band: "Critical", range: "60+", color: C.red, action: "War-room now" },
              { band: "Elevated", range: "45–59", color: C.amber, action: "Comms plan active" },
              { band: "Moderate", range: "30–44", color: C.accent, action: "Monitor weekly" },
              { band: "Low", range: "<30", color: C.sage, action: "Quarterly review" },
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

      {/* 8. AI VISIBILITY MATRIX ────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>AI visibility</div>
        <h2 style={h2Style}>What AI engines say when asked about {D.shortName}.</h2>
        <p style={subheadStyle}>
          We prompted ChatGPT, Perplexity, Gemini, and Claude with 12 standard reputation queries about
          {D.shortName} and tracked citation status, average position in the response, and sentiment of
          the mention.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}>
          {D.aiEngines.map((eng, i) => {
            const sentColor = eng.sentiment > 0.3 ? C.sage : eng.sentiment < -0.3 ? C.red : C.accent;
            return (
              <div key={i} style={{
                ...cardStyle,
                padding: "24px",
                borderTop: `3px solid ${eng.cited ? C.sage : C.red}`,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: "16px",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, fontFamily: "'Inter', sans-serif" }}>
                    {eng.name}
                  </div>
                  <span style={{
                    fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                    color: "#FFFFFF", background: eng.cited ? C.sage : C.red,
                    padding: "3px 10px", borderRadius: "100px",
                    textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                  }}>
                    {eng.cited ? "Cited" : "Not cited"}
                  </span>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Average position</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: eng.cited ? C.text : C.textMuted, lineHeight: 1 }}>
                    {eng.position}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Sentiment of mention</div>
                  <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: sentColor }}>
                    {eng.cited ? (eng.sentiment > 0 ? "+" : "") + eng.sentiment.toFixed(2) : "n/a"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. TOPIC CLUSTERING HEATMAP ────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Topic clustering</div>
        <h2 style={h2Style}>Where {D.shortName}'s narrative is concentrated.</h2>
        <p style={subheadStyle}>
          Article counts across the ten most material topics, broken down by quarter. Darker cells signal
          more intense coverage — and more narrative momentum in that topic lane. Empty cells flag untold
          stories and white space.
        </p>
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Articles per topic × quarter — trailing 12 months</div>
          <Heatmap
            rows={D.topicHeatmap.rows}
            cols={D.topicHeatmap.cols}
            data={D.topicHeatmap.data}
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

      {/* 10. COMPETITOR BENCHMARKING ────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Competitor benchmarking</div>
        <h2 style={h2Style}>How {D.shortName} stacks up against direct rivals.</h2>
        <p style={subheadStyle}>
          Six dimensions benchmarked against the top three direct competitors: composite score, sentiment,
          AI visibility, share of voice, risk level (inverted — lower risk is better), and narrative
          strength.
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "20px",
        }}>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>6-dimension radar vs top 3 competitors</div>
            <RadarChart
              axes={D.competitorRadar.axes}
              series={D.competitorRadar.series}
              size={340}
            />
          </div>
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Score comparison — direct competitors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { name: D.shortName, score: D.score, color: D.color, isCompany: true },
                ...D.competitorsList.map(c => ({ ...c, color: C.textMuted, isCompany: false })),
              ].sort((a, b) => b.score - a.score).map((c, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  gap: "16px", alignItems: "center",
                  padding: c.isCompany ? "14px 16px" : "12px 16px",
                  background: c.isCompany ? `${c.color}08` : C.surfaceAlt,
                  borderRadius: "8px",
                  borderLeft: `3px solid ${c.color}`,
                }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, fontFamily: "'Inter', sans-serif" }}>
                      {c.name}
                      {c.isCompany && (
                        <span style={{
                          marginLeft: "10px", fontSize: "10px",
                          fontFamily: "'JetBrains Mono', monospace",
                          color: "#FFFFFF", background: c.color,
                          padding: "2px 8px", borderRadius: "100px",
                          textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700,
                        }}>Subject</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, marginTop: "4px" }}>
                      Harch Reputation Index
                    </div>
                  </div>
                  <div style={{
                    fontSize: "28px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                    color: c.color, lineHeight: 1, letterSpacing: "-0.04em",
                  }}>
                    {c.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 11. RECENT ARTICLES ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Recent coverage</div>
        <h2 style={h2Style}>The 8 most recent articles we analyzed.</h2>
        <p style={subheadStyle}>
          A live feed of the latest coverage feeding {D.shortName}'s reputation score, with sentiment
          classification and relevance weighting.
        </p>
        <div style={cardStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {D.recentArticles.map((a, i) => {
              const sentColor = a.sentiment === "positive" ? C.sage : a.sentiment === "negative" ? C.red : C.accent;
              return (
                <div key={i} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "20px",
                  padding: "18px 0",
                  borderBottom: i < D.recentArticles.length - 1 ? `1px solid ${C.borderLight}` : "none",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontSize: "15px", fontWeight: 600, color: C.text,
                      fontFamily: "'Inter', sans-serif", lineHeight: 1.4,
                      marginBottom: "6px",
                    }}>
                      {a.title}
                    </div>
                    <div style={{
                      display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center",
                      fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted,
                    }}>
                      <span style={{ color: C.textSec, fontWeight: 600 }}>{a.source}</span>
                      <span>·</span>
                      <span>{a.date}</span>
                      <span>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "8px", height: "8px", background: sentColor, borderRadius: "50%" }} />
                        {a.sentiment}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "80px" }}>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text, lineHeight: 1 }}>
                      {a.relevance}
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "4px" }}>
                      relevance
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. RECOMMENDATIONS ────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Action plan</div>
        <h2 style={h2Style}>Five prioritized recommendations for the next 90 days.</h2>
        <p style={subheadStyle}>
          Harch's analyst team translates the data above into five concrete moves — each with priority,
          rationale, timeline, and a suggested owner inside a typical communications function.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {D.recommendations.map((r, i) => {
            const priColor = r.priority === "critical" ? C.red :
                              r.priority === "high" ? C.amber :
                              r.priority === "medium" ? C.accent : C.sage;
            return (
              <div key={i} style={{
                ...cardStyle,
                padding: "28px",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: "32px",
                alignItems: "start",
                borderLeft: `4px solid ${priColor}`,
              }}>
                <div>
                  <div style={{
                    fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                    color: "#FFFFFF", background: priColor,
                    padding: "4px 12px", borderRadius: "100px",
                    textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
                    display: "inline-block",
                  }}>
                    {r.priority}
                  </div>
                  <div style={{
                    fontSize: "32px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                    color: C.text, lineHeight: 1, marginTop: "12px",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                </div>
                <div>
                  <h3 style={{
                    fontSize: "17px", fontWeight: 700, color: C.text,
                    letterSpacing: "-0.02em", lineHeight: 1.35,
                    margin: "0 0 12px",
                  }}>
                    {r.action}
                  </h3>
                  <p style={{
                    fontSize: "14px", color: C.textSec, lineHeight: 1.65, margin: 0,
                  }}>
                    {r.rationale}
                  </p>
                </div>
                <div style={{
                  textAlign: "right", minWidth: "160px",
                  display: "flex", flexDirection: "column", gap: "12px",
                }}>
                  <div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Timeline</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>{r.timeline}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Owner</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{r.owner}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ANALYSIS BODY ──────────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Analyst commentary</div>
        <h2 style={h2Style}>What the data is telling us about {D.shortName}.</h2>
        <div style={cardStyle}>
          <p style={bodyTextStyle}>{D.analysisBody}</p>
        </div>
      </section>

      {/* 13. METHODOLOGY ───────────────────────────────────────── */}
      <section style={sectionStyle}>
        <div style={eyebrowStyle}>Methodology</div>
        <h2 style={h2Style}>How we built this profile.</h2>
        <div style={cardStyle}>
          <p style={bodyTextStyle}>{D.methodology}</p>
          <div style={{
            paddingTop: "20px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
          }}>
            {[
              { k: "Articles analyzed", v: D.topStats.articles.toString() },
              { k: "Distinct sources", v: D.topStats.sources.toString() },
              { k: "Refresh cycle", v: "6 hours" },
              { k: "Risk categories", v: "32" },
              { k: "AI engines", v: "4" },
              { k: "Languages", v: "FR · EN · AR" },
              { k: "Lookback", v: "Trailing 90d" },
              { k: "Score scale", v: "0–100" },
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
        maxWidth: "1280px", margin: "0 auto",
        padding: "80px 32px 120px",
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
              Company-specific audit · {D.name}
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1,
              margin: "0 0 16px", color: "#FFFFFF",
            }}>
              Get a full audit for your company →
            </h2>
            <p style={{
              fontSize: "17px", lineHeight: 1.55, opacity: 0.92,
              maxWidth: "640px", margin: "0 0 32px",
            }}>
              A 60-page PDF benchmarking your company against {D.shortName} and the other Harch 100
              entrants — with company-level reputation scores, full risk register, AI visibility
              breakdown, narrative map, and a 90-day comms action plan.
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
                Get a full audit for your company →
              </a>
              <a href="/atelier/contact" style={{
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
function RankRow({ label, value, subtitle, color }: { label: string; value: string; subtitle: string; color: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr auto",
      gap: "16px", alignItems: "center",
      padding: "14px 16px", background: C.surfaceAlt, borderRadius: "8px",
    }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, fontFamily: "'Inter', sans-serif" }}>{label}</div>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, marginTop: "2px" }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, lineHeight: 1, letterSpacing: "-0.04em" }}>
        {value}
      </div>
    </div>
  );
}

function PillarRow({ label, weight, score, color }: { label: string; weight: number; score: number; color: string }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "120px 1fr 60px",
      gap: "12px", alignItems: "center",
    }}>
      <span style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ height: "8px", background: C.surfaceAlt, borderRadius: "100px", overflow: "hidden", flex: 1 }}>
          <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: "100px" }} />
        </div>
        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, minWidth: "32px" }}>{weight}% wt</span>
      </div>
      <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color, textAlign: "right" }}>{score}</span>
    </div>
  );
}

function PillarStatCard({ label, weight, score, color }: { label: string; weight: number; score: number; color: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <span style={{ fontSize: "13px", fontWeight: 700, color: C.text, fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>{weight}% weight</span>
      </div>
      <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, lineHeight: 1, letterSpacing: "-0.04em", marginBottom: "8px" }}>
        {score}
      </div>
      <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        pillar score / 100
      </div>
    </div>
  );
}

function TrendStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

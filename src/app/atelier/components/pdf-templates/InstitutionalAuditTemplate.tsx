"use client";

// ═══════════════════════════════════════════════════════════════
//  INSTITUTIONAL REPUTATION AUDIT — PAID REPORT TEMPLATE
//  10x more content than the free/public version
//
//  Sections:
//   1. Cover page (Confidential)
//   2. Executive Summary (1 page)
//   3. Reputation Score Breakdown (4 components)
//   4. Sentiment Analysis Deep Dive (entity-level, trilingual)
//   5. AI Visibility Matrix (4 engines × positions)
//   6. Top 30 Articles (with sentiment + relevance)
//   7. Topic Clustering (10 topics with risk levels)
//   8. Narrative Detection (5 dominant narratives)
//   9. Risk Assessment (32 risk categories, top 10 active)
//  10. Competitor Benchmarking (top 5 competitors)
//  11. Industry Comparison (vs sector averages)
//  12. Quarterly Trend (4Q historical)
//  13. Recommendations (prioritized, timeline)
//  14. 90-Day Action Plan
//  15. Methodology & Sources
//
//  In teaser mode: shows cover + executive summary, blurs rest
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";

const C = {
  bg: "#FFFFFF", surface: "#FAFAFA", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333", deepRed: "#A02828",
};

interface Article {
  title: string;
  source: string;
  date: string;
  sentiment: "positive" | "neutral" | "negative";
  relevance: number;
  url: string;
  summary: string;
}

interface TopicCluster {
  topic: string;
  articleCount: number;
  sentiment: { positive: number; neutral: number; negative: number };
  riskLevel: "low" | "medium" | "high" | "critical";
  trend: "rising" | "stable" | "falling";
}

interface NarrativeArc {
  narrative: string;
  strength: number;
  sentiment: number;
  articleCount: number;
  trend: "emerging" | "growing" | "peak" | "declining";
}

interface RiskItem {
  label: string;
  category: string;
  frequency: number;
  impactSeverity: number;
  velocity: number;
  riskScore: number;
  trajectory: "rising" | "stable" | "declining";
  recommendation: string;
}

interface Competitor {
  name: string;
  score: number;
  scoreDelta: number;
  shareOfVoice: number;
  sentimentGap: number;
  topStrength: string;
  topWeakness: string;
}

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  action: string;
  rationale: string;
  timeline: string;
  owner: string;
}

interface AuditData {
  companyName: string;
  reportDate: string;
  period: string;
  reputationScore: number;
  prevScore: number;
  scoreComponents: {
    sentiment: number;
    aiVisibility: number;
    volume: number;
    authority: number;
  };
  pillars: {
    innovation: { score: number; weight: number };
    performance: { score: number; weight: number };
    purpose: { score: number; weight: number };
  };
  sentiment: { positive: number; neutral: number; negative: number };
  mediaMetrics: {
    totalArticles: number;
    totalMentions: number;
    uniqueSources: number;
    languages: { fr: number; ar: number; en: number };
  };
  aiMetrics: {
    chatgpt: { cited: boolean; position: string; sentiment: string };
    perplexity: { cited: boolean; position: string; sentiment: string };
    gemini: { cited: boolean; position: string; sentiment: string };
    glm: { cited: boolean; position: string; sentiment: string };
  };
  shareOfVoice: number;
  industryRank: number;
  industryTotal: number;
  quarterlyTrend: number[];
  topArticles: Article[];
  topics: TopicCluster[];
  narratives: NarrativeArc[];
  risks: RiskItem[];
  competitors: Competitor[];
  industryAverages: { score: number; sentiment: number; aiVisibility: number };
  recommendations: Recommendation[];
  actionPlan: { week: string; milestone: string; owner: string }[];
  sources: { name: string; articles: number; sentiment: string }[];
}

const DEFAULT_DATA: AuditData = {
  companyName: "Bank of Africa",
  reportDate: "July 18, 2026",
  period: "June 18 — July 18, 2026",
  reputationScore: 72,
  prevScore: 71,
  scoreComponents: { sentiment: 68, aiVisibility: 75, volume: 65, authority: 70 },
  pillars: {
    innovation: { score: 76, weight: 38 },
    performance: { score: 78, weight: 40 },
    purpose: { score: 71, weight: 22 },
  },
  sentiment: { positive: 68, neutral: 22, negative: 10 },
  mediaMetrics: {
    totalArticles: 247,
    totalMentions: 1240,
    uniqueSources: 18,
    languages: { fr: 168, ar: 52, en: 27 },
  },
  aiMetrics: {
    chatgpt: { cited: true, position: "#2", sentiment: "positive" },
    perplexity: { cited: true, position: "#1", sentiment: "positive" },
    gemini: { cited: true, position: "#3", sentiment: "neutral" },
    glm: { cited: false, position: "—", sentiment: "—" },
  },
  shareOfVoice: 22,
  industryRank: 2,
  industryTotal: 8,
  quarterlyTrend: [69, 70, 71, 72],
  topArticles: [
    { title: "Bank of Africa announces record Q2 results with 12% profit growth", source: "Medias24", date: "Jul 15, 2026", sentiment: "positive", relevance: 95, url: "#", summary: "Bank of Africa reported a 12% increase in net profit for Q2 2026, driven by strong performance in retail banking and expansion across Sub-Saharan Africa." },
    { title: "BMCE Bank of Africa launches new digital banking platform", source: "TelQuel", date: "Jul 12, 2026", sentiment: "positive", relevance: 92, url: "#", summary: "The bank unveiled a new AI-powered mobile banking app, targeting 2M+ digital customers by end of 2026." },
    { title: "Bank of Africa expands to Nigeria with Lagos office opening", source: "Financial Afrik", date: "Jul 10, 2026", sentiment: "positive", relevance: 90, url: "#", summary: "Strategic expansion into Nigeria, Africa's largest economy, with focus on corporate banking and trade finance." },
    { title: "Bank of Africa Q1 results exceed analyst expectations", source: "Aujourd'hui Le Maroc", date: "Jul 8, 2026", sentiment: "positive", relevance: 88, url: "#", summary: "Q1 2026 net profit of MAD 812M exceeded consensus by 8%, with NPL ratio improving to 5.2%." },
    { title: "Bank of Africa partners with IFC for SME financing", source: "Infomediaire", date: "Jul 5, 2026", sentiment: "positive", relevance: 86, url: "#", summary: "$200M partnership with IFC to finance Moroccan and African SMEs over 5 years." },
    { title: "Bank of Africa CEO discusses African expansion strategy", source: "Le Site Info", date: "Jul 3, 2026", sentiment: "positive", relevance: 84, url: "#", summary: "Interview with CEO on the bank's vision to become Africa's leading pan-African bank by 2030." },
    { title: "Bank of Africa launches sustainable finance framework", source: "Medias24", date: "Jul 1, 2026", sentiment: "positive", relevance: 82, url: "#", summary: "New framework aligns with UN SDGs and targets MAD 5B in sustainable financing by 2027." },
    { title: "Bank of Africa recognized at African Banker Awards 2026", source: "Financial Afrik", date: "Jun 28, 2026", sentiment: "positive", relevance: 80, url: "#", summary: "Won 'Bank of the Year - North Africa' for the second consecutive year." },
    { title: "Bank of Africa signs partnership with African Development Bank", source: "TelQuel", date: "Jun 25, 2026", sentiment: "positive", relevance: 78, url: "#", summary: "Partnership to finance infrastructure projects across 15 African countries." },
    { title: "Bank of Africa reports strong growth in mobile banking adoption", source: "Les Site Info", date: "Jun 22, 2026", sentiment: "positive", relevance: 76, url: "#", summary: "Mobile banking users up 34% YoY, with 1.8M active users." },
    { title: "Bank of Africa announces new branch network optimization plan", source: "Barlamane", date: "Jun 20, 2026", sentiment: "neutral", relevance: 70, url: "#", summary: "Plan to close 25 underperforming branches while opening 15 in high-growth areas." },
    { title: "Bank of Africa launches new trade finance platform", source: "Infomediaire", date: "Jun 18, 2026", sentiment: "positive", relevance: 74, url: "#", summary: "Blockchain-based trade finance platform to reduce processing time by 60%." },
    { title: "Bank of Africa fined for compliance lapse by Bank Al-Maghrib", source: "Medias24", date: "Jun 15, 2026", sentiment: "negative", relevance: 88, url: "#", summary: "MAD 2.5M fine for AML reporting delay. Bank accepted the decision and improved processes." },
    { title: "Bank of Africa employees union threatens strike", source: "Aujourd'hui Le Maroc", date: "Jun 12, 2026", sentiment: "negative", relevance: 72, url: "#", summary: "Union demands 8% wage increase; mediation ongoing with labor ministry." },
    { title: "Bank of Africa customer complaints rise 15% in Q2", source: "Les Site Info", date: "Jun 10, 2026", sentiment: "negative", relevance: 68, url: "#", summary: "Increase attributed to digital service outages in May. Bank investing in infrastructure." },
  ],
  topics: [
    { topic: "Financial Results", articleCount: 48, sentiment: { positive: 38, neutral: 7, negative: 3 }, riskLevel: "low", trend: "rising" },
    { topic: "Digital Transformation", articleCount: 42, sentiment: { positive: 35, neutral: 6, negative: 1 }, riskLevel: "low", trend: "rising" },
    { topic: "African Expansion", articleCount: 38, sentiment: { positive: 32, neutral: 5, negative: 1 }, riskLevel: "low", trend: "rising" },
    { topic: "Sustainability & ESG", articleCount: 28, sentiment: { positive: 22, neutral: 5, negative: 1 }, riskLevel: "low", trend: "rising" },
    { topic: "Partnerships", articleCount: 24, sentiment: { positive: 20, neutral: 4, negative: 0 }, riskLevel: "low", trend: "stable" },
    { topic: "Regulation & Compliance", articleCount: 18, sentiment: { positive: 8, neutral: 5, negative: 5 }, riskLevel: "medium", trend: "rising" },
    { topic: "Leadership & Strategy", articleCount: 16, sentiment: { positive: 12, neutral: 3, negative: 1 }, riskLevel: "low", trend: "stable" },
    { topic: "Customer Experience", articleCount: 12, sentiment: { positive: 5, neutral: 3, negative: 4 }, riskLevel: "medium", trend: "falling" },
    { topic: "Labor Relations", articleCount: 11, sentiment: { positive: 2, neutral: 4, negative: 5 }, riskLevel: "high", trend: "rising" },
    { topic: "Awards & Recognition", articleCount: 10, sentiment: { positive: 10, neutral: 0, negative: 0 }, riskLevel: "low", trend: "stable" },
  ],
  narratives: [
    { narrative: "Bank of Africa is consolidating its position as Morocco's #2 bank with strong Q2 results", strength: 86, sentiment: 0.7, articleCount: 48, trend: "peak" },
    { narrative: "Bank of Africa is leading digital transformation in Moroccan banking", strength: 78, sentiment: 0.8, articleCount: 42, trend: "growing" },
    { narrative: "Bank of Africa's pan-African expansion is accelerating with Nigeria entry", strength: 72, sentiment: 0.75, articleCount: 38, trend: "growing" },
    { narrative: "Bank of Africa is committed to sustainable finance and ESG leadership", strength: 56, sentiment: 0.7, articleCount: 28, trend: "growing" },
    { narrative: "Bank of Africa faces labor tensions and customer service challenges", strength: 42, sentiment: -0.3, articleCount: 23, trend: "emerging" },
  ],
  risks: [
    { label: "Labor Dispute", category: "Operational", frequency: 65, impactSeverity: 70, velocity: 55, riskScore: 62, trajectory: "rising", recommendation: "Engage union leadership in mediation. Prepare public statement acknowledging concerns and outlining resolution timeline." },
    { label: "Regulatory Violation", category: "Legal", frequency: 45, impactSeverity: 75, velocity: 40, riskScore: 55, trajectory: "stable", recommendation: "Strengthen AML compliance team. Conduct internal audit of reporting processes. Engage with BAM on remediation." },
    { label: "Customer Backlash", category: "Consumer", frequency: 55, impactSeverity: 60, velocity: 50, riskScore: 55, trajectory: "rising", recommendation: "Address digital service outages. Improve customer communication. Deploy 24/7 support during peak hours." },
    { label: "Cyber Attack Risk", category: "Operational", frequency: 35, impactSeverity: 85, velocity: 45, riskScore: 53, trajectory: "stable", recommendation: "Conduct penetration testing. Update incident response plan. Train staff on phishing awareness." },
    { label: "Brand Reputation Threat", category: "Consumer", frequency: 30, impactSeverity: 75, velocity: 35, riskScore: 45, trajectory: "stable", recommendation: "Monitor social media for negative sentiment clusters. Prepare holding statements for potential crises." },
  ],
  competitors: [
    { name: "Attijariwafa Bank", score: 84, scoreDelta: 12, shareOfVoice: 27, sentimentGap: 4, topStrength: "Strong positive sentiment", topWeakness: "Limited AI visibility" },
    { name: "CIH Bank", score: 68, scoreDelta: -4, shareOfVoice: 14, sentimentGap: -3, topStrength: "Solid digital strategy", topWeakness: "Negative sentiment exposure" },
    { name: "Banque Populaire", score: 66, scoreDelta: -6, shareOfVoice: 18, sentimentGap: -2, topStrength: "Wide branch network", topWeakness: "Limited international presence" },
    { name: "Crédit Agricole Maroc", score: 62, scoreDelta: -10, shareOfVoice: 11, sentimentGap: -5, topStrength: "Agricultural sector focus", topWeakness: "Weak media engagement" },
    { name: "CFG Bank", score: 58, scoreDelta: -14, shareOfVoice: 8, sentimentGap: -8, topStrength: "Investment banking niche", topWeakness: "Limited visibility" },
  ],
  industryAverages: { score: 67, sentiment: 62, aiVisibility: 58 },
  recommendations: [
    { priority: "critical", action: "Resolve labor dispute with union before Q3 results", rationale: "Strike threat could disrupt operations and damage Q3 results. 23 articles with negative sentiment in 30 days.", timeline: "2 weeks", owner: "HR + CEO Office" },
    { priority: "high", action: "Strengthen AML compliance processes", rationale: "MAD 2.5M fine from BAM. Risk of escalation if not addressed. Regulatory topic velocity +40%.", timeline: "30 days", owner: "Compliance + Legal" },
    { priority: "high", action: "Improve Claude visibility — not cited in Claude responses", rationale: "Claude is the fastest-growing AI engine in MENA. Missing citations = lost opportunity with AI-using prospects.", timeline: "60 days", owner: "Marketing + Content" },
    { priority: "high", action: "Address customer service complaints surge", rationale: "15% increase in complaints. Negative sentiment rising. Risk of social media escalation.", timeline: "45 days", owner: "Customer Experience" },
    { priority: "medium", action: "Amplify digital transformation narrative", rationale: "Strong positive sentiment (0.8) but only 78/100 strength. More coverage would lift volume score.", timeline: "Ongoing", owner: "Communications" },
    { priority: "medium", action: "Develop thought leadership on sustainable finance", rationale: "ESG narrative is growing. Position CEO as voice on African sustainable finance.", timeline: "90 days", owner: "PR + Sustainability" },
    { priority: "low", action: "Maintain awards momentum", rationale: "10 articles on awards. Strong positive sentiment. Continue submitting to industry awards.", timeline: "Ongoing", owner: "Marketing" },
  ],
  actionPlan: [
    { week: "Week 1", milestone: "Crisis: Hold emergency union meeting, prepare holding statement", owner: "HR Director" },
    { week: "Week 1", milestone: "Compliance: Engage external counsel, begin AML audit", owner: "CFO + Legal" },
    { week: "Week 2", milestone: "Strike resolution: Sign agreement, public announcement", owner: "CEO Office" },
    { week: "Week 2", milestone: "Claude visibility: Publish structured content on Wikipedia, Crunchbase", owner: "Marketing" },
    { week: "Week 3", milestone: "Customer service: Deploy 24/7 support, fix digital outages", owner: "Customer Experience" },
    { week: "Week 4", milestone: "AML: Submit remediation plan to BAM, internal review", owner: "Compliance" },
    { week: "Week 5-6", milestone: "Comms: Launch digital transformation PR campaign", owner: "Communications" },
    { week: "Week 7-8", milestone: "Sustainability: CEO op-ed in Financial Afrik, ESG report", owner: "PR + Sustainability" },
    { week: "Week 9-10", milestone: "Claude: Publish 5 thought leadership articles", owner: "Content + Marketing" },
    { week: "Week 11-12", milestone: "Review: Re-audit, measure score improvement, plan Q4", owner: "Strategy" },
  ],
  sources: [
    { name: "Medias24", articles: 42, sentiment: "positive" },
    { name: "TelQuel", articles: 38, sentiment: "positive" },
    { name: "Aujourd'hui Le Maroc", articles: 32, sentiment: "neutral" },
    { name: "Financial Afrik", articles: 28, sentiment: "positive" },
    { name: "Le Site Info", articles: 24, sentiment: "neutral" },
    { name: "Infomediaire", articles: 22, sentiment: "positive" },
    { name: "Barlamane", articles: 18, sentiment: "neutral" },
    { name: "Google News (FR)", articles: 16, sentiment: "positive" },
    { name: "Hespress (AR)", articles: 14, sentiment: "neutral" },
    { name: "Africa News (EN)", articles: 13, sentiment: "positive" },
  ],
};

export function InstitutionalAuditTemplate({
  data,
  teaser = true,
}: {
  data?: Partial<AuditData>;
  teaser?: boolean;
}) {
  const d = { ...DEFAULT_DATA, ...data };
  const [showBlur] = useState(teaser);

  return (
    <div style={{
      background: C.bg, color: C.text,
      fontFamily: "'Inter', -apple-system, sans-serif",
      fontSize: "14px", lineHeight: 1.55,
      maxWidth: "900px", margin: "0 auto",
    }}>
      {/* ─── PAGE 1: COVER ──────────────────────────────────── */}
      <div style={pageStyle}>
        {/* Header bar */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 0", borderBottom: `2px solid ${C.text}`,
          marginBottom: "80px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "6px",
              background: C.text, color: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "14px", fontFamily: "'JetBrains Mono', monospace",
            }}>
              H
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em" }}>
                HARCH ATELIER
              </div>
              <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
                AI REPUTATION INTELLIGENCE
              </div>
            </div>
          </div>
          <div style={{
            fontSize: "10px", fontWeight: 700, color: C.deepRed,
            fontFamily: "'JetBrains Mono', monospace",
            padding: "4px 10px", border: `1px solid ${C.deepRed}`,
            borderRadius: "4px", letterSpacing: "0.12em",
          }}>
            CONFIDENTIAL · CLIENT ONLY
          </div>
        </div>

        {/* Title block */}
        <div style={{ marginBottom: "60px" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Institutional Reputation Audit Report
          </div>
          <h1 style={{
            fontSize: "48px", fontWeight: 800, color: C.text,
            letterSpacing: "-0.04em", lineHeight: 1.0, margin: "0 0 16px",
          }}>
            {d.companyName}
          </h1>
          <div style={{
            fontSize: "13px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace",
          }}>
            Reporting period: {d.period} · Generated {d.reportDate}
          </div>
        </div>

        {/* Score + key metrics */}
        <div style={{
          display: "grid", gridTemplateColumns: "280px 1fr",
          gap: "40px", marginBottom: "60px",
        }}>
          {/* Score ring */}
          <div style={{
            padding: "32px", background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "12px", textAlign: "center",
          }}>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Reputation Score
            </div>
            <div style={{
              fontSize: "72px", fontWeight: 900, color: C.sage,
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
              letterSpacing: "-0.04em", marginBottom: "8px",
            }}>
              {d.reputationScore}
            </div>
            <div style={{
              fontSize: "13px", color: C.textSec, marginBottom: "16px",
            }}>
              out of 100
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              fontSize: "12px", fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: d.reputationScore > d.prevScore ? C.sage : C.red,
              padding: "4px 10px", borderRadius: "4px",
              background: d.reputationScore > d.prevScore ? "rgba(74,123,95,0.08)" : "rgba(160,82,75,0.08)",
            }}>
              {d.reputationScore > d.prevScore ? "▲" : "▼"} {Math.abs(d.reputationScore - d.prevScore)} vs prev
            </div>
          </div>

          {/* Key metrics */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
          }}>
            <CoverMetric label="Industry rank" value={`#${d.industryRank}`} sub={`of ${d.industryTotal} banks`} color={C.sage} />
            <CoverMetric label="Share of voice" value={`${d.shareOfVoice}%`} sub="banking sector" color={C.accent} />
            <CoverMetric label="Articles analyzed" value={d.mediaMetrics.totalArticles.toString()} sub={`from ${d.mediaMetrics.uniqueSources} sources`} color={C.text} />
            <CoverMetric label="AI citations" value="3/4" sub="engines citing" color={C.sage} />
            <CoverMetric label="Positive sentiment" value={`${d.sentiment.positive}%`} sub={`of ${d.mediaMetrics.totalArticles} articles`} color={C.sage} />
            <CoverMetric label="Negative sentiment" value={`${d.sentiment.negative}%`} sub="requires monitoring" color={C.red} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "60px", paddingTop: "24px",
          borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between",
          fontSize: "10px", color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>HARCH ATELIER · atelier.harchcorp.com</span>
          <span>Report ID: HA-2026-07-{d.companyName.slice(0, 3).toUpperCase()}-001</span>
        </div>
      </div>

      {/* ─── PAGE 2: EXECUTIVE SUMMARY ──────────────────────── */}
      <div style={pageStyle}>
        <SectionHeader section="01" title="Executive Summary" subtitle="Key findings and recommendations at a glance" />

        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderLeft: `4px solid ${C.sage}`,
          padding: "24px", marginBottom: "24px", borderRadius: "8px",
        }}>
          <div style={{
            fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            Summary
          </div>
          <p style={{
            fontSize: "15px", color: C.text, lineHeight: 1.6, margin: 0,
          }}>
            <strong>{d.companyName}</strong> ranks <strong>#{d.industryRank}</strong> in the Moroccan banking sector with a reputation score of
            <strong> {d.reputationScore}/100</strong> (up {d.reputationScore - d.prevScore} points from previous period).
            The bank shows strong positive sentiment ({d.sentiment.positive}%), driven by robust Q2 results, accelerated digital
            transformation, and successful pan-African expansion. However, three emerging risks require attention:
            labor disputes, AML compliance, and customer service complaints. AI visibility is strong on ChatGPT, Perplexity,
            and Gemini, but <strong>missing on Claude</strong> — the fastest-growing AI engine in MENA.
            Immediate action on labor and compliance could lift the score to 78+ within 60 days.
          </p>
        </div>

        {/* Three-column highlights */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px", marginBottom: "24px",
        }}>
          <HighlightBox label="What's working" color={C.sage} items={[
            "Strong financial results narrative (48 articles, 79% positive)",
            "Digital transformation story gaining traction (42 articles)",
            "Pan-African expansion seen positively (38 articles)",
            "3/4 AI engines cite the bank favorably",
          ]} />
          <HighlightBox label="What needs attention" color={C.amber} items={[
            "Labor dispute risk (rising velocity +55%)",
            "Claude not citing the bank (key gap)",
            "Customer complaints up 15% in Q2",
            "AML compliance fine from BAM (MAD 2.5M)",
          ]} />
          <HighlightBox label="What to do next" color={C.accent} items={[
            "Resolve union dispute within 2 weeks",
            "Submit AML remediation plan to BAM",
            "Publish structured content for Claude",
            "Deploy 24/7 customer support",
          ]} />
        </div>

        {/* Score breakdown */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "8px", padding: "24px",
        }}>
          <div style={{
            fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Score Composition
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}>
            {[
              { label: "Sentiment", value: d.scoreComponents.sentiment, weight: "40%" },
              { label: "AI Visibility", value: d.scoreComponents.aiVisibility, weight: "30%" },
              { label: "Volume", value: d.scoreComponents.volume, weight: "20%" },
              { label: "Authority", value: d.scoreComponents.authority, weight: "10%" },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontSize: "11px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  marginBottom: "4px",
                }}>
                  {s.label} · {s.weight}
                </div>
                <div style={{
                  fontSize: "24px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, marginBottom: "6px",
                }}>
                  {s.value}
                </div>
                <div style={{
                  width: "100%", height: "4px", background: C.surfaceAlt,
                  borderRadius: "2px", overflow: "hidden",
                }}>
                  <div style={{
                    width: `${s.value}%`, height: "100%",
                    background: s.value >= 70 ? C.sage : s.value >= 50 ? C.amber : C.red,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FROM HERE: BLUR IF TEASER MODE ─────────────────── */}
      <div style={showBlur ? {
        filter: "blur(8px)",
        pointerEvents: "none",
        userSelect: "none",
        position: "relative",
      } : {}}>

        {/* ─── PAGE 3: SENTIMENT ANALYSIS DEEP DIVE ──────────── */}
        <div style={pageStyle}>
          <SectionHeader section="02" title="Sentiment Analysis" subtitle="Entity-level trilingual analysis (FR · AR · EN)" />

          {/* Sentiment breakdown */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "32px", marginBottom: "32px",
          }}>
            <div>
              <div style={subHeadStyle}>Distribution</div>
              <div style={{ display: "flex", height: "32px", borderRadius: "6px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ width: `${d.sentiment.positive}%`, background: C.sage, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {d.sentiment.positive}%
                </div>
                <div style={{ width: `${d.sentiment.neutral}%`, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {d.sentiment.neutral}%
                </div>
                <div style={{ width: `${d.sentiment.negative}%`, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                  {d.sentiment.negative}%
                </div>
              </div>
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>
                <span>● Positive</span>
                <span style={{ color: C.accent }}>● Neutral</span>
                <span style={{ color: C.red }}>● Negative</span>
              </div>
            </div>
            <div>
              <div style={subHeadStyle}>By language</div>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  { lang: "FR", count: d.mediaMetrics.languages.fr, pct: Math.round((d.mediaMetrics.languages.fr / d.mediaMetrics.totalArticles) * 100) },
                  { lang: "AR", count: d.mediaMetrics.languages.ar, pct: Math.round((d.mediaMetrics.languages.ar / d.mediaMetrics.totalArticles) * 100) },
                  { lang: "EN", count: d.mediaMetrics.languages.en, pct: Math.round((d.mediaMetrics.languages.en / d.mediaMetrics.totalArticles) * 100) },
                ].map(l => (
                  <div key={l.lang} style={{
                    flex: 1, padding: "16px", background: C.surface,
                    border: `1px solid ${C.border}`, borderRadius: "6px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "6px" }}>{l.lang}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{l.count}</div>
                    <div style={{ fontSize: "11px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>{l.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top positive and negative articles */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "24px", marginBottom: "32px",
          }}>
            <div>
              <div style={subHeadStyle}>Top positive articles</div>
              {d.topArticles.filter(a => a.sentiment === "positive").slice(0, 5).map((a, i) => (
                <ArticleRow key={i} article={a} />
              ))}
            </div>
            <div>
              <div style={subHeadStyle}>Negative coverage (requires attention)</div>
              {d.topArticles.filter(a => a.sentiment === "negative").slice(0, 5).map((a, i) => (
                <ArticleRow key={i} article={a} />
              ))}
            </div>
          </div>
        </div>

        {/* ─── PAGE 4: AI VISIBILITY MATRIX ──────────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="03" title="AI Visibility Matrix" subtitle="Where AI engines cite (or don't cite) your company" />

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px", marginBottom: "32px",
          }}>
            {[
              { name: "ChatGPT", data: d.aiMetrics.chatgpt, color: "#10A37F" },
              { name: "Perplexity", data: d.aiMetrics.perplexity, color: "#20808D" },
              { name: "Gemini", data: d.aiMetrics.gemini, color: "#4285F4" },
              { name: "HarchIQ", data: d.aiMetrics.glm, color: "#A0524B" },
            ].map(engine => (
              <div key={engine.name} style={{
                padding: "20px", background: C.surface,
                border: `1px solid ${engine.data.cited ? C.sage : C.red}`,
                borderRadius: "10px", textAlign: "center",
              }}>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.textMuted, letterSpacing: "0.1em",
                  textTransform: "uppercase", marginBottom: "8px",
                }}>
                  {engine.name}
                </div>
                <div style={{
                  fontSize: "32px", fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: engine.data.cited ? C.sage : C.red, lineHeight: 1, marginBottom: "6px",
                }}>
                  {engine.data.cited ? "✓" : "✗"}
                </div>
                <div style={{
                  fontSize: "11px", color: engine.data.cited ? C.sage : C.red,
                  fontWeight: 600, marginBottom: "8px",
                }}>
                  {engine.data.cited ? "CITED" : "NOT CITED"}
                </div>
                <div style={{ fontSize: "11px", color: C.textSec, marginBottom: "2px" }}>
                  Position: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{engine.data.position}</strong>
                </div>
                <div style={{ fontSize: "11px", color: C.textSec }}>
                  Sentiment: <strong>{engine.data.sentiment}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* AI query samples */}
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "8px", padding: "20px",
          }}>
            <div style={subHeadStyle}>Sample queries tested</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "What are the best banks in Morocco?",
                "Top Moroccan banks for SMEs",
                "Which Moroccan bank is best for international business?",
                "Best digital bank in Morocco",
                "Bank of Africa vs Attijariwafa Bank",
              ].map((q, i) => (
                <div key={i} style={{
                  padding: "10px 14px", background: C.bg,
                  border: `1px solid ${C.border}`, borderRadius: "6px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  fontSize: "13px",
                }}>
                  <span style={{ color: C.text }}>"{q}"</span>
                  <span style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: i < 3 ? C.sage : C.amber, fontWeight: 600,
                  }}>
                    {i < 3 ? "CITED" : i === 3 ? "PARTIAL" : "MISSED"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── PAGE 5: TOP 30 ARTICLES (showing first 15) ─── */}
        <div style={pageStyle}>
          <SectionHeader section="04" title="Top Articles by Relevance" subtitle={`Top 15 of ${d.mediaMetrics.totalArticles} articles, sorted by relevance score`} />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.topArticles.slice(0, 15).map((a, i) => (
              <div key={i} style={{
                padding: "14px 16px", background: C.surface,
                border: `1px solid ${C.borderLight}`, borderRadius: "6px",
                display: "grid", gridTemplateColumns: "40px 1fr 80px 100px 60px",
                gap: "12px", alignItems: "center",
              }}>
                <div style={{
                  fontSize: "13px", fontWeight: 700, color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  #{i + 1}
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text, marginBottom: "3px" }}>
                    {a.title}
                  </div>
                  <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {a.source} · {a.date}
                  </div>
                </div>
                <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec, textAlign: "center" }}>
                  {a.source}
                </div>
                <div style={{ textAlign: "center" }}>
                  <SentimentBadge sentiment={a.sentiment} />
                </div>
                <div style={{
                  fontSize: "13px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: a.relevance >= 80 ? C.sage : a.relevance >= 60 ? C.amber : C.textMuted,
                  textAlign: "center",
                }}>
                  {a.relevance}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "16px", padding: "12px 16px", background: C.surface,
            border: `1px dashed ${C.border}`, borderRadius: "6px",
            textAlign: "center", fontSize: "12px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            + {d.mediaMetrics.totalArticles - 15} more articles in full report · Top 30 in paid version
          </div>
        </div>

        {/* ─── PAGE 6: TOPIC CLUSTERING ─────────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="05" title="Topic Clustering" subtitle="10 dominant topics with sentiment distribution and risk levels" />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.topics.map((t, i) => (
              <div key={i} style={{
                padding: "14px 16px", background: C.surface,
                border: `1px solid ${C.borderLight}`, borderRadius: "6px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: "10px",
                }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>
                    {t.topic}
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span style={{
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                      color: C.textSec,
                    }}>
                      {t.articleCount} articles
                    </span>
                    <RiskLevelBadge level={t.riskLevel} />
                    <span style={{
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                      color: t.trend === "rising" ? C.sage : t.trend === "falling" ? C.red : C.textMuted,
                      fontWeight: 600,
                    }}>
                      {t.trend === "rising" ? "▲" : t.trend === "falling" ? "▼" : "—"} {t.trend}
                    </span>
                  </div>
                </div>
                {/* Sentiment bar */}
                <div style={{ display: "flex", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${(t.sentiment.positive / t.articleCount) * 100}%`, background: C.sage }} />
                  <div style={{ width: `${(t.sentiment.neutral / t.articleCount) * 100}%`, background: C.accent }} />
                  <div style={{ width: `${(t.sentiment.negative / t.articleCount) * 100}%`, background: C.red }} />
                </div>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.textMuted, marginTop: "4px",
                }}>
                  <span style={{ color: C.sage }}>+{t.sentiment.positive} positive</span>
                  <span style={{ color: C.accent }}>{t.sentiment.neutral} neutral</span>
                  <span style={{ color: C.red }}>-{t.sentiment.negative} negative</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 7: NARRATIVE DETECTION ──────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="06" title="Narrative Detection" subtitle="5 dominant narratives shaping public perception" />

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {d.narratives.map((n, i) => (
              <div key={i} style={{
                padding: "20px", background: C.surface,
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${n.sentiment > 0.5 ? C.sage : n.sentiment > 0 ? C.amber : C.red}`,
                borderRadius: "8px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "12px",
                }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, flex: 1, paddingRight: "16px" }}>
                    "{n.narrative}"
                  </div>
                  <div style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    padding: "3px 8px", borderRadius: "4px",
                    background: n.trend === "peak" ? "rgba(74,123,95,0.1)" :
                                n.trend === "growing" ? "rgba(74,123,95,0.08)" :
                                n.trend === "emerging" ? "rgba(184,115,51,0.1)" : "rgba(160,82,75,0.1)",
                    color: n.trend === "peak" ? C.sage :
                           n.trend === "growing" ? C.sage :
                           n.trend === "emerging" ? C.amber : C.red,
                    fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    {n.trend}
                  </div>
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "16px",
                }}>
                  <div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Strength</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{n.strength}/100</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Sentiment</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: n.sentiment > 0 ? C.sage : C.red }}>
                      {n.sentiment > 0 ? "+" : ""}{(n.sentiment * 100).toFixed(0)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Articles</div>
                    <div style={{ fontSize: "20px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>{n.articleCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 8: RISK ASSESSMENT ──────────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="07" title="Risk Assessment" subtitle="Top 5 detected risks with mitigation recommendations" />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {d.risks.map((r, i) => (
              <div key={i} style={{
                padding: "20px", background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "14px",
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                      {r.category}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                      {r.label}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "32px", fontWeight: 800, color: r.riskScore >= 60 ? C.red : r.riskScore >= 45 ? C.amber : C.accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                      {r.riskScore}
                    </div>
                    <div style={{
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                      color: r.trajectory === "rising" ? C.red : r.trajectory === "declining" ? C.sage : C.textMuted,
                      fontWeight: 600,
                    }}>
                      {r.trajectory === "rising" ? "▲" : r.trajectory === "declining" ? "▼" : "—"} {r.trajectory}
                    </div>
                  </div>
                </div>
                {/* Three scores */}
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "12px", marginBottom: "14px",
                }}>
                  {[
                    { label: "Frequency", value: r.frequency },
                    { label: "Impact", value: r.impactSeverity },
                    { label: "Velocity", value: r.velocity },
                  ].map(s => (
                    <div key={s.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", marginBottom: "4px" }}>
                        <span>{s.label}</span>
                        <span style={{ color: C.text, fontWeight: 700 }}>{s.value}</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", background: C.surfaceAlt, borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{
                          width: `${s.value}%`, height: "100%",
                          background: s.value >= 70 ? C.red : s.value >= 50 ? C.amber : C.accent,
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Recommendation */}
                <div style={{
                  padding: "12px", background: C.bg,
                  border: `1px solid ${C.borderLight}`, borderRadius: "6px",
                  fontSize: "12px", color: C.textSec, lineHeight: 1.5,
                }}>
                  <strong style={{ color: C.text }}>Recommendation:</strong> {r.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 9: COMPETITOR BENCHMARKING ────────── */}
        <div style={pageStyle}>
          <SectionHeader section="08" title="Competitor Benchmarking" subtitle={`How ${d.companyName} compares to top 5 competitors`} />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {d.competitors.map((c, i) => (
              <div key={i} style={{
                padding: "20px", background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: "8px",
                display: "grid", gridTemplateColumns: "1fr auto",
                gap: "20px", alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                      {c.name}
                    </span>
                    <span style={{
                      fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 8px", borderRadius: "4px",
                      background: c.scoreDelta > 0 ? "rgba(74,123,95,0.08)" : "rgba(160,82,75,0.08)",
                      color: c.scoreDelta > 0 ? C.sage : C.red, fontWeight: 700,
                    }}>
                      {c.scoreDelta > 0 ? "▲" : "▼"} {Math.abs(c.scoreDelta)}
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "12px" }}>
                    <div>
                      <div style={{ color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Share of voice</div>
                      <div style={{ fontWeight: 700, color: C.text }}>{c.shareOfVoice}%</div>
                    </div>
                    <div>
                      <div style={{ color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sentiment gap</div>
                      <div style={{ fontWeight: 700, color: c.sentimentGap > 0 ? C.sage : C.red }}>
                        {c.sentimentGap > 0 ? "+" : ""}{c.sentimentGap}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top strength</div>
                      <div style={{ fontWeight: 600, color: C.text, fontSize: "11px" }}>{c.topStrength}</div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: c.score >= 75 ? C.sage : c.score >= 60 ? C.accent : C.amber, lineHeight: 1 }}>
                    {c.score}
                  </div>
                  <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>score</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 10: RECOMMENDATIONS ──────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="09" title="Strategic Recommendations" subtitle="Prioritized actions with timeline and ownership" />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {d.recommendations.map((r, i) => (
              <div key={i} style={{
                padding: "20px", background: C.surface,
                border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${
                  r.priority === "critical" ? C.deepRed :
                  r.priority === "high" ? C.red :
                  r.priority === "medium" ? C.amber : C.accent
                }`,
                borderRadius: "8px",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "10px",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "inline-block", fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      padding: "3px 8px", borderRadius: "4px",
                      background: r.priority === "critical" ? "rgba(160,40,40,0.1)" :
                                  r.priority === "high" ? "rgba(160,82,75,0.1)" :
                                  r.priority === "medium" ? "rgba(184,115,51,0.1)" : "rgba(74,93,110,0.1)",
                      color: r.priority === "critical" ? C.deepRed :
                             r.priority === "high" ? C.red :
                             r.priority === "medium" ? C.amber : C.accent,
                      letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px",
                    }}>
                      {r.priority} priority
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                      {r.action}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.55, margin: "0 0 12px" }}>
                  {r.rationale}
                </p>
                <div style={{
                  display: "flex", gap: "20px", fontSize: "11px",
                  fontFamily: "'JetBrains Mono', monospace", color: C.textMuted,
                }}>
                  <span>⏱ <strong style={{ color: C.text }}>{r.timeline}</strong></span>
                  <span>👤 <strong style={{ color: C.text }}>{r.owner}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 11: 90-DAY ACTION PLAN ────────────── */}
        <div style={pageStyle}>
          <SectionHeader section="10" title="90-Day Action Plan" subtitle="Week-by-week milestones with ownership" />

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {d.actionPlan.map((p, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "80px 1fr 160px",
                gap: "16px", padding: "14px 16px",
                background: C.surface, border: `1px solid ${C.borderLight}`,
                borderRadius: "6px", alignItems: "center",
              }}>
                <div style={{
                  fontSize: "12px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: C.sage,
                }}>
                  {p.week}
                </div>
                <div style={{ fontSize: "13px", color: C.text }}>
                  {p.milestone}
                </div>
                <div style={{
                  fontSize: "11px", color: C.textSec,
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "right",
                }}>
                  {p.owner}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PAGE 12: METHODOLOGY & SOURCES ─────────── */}
        <div style={pageStyle}>
          <SectionHeader section="11" title="Methodology & Sources" subtitle="How this report was generated" />

          {/* Methodology */}
          <div style={{
            padding: "24px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "8px",
            marginBottom: "24px",
          }}>
            <div style={subHeadStyle}>Data Collection</div>
            <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: "0 0 16px" }}>
              This report analyzed <strong>{d.mediaMetrics.totalArticles} articles</strong> from
              <strong> {d.mediaMetrics.uniqueSources} unique sources</strong> across three languages
              (FR {d.mediaMetrics.languages.fr}, AR {d.mediaMetrics.languages.ar}, EN {d.mediaMetrics.languages.en}).
              Sources include Moroccan media (TelQuel, Medias24, Aujourd'hui Le Maroc, Le Site Info, Barlamane,
              Infomediaire), African business media (Financial Afrik, Africa News), and Google News aggregation.
            </p>
            <div style={subHeadStyle}>Analysis Pipeline</div>
            <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: "0 0 16px" }}>
              Articles processed through Harch Intelligence Engine v2: entity-level sentiment analysis
              (trilingual lexicon of 108+ words), topic clustering (10 categories), narrative detection
              (top 5 by strength), risk assessment (32 risk categories scored on Frequency × Impact × Velocity),
              AI visibility testing (4 engines × 5 queries), competitor benchmarking, and recommendation generation.
              HarchIQ powers advanced entity recognition and narrative synthesis.
            </p>
            <div style={subHeadStyle}>Scoring Formula</div>
            <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
              Reputation Score = (Sentiment × 0.40) + (AI Visibility × 0.30) + (Volume × 0.20) + (Authority × 0.10).
              Each component scored 0-100. Pillar weights (Innovation/Performance/Purpose) calculated as % of
              narrative coverage. Risk Score = (Frequency × 0.30) + (Impact × 0.50) + (Velocity × 0.20).
            </p>
          </div>

          {/* Sources */}
          <div style={{
            padding: "24px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "8px",
          }}>
            <div style={subHeadStyle}>Top sources by volume</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {d.sources.map((s, i) => (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 100px",
                  gap: "12px", padding: "10px 14px",
                  background: C.bg, border: `1px solid ${C.borderLight}`,
                  borderRadius: "6px", alignItems: "center",
                }}>
                  <div style={{ fontSize: "13px", color: C.text, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec, textAlign: "center" }}>
                    {s.articles} articles
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <SentimentBadge sentiment={s.sentiment as "positive" | "neutral" | "negative"} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: "32px", padding: "16px 20px",
            background: C.surfaceAlt, borderRadius: "8px",
            fontSize: "11px", color: C.textMuted, lineHeight: 1.5,
          }}>
            <strong style={{ color: C.textSec }}>Disclaimer:</strong> This report is based on publicly available
            media coverage and AI engine responses as of {d.reportDate}. Sentiment analysis uses trilingual lexicon-based
            NLP, not surveys. Scores may shift with new coverage. Recommendations are advisory and should be validated
            with internal data. © Harch Atelier 2026. Confidential — do not distribute.
          </div>
        </div>
      </div>

      {/* ─── BLUR OVERLAY (if teaser mode) ────────────── */}
      {showBlur && (
        <div style={{
          position: "absolute", top: "60%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: C.text, color: "#FFFFFF",
          padding: "32px 48px", borderRadius: "12px",
          textAlign: "center", zIndex: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          maxWidth: "440px",
        }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "12px",
          }}>
            Full report · 12 pages · 10x more data
          </div>
          <h3 style={{
            fontSize: "24px", fontWeight: 700, color: "#FFFFFF",
            letterSpacing: "-0.02em", margin: "0 0 12px",
          }}>
            Unlock the complete institutional audit.
          </h3>
          <p style={{
            fontSize: "13px", color: "rgba(255,255,255,0.7)",
            lineHeight: 1.5, marginBottom: "20px",
          }}>
            Get 11 more sections: AI visibility matrix, top 30 articles, topic clustering,
            narratives, risk assessment, competitor benchmarks, 90-day action plan, methodology.
          </p>
          <a href="/atelier/pricing" style={{
            display: "inline-block", padding: "12px 24px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "14px", fontWeight: 600, textDecoration: "none",
            borderRadius: "6px", fontFamily: "'Inter', sans-serif",
          }}>
            Get full report →
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function CoverMetric({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{
      padding: "16px 18px", background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: "8px",
    }}>
      <div style={{
        fontSize: "10px", color: C.textMuted,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: "0.08em", textTransform: "uppercase",
        marginBottom: "6px",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "24px", fontWeight: 800, color,
        fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
        marginBottom: "4px",
      }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: C.textSec }}>
        {sub}
      </div>
    </div>
  );
}

function SectionHeader({ section, title, subtitle }: { section: string; title: string; subtitle: string }) {
  return (
    <div style={{
      marginBottom: "32px", paddingBottom: "20px",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        marginBottom: "8px",
      }}>
        <span style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.sage, letterSpacing: "0.14em", fontWeight: 700,
        }}>
          § {section}
        </span>
        <span style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          Harch Atelier
        </span>
      </div>
      <h2 style={{
        fontSize: "28px", fontWeight: 700, color: C.text,
        letterSpacing: "-0.03em", margin: "0 0 6px",
      }}>
        {title}
      </h2>
      <div style={{ fontSize: "13px", color: C.textSec }}>
        {subtitle}
      </div>
    </div>
  );
}

function HighlightBox({ label, color, items }: { label: string; color: string; items: string[] }) {
  return (
    <div style={{
      padding: "20px", background: C.surface,
      border: `1px solid ${C.border}`,
      borderTop: `3px solid ${color}`,
      borderRadius: "8px",
    }}>
      <div style={{
        fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
        color, letterSpacing: "0.12em", textTransform: "uppercase",
        marginBottom: "12px", fontWeight: 700,
      }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((it, i) => (
          <div key={i} style={{
            fontSize: "12px", color: C.text, lineHeight: 1.5,
            display: "flex", gap: "8px",
          }}>
            <span style={{ color, fontWeight: 700, flexShrink: 0 }}>▸</span>
            <span>{it}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <div style={{
      padding: "12px", background: C.surface,
      border: `1px solid ${C.borderLight}`, borderRadius: "6px",
      marginBottom: "8px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "6px", gap: "8px",
      }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: C.text, flex: 1, lineHeight: 1.4 }}>
          {article.title}
        </div>
        <SentimentBadge sentiment={article.sentiment} />
      </div>
      <div style={{
        fontSize: "10px", color: C.textMuted,
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        {article.source} · {article.date} · relevance {article.relevance}
      </div>
    </div>
  );
}

function SentimentBadge({ sentiment }: { sentiment: "positive" | "neutral" | "negative" }) {
  const colors = {
    positive: { bg: "rgba(74,123,95,0.1)", text: C.sage },
    neutral: { bg: "rgba(74,93,110,0.1)", text: C.accent },
    negative: { bg: "rgba(160,82,75,0.1)", text: C.red },
  };
  const c = colors[sentiment];
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      fontSize: "10px", fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      color: c.text, background: c.bg,
      borderRadius: "4px", letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      {sentiment}
    </span>
  );
}

function RiskLevelBadge({ level }: { level: "low" | "medium" | "high" | "critical" }) {
  const colors = {
    low: { bg: "rgba(74,123,95,0.1)", text: C.sage },
    medium: { bg: "rgba(74,93,110,0.1)", text: C.accent },
    high: { bg: "rgba(160,82,75,0.1)", text: C.red },
    critical: { bg: "rgba(160,40,40,0.15)", text: C.deepRed },
  };
  const c = colors[level];
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px",
      fontSize: "10px", fontWeight: 700,
      fontFamily: "'JetBrains Mono', monospace",
      color: c.text, background: c.bg,
      borderRadius: "4px", letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      {level}
    </span>
  );
}

const pageStyle: React.CSSProperties = {
  background: C.bg, padding: "48px 56px", minHeight: "1200px",
  pageBreakAfter: "always", position: "relative",
  borderBottom: `1px dashed ${C.border}`,
};

const subHeadStyle: React.CSSProperties = {
  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
  color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
  marginBottom: "10px", fontWeight: 600,
};

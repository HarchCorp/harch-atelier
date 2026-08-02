"use client";

import { useState, useEffect } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  FLAGSHIP REPORT — Morocco Reputation Intelligence Report 2026
//
//  The biggest, most comprehensive report Harch Atelier produces.
//  15+ sections aggregating ALL real data:
//    1. Cover / hero
//    2. Executive summary (key numbers)
//    3. Harch 100 ranking (8 companies)
//    4. Sector deep-dives
//    5. Key people (20 CEOs, ministers, regulators)
//    6. 1-year sentiment trends (per company)
//    7. Key events timeline (27 anchor events)
//    8. BVC market performance (10 tickers, 365 days)
//    9. Risk register (25 assessments)
//    10. AI visibility (8 engines)
//    11. Source breakdown (top 15 media)
//    12. Language analysis
//    13. Sentiment distribution
//    14. Methodology
//    15. Download / share
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#0A0A0A",
  surface: "#FFFFFF",
  surfaceAlt: "#F8F8F8",
  surfaceDark: "#171717",
  border: "#E5E5E5",
  borderDark: "#262626",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  textOnDark: "#FAFAFA",
  textOnDarkMuted: "#A3A3A3",
  accent: "#059669",
  accentBright: "#10B981",
  sage: "#4A7B5F",
  red: "#DC2626",
  amber: "#D97706",
  gold: "#856914",
  purple: "#7C3AED",
  blue: "#0369A1",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  shadowLg: "0 4px 24px rgba(0,0,0,0.08)",
};

interface ReportData {
  meta: {
    title: string;
    subtitle: string;
    period: string;
    generatedAt: string;
    version: string;
  };
  summary: {
    totalCompanies: number;
    totalPeople: number;
    totalArticles: number;
    totalSentimentSnapshots: number;
    totalBvcPrices: number;
    totalRiskAssessments: number;
    totalAiVisibilityRecords: number;
    totalAssets: number;
    reportingPeriodDays: number;
  };
  companies: Array<{
    id: string;
    slug: string;
    name: string;
    sector: string;
    ticker: string | null;
    headquarters: string | null;
    foundedYear: number | null;
    description: string | null;
    reputationScore: number;
    trend: string;
    shareOfVoice: number;
    articleCount: number;
    riskCount: number;
    aiVisibilityCount: number;
    avgSentiment: number;
    currentSentiment: number;
    sentimentDelta: number;
    sentimentTrend: Array<{ score: number; date: string }>;
    topRisks: Array<{ category: string; level: string; score: number; trajectory: string | null }>;
    aiEngines: Array<{ platform: string; cited: boolean; sentiment: string | null; rank: number | null }>;
    recentArticles: Array<{ title: string; source: string; sentiment: string | null; date: string | null }>;
  }>;
  people: Array<{
    id: string;
    name: string;
    aliases: string[];
    role: string;
    tags: string[];
    mentionCount: number;
    avgSentiment: number;
    companyCount: number;
    lastMentionedAt: string | null;
  }>;
  keyEvents: Array<{
    title: string;
    source: string;
    sourceType: string;
    sentiment: string | null;
    score: number | null;
    date: string | null;
    companyId: string | null;
  }>;
  sectors: Array<{ sector: string; count: number; companies: number; avgScore: number }>;
  topSources: Array<{ source: string; count: number }>;
  languages: Array<{ lang: string; count: number }>;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  assets: Array<{
    ticker: string;
    name: string;
    sector: string | null;
    currentPrice: number;
    yearStartPrice: number;
    yearChangePct: number;
    avgVolume: number;
    dataPoints: number;
    priceHistory: Array<{ price: number; date: string }>;
  }>;
  risks: Array<{
    company: string | null;
    category: string;
    level: string;
    score: number;
    trajectory: string | null;
    date: string;
  }>;
  methodology: {
    dataSources: string[];
    framework: string;
    refreshCycle: string;
    coverageWindow: string;
  };
}

export default function FlagshipReportPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchReport() {
      try {
        const res = await fetch("/api/flagship-report");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.success && json.data) {
          setReport(json.data);
        } else {
          setError(json.error || "Failed to load report");
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchReport();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <ReportSkeleton />;
  if (error) return <ReportError error={error} />;
  if (!report) return <ReportError error="No data" />;

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <ReportContent report={report} />
      <AtelierFooter />
      <BackToTop />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  LOADING SKELETON
// ═══════════════════════════════════════════════════════════════

function ReportSkeleton() {
  return (
    <>
      <AtelierNav />
      <div style={{ minHeight: "100vh", background: C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            border: `3px solid ${C.border}`, borderTopColor: C.accent,
            animation: "spin 1s linear infinite",
            margin: "0 auto 24px",
          }} />
          <div style={{ fontSize: "14px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Compiling flagship report
          </div>
          <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "8px" }}>
            Aggregating 1,858 articles · 416 sentiment snapshots · 3,726 BVC prices
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    </>
  );
}

function ReportError({ error }: { error: string }) {
  return (
    <>
      <AtelierNav />
      <div style={{ minHeight: "100vh", background: C.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "480px", padding: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠</div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: C.text, marginBottom: "8px" }}>
            Report compilation failed
          </h1>
          <p style={{ fontSize: "14px", color: C.textMuted, marginBottom: "24px" }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px", background: C.accent, color: "#fff",
              border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN REPORT CONTENT
// ═══════════════════════════════════════════════════════════════

function ReportContent({ report }: { report: ReportData }) {
  return (
    <div style={{ background: C.surface, fontFamily: "'Inter', sans-serif" }}>
      {/* 1. COVER / HERO */}
      <CoverHero report={report} />

      {/* 2. EXECUTIVE SUMMARY */}
      <ExecutiveSummary report={report} />

      {/* 3. HARCH 100 RANKING */}
      <Harch100Ranking report={report} />

      {/* 4. SECTOR DEEP-DIVES */}
      <SectorDeepDives report={report} />

      {/* 5. KEY PEOPLE */}
      <KeyPeople report={report} />

      {/* 6. SENTIMENT TRENDS */}
      <SentimentTrends report={report} />

      {/* 7. KEY EVENTS TIMELINE */}
      <KeyEventsTimeline report={report} />

      {/* 8. BVC MARKET PERFORMANCE */}
      <BVCMarketPerformance report={report} />

      {/* 9. RISK REGISTER */}
      <RiskRegister report={report} />

      {/* 10. AI VISIBILITY */}
      <AIVisibilitySection report={report} />

      {/* 11. SOURCE BREAKDOWN */}
      <SourceBreakdown report={report} />

      {/* 12. LANGUAGE ANALYSIS */}
      <LanguageAnalysis report={report} />

      {/* 13. SENTIMENT DISTRIBUTION */}
      <SentimentDistribution report={report} />

      {/* 14. METHODOLOGY */}
      <Methodology report={report} />

      {/* 15. DOWNLOAD / SHARE */}
      <DownloadShare report={report} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  1. COVER HERO
// ═══════════════════════════════════════════════════════════════

function CoverHero({ report }: { report: ReportData }) {
  const generatedDate = new Date(report.meta.generatedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <section style={{
      background: `linear-gradient(180deg, ${C.bg} 0%, #1a1a1a 100%)`,
      color: C.textOnDark,
      padding: "80px 24px 64px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${C.borderDark} 1px, transparent 1px), linear-gradient(90deg, ${C.borderDark} 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        opacity: 0.3,
        maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "8px 16px", background: "rgba(5,150,105,0.1)",
          border: `1px solid ${C.accent}40`, borderRadius: "100px",
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accentBright, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "32px",
        }}>
          <span style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: C.accentBright,
            animation: "pulse 2s infinite",
          }} />
          Flagship Report · Edition 2026 · {report.meta.version}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(40px, 8vw, 72px)", fontWeight: 900,
          letterSpacing: "-0.04em", lineHeight: 0.95,
          margin: "0 0 24px", maxWidth: "1000px",
          color: C.textOnDark,
        }}>
          {report.meta.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: "clamp(18px, 3vw, 24px)", color: C.textOnDarkMuted,
          fontWeight: 400, lineHeight: 1.4, marginBottom: "40px",
          maxWidth: "800px",
        }}>
          {report.meta.subtitle}
        </p>

        {/* Meta row */}
        <div style={{
          display: "flex", gap: "32px", flexWrap: "wrap",
          padding: "24px 0", borderTop: `1px solid ${C.borderDark}`,
          borderBottom: `1px solid ${C.borderDark}`,
          marginBottom: "40px",
        }}>
          <div>
            <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textOnDarkMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>Period</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: C.textOnDark }}>{report.meta.period}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textOnDarkMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>Generated</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: C.textOnDark }}>{generatedDate}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textOnDarkMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "4px" }}>Coverage</div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: C.textOnDark }}>{report.summary.reportingPeriodDays} days</div>
          </div>
        </div>

        {/* Big stats */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
        }}>
          <BigStat value={report.summary.totalCompanies} label="Companies tracked" />
          <BigStat value={report.summary.totalPeople} label="Real people mapped" />
          <BigStat value={report.summary.totalArticles.toLocaleString()} label="Articles analyzed" />
          <BigStat value={report.summary.totalSentimentSnapshots.toLocaleString()} label="Sentiment snapshots" />
          <BigStat value={report.summary.totalBvcPrices.toLocaleString()} label="BVC price records" />
          <BigStat value={report.summary.totalRiskAssessments} label="Risk assessments" />
        </div>
        <style>{`
          @media (max-width: 768px) {
            div[style*="repeat(3, 1fr)"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
          @media (max-width: 480px) {
            div[style*="repeat(3, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

function BigStat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div style={{
        fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 900,
        fontFamily: "'JetBrains Mono', monospace",
        color: C.accentBright, lineHeight: 1, letterSpacing: "-0.02em",
        marginBottom: "8px",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "12px", color: C.textOnDarkMuted,
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  2. EXECUTIVE SUMMARY
// ═══════════════════════════════════════════════════════════════

function ExecutiveSummary({ report }: { report: ReportData }) {
  const topCompany = report.companies[0];
  const totalArticles = report.summary.totalArticles;
  const positivePct = (report.sentimentBreakdown.positive / totalArticles) * 100;
  const negativePct = (report.sentimentBreakdown.negative / totalArticles) * 100;
  const topPerson = report.people[0];
  const topSector = report.sectors[0];

  return (
    <SectionWrapper eyebrow="01 · Executive summary" title="The year in numbers.">
      <p style={bodyStyle}>
        Over the past 12 months, Harch Atelier tracked {report.summary.totalCompanies} Moroccan listed companies
        across {report.sectors.length} sectors, analyzing {totalArticles.toLocaleString()} articles from{" "}
        {report.topSources.length}+ Moroccan and African media sources. We mapped {report.summary.totalPeople}{" "}
        real people — executives, ministers, regulators, and journalists — whose mentions move the needle on
        corporate reputation. The result is the most comprehensive reputation intelligence dataset ever produced
        for the Moroccan market.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "32px" }}>
        <InsightCard
          label="Highest reputation"
          value={topCompany?.name || "—"}
          subtext={`${topCompany?.sector} · Score ${topCompany?.reputationScore}/100`}
          color={C.accent}
        />
        <InsightCard
          label="Most mentioned person"
          value={topPerson?.name || "—"}
          subtext={`${topPerson?.mentionCount} mentions · ${topPerson?.role}`}
          color={C.purple}
        />
        <InsightCard
          label="Largest sector"
          value={topSector?.sector || "—"}
          subtext={`${topSector?.companies} companies · ${topSector?.count} articles`}
          color={C.blue}
        />
        <InsightCard
          label="Positive coverage"
          value={`${positivePct.toFixed(1)}%`}
          subtext={`${report.sentimentBreakdown.positive} articles · vs ${negativePct.toFixed(1)}% negative`}
          color={positivePct > negativePct ? C.accent : C.red}
        />
      </div>
    </SectionWrapper>
  );
}

function InsightCard({ label, value, subtext, color }: { label: string; value: string; subtext: string; color: string }) {
  return (
    <div style={{
      padding: "24px", background: C.surfaceAlt, borderRadius: "12px",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
        {label}
      </div>
      <div className="text-truncate" style={{ fontSize: "22px", fontWeight: 800, color, marginBottom: "6px", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div className="text-clamp-2" style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.4 }}>
        {subtext}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  3. HARCH 100 RANKING
// ═══════════════════════════════════════════════════════════════

function Harch100Ranking({ report }: { report: ReportData }) {
  return (
    <SectionWrapper eyebrow="02 · Harch 100 ranking" title="Morocco's most reputable companies.">
      <p style={bodyStyle}>
        Ranked by the Harch Reputation Index — a composite of share of voice (25%), sentiment polarity (25%),
        AI citation frequency (20%), pillar scores (20%), and ESG narrative strength (10%).
      </p>

      <div style={{ marginTop: "32px", border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 120px 80px 80px 100px 100px",
          padding: "16px 20px", background: C.surfaceAlt,
          borderBottom: `1px solid ${C.border}`,
          fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
          color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
        }}>
          <div>Rank</div>
          <div>Company</div>
          <div>Sector</div>
          <div>Score</div>
          <div>Trend</div>
          <div>Articles</div>
          <div>Sentiment</div>
        </div>
        {/* Rows */}
        {report.companies.map((c, i) => {
          const sentColor = c.currentSentiment > 0.1 ? C.accent : c.currentSentiment < -0.1 ? C.red : C.textMuted;
          const trendIcon = c.trend === "up" ? "▲" : c.trend === "down" ? "▼" : "—";
          const trendColor = c.trend === "up" ? C.accent : c.trend === "down" ? C.red : C.textMuted;
          return (
            <div key={c.id} style={{
              display: "grid",
              gridTemplateColumns: "60px 1fr 120px 80px 80px 100px 100px",
              padding: "16px 20px", borderBottom: i < report.companies.length - 1 ? `1px solid ${C.border}` : "none",
              alignItems: "center", background: C.surface,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.surfaceAlt; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.surface; }}
            >
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                #{i + 1}
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="text-truncate" style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "2px" }}>
                  {c.name}
                </div>
                <div className="text-truncate" style={{ fontSize: "11px", color: C.textMuted }}>
                  {c.headquarters} · Founded {c.foundedYear}
                </div>
              </div>
              <div className="text-truncate" style={{ fontSize: "12px", color: C.textSec }}>
                {c.sector}
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.accent }}>
                {c.reputationScore}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: trendColor }}>
                {trendIcon}
              </div>
              <div style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>
                {c.articleCount}
              </div>
              <div style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: sentColor, fontWeight: 700 }}>
                {c.currentSentiment > 0 ? "+" : ""}{c.currentSentiment.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  4. SECTOR DEEP-DIVES
// ═══════════════════════════════════════════════════════════════

function SectorDeepDives({ report }: { report: ReportData }) {
  const maxArticles = Math.max(...report.sectors.map(s => s.count), 1);
  return (
    <SectionWrapper eyebrow="03 · Sector deep-dives" title="Reputation by industry.">
      <p style={bodyStyle}>
        Coverage distribution across {report.sectors.length} sectors, with average reputation scores and
        article volumes.
      </p>
      <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {report.sectors.map((s, i) => {
          const pct = (s.count / maxArticles) * 100;
          const scoreColor = s.avgScore > 80 ? C.accent : s.avgScore > 70 ? C.amber : C.red;
          return (
            <div key={s.sector} style={{
              padding: "20px", background: C.surfaceAlt, borderRadius: "12px",
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, color: C.text }}>
                  {s.sector}
                </div>
                <div style={{ display: "flex", gap: "24px", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>
                  <span>{s.companies} companies</span>
                  <span>{s.count} articles</span>
                  <span style={{ color: scoreColor, fontWeight: 700 }}>avg {s.avgScore.toFixed(0)}</span>
                </div>
              </div>
              {/* Bar */}
              <div style={{ height: "8px", background: C.border, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: `linear-gradient(90deg, ${C.accent}, ${C.accentBright})`,
                  borderRadius: "4px", transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  5. KEY PEOPLE
// ═══════════════════════════════════════════════════════════════

function KeyPeople({ report }: { report: ReportData }) {
  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <SectionWrapper eyebrow="04 · Key people" title="The 20 people shaping Moroccan corporate narrative.">
      <p style={bodyStyle}>
        Executives, ministers, regulators, and journalists whose mentions move the needle on company reputation.
        Mention count and average sentiment tracked across our 1-year window.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {report.people.map((p) => {
          const isExec = p.tags.includes("executive");
          const isMinister = p.tags.includes("minister");
          const isRegulator = p.tags.includes("regulator");
          const isPress = p.tags.includes("press");
          const tagColor = isExec ? C.gold : isMinister ? C.purple : isRegulator ? C.blue : isPress ? "#BE185D" : C.textMuted;
          const tagBg = isExec ? "rgba(133,105,20,0.1)" : isMinister ? "rgba(124,58,237,0.1)" : isRegulator ? "rgba(3,105,161,0.1)" : isPress ? "rgba(190,24,93,0.1)" : "rgba(115,115,115,0.1)";
          const tagLabel = isExec ? "EXEC" : isMinister ? "MINISTER" : isRegulator ? "REGULATOR" : isPress ? "PRESS" : "ENTITY";
          const sentColor = p.avgSentiment > 0.1 ? C.accent : p.avgSentiment < -0.1 ? C.red : C.textMuted;
          return (
            <div key={p.id} style={{
              padding: "20px", background: C.surface, borderRadius: "12px",
              border: `1px solid ${C.border}`, display: "flex", gap: "14px", alignItems: "flex-start",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.text; e.currentTarget.style.boxShadow = C.shadowLg; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                background: `linear-gradient(135deg, ${tagColor}, ${tagColor}dd)`,
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "15px", fontWeight: 700, flexShrink: 0,
              }}>
                {initials(p.name)}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="text-truncate" style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                  {p.name}
                </div>
                <div className="text-clamp-2" style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.4, marginBottom: "10px" }}>
                  {p.role}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    padding: "3px 8px", borderRadius: "3px",
                    background: tagBg, color: tagColor,
                    fontSize: "9px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    {tagLabel}
                  </span>
                  <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                    {p.mentionCount} {p.mentionCount === 1 ? "mention" : "mentions"}
                  </span>
                  <span style={{
                    padding: "2px 7px", borderRadius: "3px",
                    background: sentColor + "15", color: sentColor,
                    fontSize: "9px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                  }}>
                    {p.avgSentiment > 0.1 ? "POS" : p.avgSentiment < -0.1 ? "NEG" : "NEU"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  6. SENTIMENT TRENDS
// ═══════════════════════════════════════════════════════════════

function SentimentTrends({ report }: { report: ReportData }) {
  return (
    <SectionWrapper eyebrow="05 · Sentiment trends" title="1-year sentiment evolution per company.">
      <p style={bodyStyle}>
        Weekly sentiment scores from our NLP pipeline, tracking positive vs negative coverage across Moroccan
        and African media. The zero line marks the neutral boundary.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "20px" }}>
        {report.companies.map((c) => (
          <SentimentMiniChart key={c.id} company={c} />
        ))}
      </div>
    </SectionWrapper>
  );
}

function SentimentMiniChart({ company }: { company: ReportData["companies"][0] }) {
  const data = company.sentimentTrend;
  if (data.length === 0) return null;

  const width = 400;
  const height = 160;
  const padding = { top: 16, right: 16, bottom: 28, left: 32 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const scores = data.map(d => d.score);
  const maxScore = Math.max(...scores, 0.5);
  const minScore = Math.min(...scores, -0.5);
  const range = maxScore - minScore || 1;
  const xStep = chartW / Math.max(data.length - 1, 1);

  const linePath = data.map((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartH * (1 - (d.score - minScore) / range);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  const areaPath = `${linePath} L ${padding.left + (data.length - 1) * xStep} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;
  const zeroY = padding.top + chartH * (1 - (0 - minScore) / range);

  const deltaColor = company.sentimentDelta > 0.02 ? C.accent : company.sentimentDelta < -0.02 ? C.red : C.textMuted;
  const deltaIcon = company.sentimentDelta > 0.02 ? "▲" : company.sentimentDelta < -0.02 ? "▼" : "—";

  return (
    <div style={{
      padding: "20px", background: C.surface, borderRadius: "12px",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <div className="text-truncate" style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
          {company.name}
        </div>
        <div style={{ display: "flex", gap: "12px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: C.textMuted }}>{company.currentSentiment.toFixed(2)}</span>
          <span style={{ color: deltaColor, fontWeight: 700 }}>{deltaIcon} {Math.abs(company.sentimentDelta).toFixed(2)}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        <defs>
          <linearGradient id={`grad-${company.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accent} stopOpacity="0.2" />
            <stop offset="100%" stopColor={C.accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Zero line */}
        <line x1={padding.left} y1={zeroY} x2={width - padding.right} y2={zeroY} stroke={C.border} strokeWidth="1" strokeDasharray="3 3" />
        {/* Area */}
        <path d={areaPath} fill={`url(#grad-${company.id})`} />
        {/* Line */}
        <path d={linePath} fill="none" stroke={C.accent} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "9px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
        <span>{new Date(data[0].date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
        <span>{new Date(data[data.length - 1].date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  7. KEY EVENTS TIMELINE
// ═══════════════════════════════════════════════════════════════

function KeyEventsTimeline({ report }: { report: ReportData }) {
  const events = report.keyEvents.slice(0, 20);
  const companyMap = new Map(report.companies.map(c => [c.id, c.name]));

  return (
    <SectionWrapper eyebrow="06 · Key events timeline" title="The 20 most significant events of the year.">
      <p style={bodyStyle}>
        High-relevance events (score &gt; 0.7) from our 1-year coverage window, sorted by date.
        Each event is linked to a company and classified by sentiment.
      </p>
      <div style={{ marginTop: "32px", position: "relative", paddingLeft: "24px" }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: "8px", top: "0", bottom: "0",
          width: "2px", background: C.border,
        }} />
        {events.map((e, i) => {
          const date = e.date ? new Date(e.date) : null;
          const dateStr = date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
          const companyName = e.companyId ? companyMap.get(e.companyId) : null;
          const sentColor = e.sentiment === "positive" ? C.accent : e.sentiment === "negative" ? C.red : C.textMuted;
          const sentBg = e.sentiment === "positive" ? "rgba(5,150,105,0.1)" : e.sentiment === "negative" ? "rgba(220,38,38,0.1)" : "rgba(115,115,115,0.1)";
          return (
            <div key={i} style={{ position: "relative", marginBottom: "24px", paddingBottom: i < events.length - 1 ? "24px" : "0" }}>
              {/* Dot */}
              <div style={{
                position: "absolute", left: "-20px", top: "4px",
                width: "12px", height: "12px", borderRadius: "50%",
                background: sentColor, border: `2px solid ${C.surface}`,
              }} />
              <div style={{
                padding: "16px 20px", background: C.surfaceAlt, borderRadius: "8px",
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {dateStr} · {e.source}
                  </div>
                  <span style={{
                    padding: "2px 8px", borderRadius: "3px",
                    background: sentBg, color: sentColor,
                    fontSize: "9px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: "uppercase",
                  }}>
                    {e.sentiment || "neutral"}
                  </span>
                </div>
                <div className="text-clamp-2" style={{ fontSize: "14px", fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: "4px" }}>
                  {e.title}
                </div>
                {companyName && (
                  <div style={{ fontSize: "11px", color: C.textMuted }}>
                    {companyName}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  8. BVC MARKET PERFORMANCE
// ═══════════════════════════════════════════════════════════════

function BVCMarketPerformance({ report }: { report: ReportData }) {
  return (
    <SectionWrapper eyebrow="07 · BVC market performance" title="365 days of Casablanca stock prices.">
      <p style={bodyStyle}>
        Daily closing prices for {report.assets.length} BVC-listed equities, with year-over-year performance
        and average trading volume. Data sourced from the Casablanca Stock Exchange.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: "20px" }}>
        {report.assets.map((a) => {
          const changeColor = a.yearChangePct > 0 ? C.accent : a.yearChangePct < 0 ? C.red : C.textMuted;
          const changeIcon = a.yearChangePct > 0 ? "▲" : a.yearChangePct < 0 ? "▼" : "—";
          return (
            <div key={a.ticker} style={{
              padding: "20px", background: C.surface, borderRadius: "12px",
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, marginBottom: "2px" }}>
                    {a.ticker} · {a.sector}
                  </div>
                  <div className="text-truncate" style={{ fontSize: "15px", fontWeight: 700, color: C.text }}>
                    {a.name}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.text }}>
                    {a.currentPrice.toFixed(2)}
                  </div>
                  <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: changeColor, fontWeight: 700 }}>
                    {changeIcon} {Math.abs(a.yearChangePct).toFixed(1)}%
                  </div>
                </div>
              </div>
              {/* Mini sparkline */}
              <BVCSparkline data={a.priceHistory} color={changeColor} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted }}>
                <span>Avg vol: {(a.avgVolume / 1000).toFixed(0)}K</span>
                <span>{a.dataPoints} days</span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

function BVCSparkline({ data, color }: { data: Array<{ price: number; date: string }>; color: string }) {
  if (data.length === 0) return null;
  const width = 380;
  const height = 60;
  const prices = data.map(d => d.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const range = max - min || 1;
  const xStep = width / Math.max(data.length - 1, 1);

  const path = data.map((d, i) => {
    const x = i * xStep;
    const y = height - ((d.price - min) / range) * height;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "60px" }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  9. RISK REGISTER
// ═══════════════════════════════════════════════════════════════

function RiskRegister({ report }: { report: ReportData }) {
  const risks = report.risks.slice(0, 15);
  return (
    <SectionWrapper eyebrow="08 · Risk register" title="Active risk assessments.">
      <p style={bodyStyle}>
        {report.summary.totalRiskAssessments} risk assessments across {report.summary.totalCompanies} companies,
        using the Harch 32-category framework. Scores 0-100 (higher = more risk exposure).
      </p>
      <div style={{ marginTop: "32px", border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 100px",
          padding: "14px 20px", background: C.surfaceAlt,
          borderBottom: `1px solid ${C.border}`,
          fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
          color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
        }}>
          <div>Company</div>
          <div>Category</div>
          <div>Score</div>
          <div>Level</div>
          <div>Trajectory</div>
        </div>
        {risks.map((r, i) => {
          const levelColor = r.level === "critical" ? C.red : r.level === "high" ? C.amber : r.level === "medium" ? C.gold : C.accent;
          const trajColor = r.trajectory === "rising" ? C.red : r.trajectory === "falling" ? C.accent : C.textMuted;
          return (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 140px 100px 80px 100px",
              padding: "14px 20px", borderBottom: i < risks.length - 1 ? `1px solid ${C.border}` : "none",
              alignItems: "center", fontSize: "13px",
            }}>
              <div className="text-truncate" style={{ fontWeight: 600, color: C.text }}>
                {r.company || "—"}
              </div>
              <div className="text-truncate" style={{ color: C.textSec, fontSize: "12px" }}>
                {r.category}
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: levelColor }}>
                {r.score}
              </div>
              <div>
                <span style={{
                  padding: "2px 8px", borderRadius: "3px",
                  background: levelColor + "15", color: levelColor,
                  fontSize: "9px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                }}>
                  {r.level}
                </span>
              </div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", color: trajColor, fontWeight: 700, fontSize: "12px" }}>
                {r.trajectory || "—"}
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  10. AI VISIBILITY
// ═══════════════════════════════════════════════════════════════

function AIVisibilitySection({ report }: { report: ReportData }) {
  const engineStats = new Map<string, { cited: number; total: number }>();
  for (const c of report.companies) {
    for (const ai of c.aiEngines) {
      const stat = engineStats.get(ai.platform) || { cited: 0, total: 0 };
      stat.total++;
      if (ai.cited) stat.cited++;
      engineStats.set(ai.platform, stat);
    }
  }
  const engines = [...engineStats.entries()].map(([platform, stat]) => ({
    platform, cited: stat.cited, total: stat.total, pct: stat.total > 0 ? (stat.cited / stat.total) * 100 : 0,
  })).sort((a, b) => b.pct - a.pct);

  return (
    <SectionWrapper eyebrow="09 · AI visibility" title="How 8 generative AI engines see Moroccan companies.">
      <p style={bodyStyle}>
        We queried 8 leading generative AI engines with brand-reputation questions for each company.
        Citation rate measures how often each engine mentions the company in its response.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
        {engines.map((e) => (
          <div key={e.platform} style={{
            padding: "20px", background: C.surfaceAlt, borderRadius: "12px",
            border: `1px solid ${C.border}`, textAlign: "center",
          }}>
            <div style={{ fontSize: "32px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: C.accent, marginBottom: "4px" }}>
              {e.pct.toFixed(0)}%
            </div>
            <div className="text-truncate" style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
              {e.platform}
            </div>
            <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              {e.cited}/{e.total} cited
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  11. SOURCE BREAKDOWN
// ═══════════════════════════════════════════════════════════════

function SourceBreakdown({ report }: { report: ReportData }) {
  const maxCount = Math.max(...report.topSources.map(s => s.count), 1);
  return (
    <SectionWrapper eyebrow="10 · Source breakdown" title="Top 15 media sources.">
      <p style={bodyStyle}>
        The Moroccan and African media outlets that produced the most coverage in our 1-year window.
      </p>
      <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {report.topSources.map((s, i) => {
          const pct = (s.count / maxCount) * 100;
          return (
            <div key={s.source} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "32px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, fontWeight: 700 }}>
                #{i + 1}
              </div>
              <div className="text-truncate" style={{ width: "180px", fontSize: "13px", fontWeight: 600, color: C.text }}>
                {s.source}
              </div>
              <div style={{ flex: 1, height: "24px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: `linear-gradient(90deg, ${C.accent}, ${C.accentBright})`,
                  borderRadius: "4px", transition: "width 0.6s ease",
                  display: "flex", alignItems: "center", justifyContent: "flex-end",
                  paddingRight: "8px",
                }}>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.count}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  12. LANGUAGE ANALYSIS
// ═══════════════════════════════════════════════════════════════

function LanguageAnalysis({ report }: { report: ReportData }) {
  const total = report.languages.reduce((sum, l) => sum + l.count, 0) || 1;
  const langNames: Record<string, string> = {
    fr: "French", ar: "Arabic", en: "English", darija: "Darija", french: "French", unknown: "Other",
  };
  const langColors: Record<string, string> = {
    fr: C.blue, french: C.blue, ar: C.red, en: C.accent, darija: C.amber, unknown: C.textMuted,
  };
  return (
    <SectionWrapper eyebrow="11 · Language analysis" title="Coverage by language.">
      <p style={bodyStyle}>
        Articles classified by detected language, reflecting Morocco's multilingual media landscape.
      </p>
      <div style={{ marginTop: "32px", display: "flex", gap: "4px", height: "48px", borderRadius: "8px", overflow: "hidden" }}>
        {report.languages.map((l) => {
          const pct = (l.count / total) * 100;
          const color = langColors[l.lang?.toLowerCase()] || C.textMuted;
          return (
            <div key={l.lang} style={{
              width: `${pct}%`, background: color,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "width 0.6s ease",
            }} title={`${langNames[l.lang] || l.lang}: ${l.count} articles (${pct.toFixed(1)}%)`}>
              {pct > 8 && (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "16px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {report.languages.map((l) => {
          const pct = (l.count / total) * 100;
          const color = langColors[l.lang?.toLowerCase()] || C.textMuted;
          return (
            <div key={l.lang} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "12px", height: "12px", background: color, borderRadius: "2px" }} />
              <span style={{ fontSize: "13px", color: C.textSec }}>
                {langNames[l.lang] || l.lang}: <strong style={{ color: C.text }}>{l.count}</strong> ({pct.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════
//  13. SENTIMENT DISTRIBUTION
// ═══════════════════════════════════════════════════════════════

function SentimentDistribution({ report }: { report: ReportData }) {
  const total = report.sentimentBreakdown.positive + report.sentimentBreakdown.neutral + report.sentimentBreakdown.negative || 1;
  const posPct = (report.sentimentBreakdown.positive / total) * 100;
  const neuPct = (report.sentimentBreakdown.neutral / total) * 100;
  const negPct = (report.sentimentBreakdown.negative / total) * 100;

  return (
    <SectionWrapper eyebrow="12 · Sentiment distribution" title="The shape of the conversation.">
      <p style={bodyStyle}>
        Across all {total.toLocaleString()} articles analyzed, here's how sentiment breaks down.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
        <SentimentCard label="Positive" count={report.sentimentBreakdown.positive} pct={posPct} color={C.accent} icon="▲" />
        <SentimentCard label="Neutral" count={report.sentimentBreakdown.neutral} pct={neuPct} color={C.textMuted} icon="—" />
        <SentimentCard label="Negative" count={report.sentimentBreakdown.negative} pct={negPct} color={C.red} icon="▼" />
      </div>
    </SectionWrapper>
  );
}

function SentimentCard({ label, count, pct, color, icon }: { label: string; count: number; pct: number; color: string; icon: string }) {
  return (
    <div style={{
      padding: "32px", background: C.surfaceAlt, borderRadius: "12px",
      border: `1px solid ${C.border}`, textAlign: "center",
    }}>
      <div style={{ fontSize: "24px", color, marginBottom: "8px" }}>{icon}</div>
      <div style={{ fontSize: "36px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color, marginBottom: "4px" }}>
        {pct.toFixed(1)}%
      </div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
        {count.toLocaleString()} articles
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  14. METHODOLOGY
// ═══════════════════════════════════════════════════════════════

function Methodology({ report }: { report: ReportData }) {
  const m = report.methodology;
  return (
    <SectionWrapper eyebrow="13 · Methodology" title="How we built this report.">
      <p style={bodyStyle}>
        This report is the product of {m.coverageWindow} of continuous data collection, NLP processing, and
        analyst review. Here's our methodology.
      </p>
      <div style={{ marginTop: "32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        <div style={{ padding: "24px", background: C.surfaceAlt, borderRadius: "12px", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "12px" }}>
            Data sources
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {m.dataSources.map((s, i) => (
              <li key={i} style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5, marginBottom: "8px", paddingLeft: "16px", position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: C.accent }}>•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <MethodCard label="Framework" value={m.framework} />
          <MethodCard label="Refresh cycle" value={m.refreshCycle} />
          <MethodCard label="Coverage window" value={m.coverageWindow} />
        </div>
      </div>
    </SectionWrapper>
  );
}

function MethodCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "20px", background: C.surfaceAlt, borderRadius: "12px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", color: C.text, lineHeight: 1.5, fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  15. DOWNLOAD / SHARE
// ═══════════════════════════════════════════════════════════════

function DownloadShare({ report }: { report: ReportData }) {
  return (
    <section style={{
      background: `linear-gradient(180deg, ${C.bg} 0%, #1a1a1a 100%)`,
      color: C.textOnDark,
      padding: "80px 24px",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          padding: "8px 16px", background: "rgba(5,150,105,0.1)",
          border: `1px solid ${C.accent}40`, borderRadius: "100px",
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accentBright, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "24px",
        }}>
          Ready to download
        </div>
        <h2 style={{
          fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800,
          letterSpacing: "-0.03em", lineHeight: 1.05,
          marginBottom: "16px",
        }}>
          The full report is yours.
        </h2>
        <p style={{
          fontSize: "16px", color: C.textOnDarkMuted, lineHeight: 1.6,
          marginBottom: "32px",
        }}>
          Download the complete {report.meta.title} as a PDF, or share it with your team.
          The report includes all {report.summary.totalCompanies} companies, {report.summary.totalPeople} people,
          and {report.summary.totalArticles.toLocaleString()} articles analyzed.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            padding: "14px 28px", background: C.accent, color: "#fff",
            border: "none", borderRadius: "6px", fontSize: "15px", fontWeight: 600,
            cursor: "pointer", fontFamily: "'Inter', sans-serif",
            display: "inline-flex", alignItems: "center", gap: "8px",
          }}>
            ↓ Download PDF
          </button>
          <button style={{
            padding: "14px 28px", background: "transparent", color: C.textOnDark,
            border: `1px solid ${C.borderDark}`, borderRadius: "6px",
            fontSize: "15px", fontWeight: 600, cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            display: "inline-flex", alignItems: "center", gap: "8px",
          }}>
            ↗ Share with team
          </button>
        </div>
        <div style={{
          marginTop: "48px", paddingTop: "32px",
          borderTop: `1px solid ${C.borderDark}`,
          fontSize: "12px", color: C.textOnDarkMuted,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {report.meta.title} · v{report.meta.version} · Generated {new Date(report.meta.generatedAt).toLocaleDateString("en-US")}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════

const bodyStyle: React.CSSProperties = {
  fontSize: "16px", color: C.textSec, lineHeight: 1.65,
  maxWidth: "760px",
};

function SectionWrapper({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section style={{
      padding: "80px 24px",
      borderBottom: `1px solid ${C.border}`,
      maxWidth: "1200px",
      margin: "0 auto",
    }}>
      <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "12px" }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800,
        letterSpacing: "-0.03em", lineHeight: 1.1,
        color: C.text, marginBottom: "16px", maxWidth: "900px",
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

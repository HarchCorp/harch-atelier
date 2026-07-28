"use client";

// ═══════════════════════════════════════════════════════════════
//  REPUTATION AUDIT REPORT — PDF TEMPLATE (with blur teaser)
//  Shows real data at top, blurs the rest with "Contact for full report"
//  Inspired by: Meltwater, Brandwatch, Signal AI report teasers
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";

interface AuditData {
  companyName: string;
  reportDate: string;
  reputationScore: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
  totalArticles: number;
  totalMentions: number;
  aiCitations: number;
  aiRank: string;
  topCompetitor: string;
  topCompetitorScore: number;
  emergingRisk: string;
  riskIncrease: number;
  // Data below this line is BLURRED in teaser mode
  detailedFindings: string[];
  competitorAnalysis: { name: string; score: number; sentiment: string }[];
  aiVisibilityDetails: { engine: string; cited: boolean; position: string }[];
  recommendations: string[];
  timeline: { week: string; milestone: string }[];
}

export function ReputationAuditTemplate({ 
  data, 
  teaser = true 
}: { 
  data: Partial<AuditData>; 
  teaser?: boolean;
}) {
  const defaultData: AuditData = {
    companyName: "Bank of Africa",
    reportDate: "July 2026",
    reputationScore: 78,
    sentimentPositive: 68,
    sentimentNeutral: 22,
    sentimentNegative: 10,
    totalArticles: 247,
    totalMentions: 1240,
    aiCitations: 12,
    aiRank: "#2",
    topCompetitor: "Attijariwafa Bank",
    topCompetitorScore: 84,
    emergingRisk: "Banking fees discussion",
    riskIncrease: 47,
    detailedFindings: [],
    competitorAnalysis: [],
    aiVisibilityDetails: [],
    recommendations: [],
    timeline: [],
  };

  const d = { ...defaultData, ...data };

  return (
    <div style={styles.container}>
      {/* ─── COVER PAGE ─────────────────────────────────── */}
      <div style={styles.page}>
        {/* Header bar */}
        <div style={styles.coverHeader}>
          <div style={styles.coverLogo}>
            <span style={styles.coverLogoMark}>◆</span>
            <span style={styles.coverLogoText}>HARCH ATELIER</span>
          </div>
          <div style={styles.coverConfidential}>CONFIDENTIAL</div>
        </div>

        {/* Title block */}
        <div style={styles.coverTitleBlock}>
          <div style={styles.coverEyebrow}>REPUTATION AUDIT REPORT</div>
          <h1 style={styles.coverTitle}>{d.companyName}</h1>
          <div style={styles.coverDate}>{d.reportDate}</div>
        </div>

        {/* Score ring */}
        <div style={styles.coverScoreBlock}>
          <ScoreRing score={d.reputationScore} />
          <div style={styles.coverScoreLabel}>REPUTATION SCORE</div>
        </div>

        {/* Key stats grid */}
        <div style={styles.coverStatsGrid}>
          <CoverStat label="Articles Analyzed" value={d.totalArticles.toString()} />
          <CoverStat label="Total Mentions" value={d.totalMentions.toLocaleString()} />
          <CoverStat label="AI Citations" value={d.aiCitations.toString()} />
          <CoverStat label="AI Rank" value={d.aiRank} />
        </div>

        {/* Footer */}
        <div style={styles.coverFooter}>
          <div>Prepared by Harch Atelier — AI Reputation Intelligence</div>
          <div>Page 1 of 15</div>
        </div>
      </div>

      {/* ─── EXECUTIVE SUMMARY ──────────────────────────── */}
      <div style={styles.page}>
        <PageHeader title="Executive Summary" page={2} />
        
        <div style={styles.summaryBlock}>
          <p style={styles.summaryText}>
            In {d.reportDate}, {d.companyName} was mentioned in <strong>{d.totalArticles} articles</strong> across 
            30+ Moroccan and African media sources, generating <strong>{d.totalMentions.toLocaleString()} total mentions</strong>. 
            Overall sentiment is <strong style={{ color: "#4A7B5F" }}>{d.sentimentPositive}% positive</strong>, 
            with {d.sentimentNegative}% negative and {d.sentimentNeutral}% neutral coverage.
          </p>
          <p style={styles.summaryText}>
            In AI search visibility, {d.companyName} ranks <strong>{d.aiRank}</strong> when users query 
            "best bank in Morocco" across ChatGPT, Perplexity, Gemini, and Claude. Your top competitor, 
            <strong> {d.topCompetitor}</strong>, ranks #1 with a reputation score of {d.topCompetitorScore}.
          </p>
          <p style={styles.summaryText}>
            <strong style={{ color: "#A0524B" }}>⚠ Emerging Risk:</strong> "{d.emergingRisk}" has seen a 
            <strong> +{d.riskIncrease}% increase</strong> in media coverage over the past 24 hours. 
            Immediate monitoring recommended.
          </p>
        </div>

        {/* Sentiment breakdown bar */}
        <div style={styles.sentimentSection}>
          <div style={styles.sectionTitle}>SENTIMENT BREAKDOWN</div>
          <div style={styles.sentimentBar}>
            <div style={{ ...styles.sentimentPositive, width: `${d.sentimentPositive}%` }} />
            <div style={{ ...styles.sentimentNeutral, width: `${d.sentimentNeutral}%` }} />
            <div style={{ ...styles.sentimentNegative, width: `${d.sentimentNegative}%` }} />
          </div>
          <div style={styles.sentimentLegend}>
            <LegendItem color="#4A7B5F" label="Positive" value={`${d.sentimentPositive}%`} />
            <LegendItem color="#71717A" label="Neutral" value={`${d.sentimentNeutral}%`} />
            <LegendItem color="#A0524B" label="Negative" value={`${d.sentimentNegative}%`} />
          </div>
        </div>

        <PageFooter page={2} />
      </div>

      {/* ─── DETAILED FINDINGS (BLURRED IN TEASER) ──────── */}
      <div style={{ ...styles.page, position: "relative" }}>
        <PageHeader title="Detailed Findings" page={3} />
        
        {teaser ? (
          <>
            {/* Show first 2 findings normally */}
            <div style={styles.findingsList}>
              <div style={styles.findingItem}>
                <div style={styles.findingNumber}>01</div>
                <div>
                  <div style={styles.findingTitle}>Media Coverage Volume</div>
                  <div style={styles.findingDesc}>
                    {d.companyName} received {d.totalArticles} articles in {d.reportDate}, 
                    a 23% increase from the previous month. Peak coverage on July 12 
                    was driven by quarterly earnings announcement.
                  </div>
                </div>
              </div>
              <div style={styles.findingItem}>
                <div style={styles.findingNumber}>02</div>
                <div>
                  <div style={styles.findingTitle}>Sentiment Trend</div>
                  <div style={styles.findingDesc}>
                    Positive sentiment improved from 61% to {d.sentimentPositive}% month-over-month. 
                    Key drivers: product launch coverage (18 articles), ESG initiatives (9 articles).
                  </div>
                </div>
              </div>
            </div>

            {/* Blur overlay for remaining content */}
            <div style={styles.blurContainer}>
              <div style={styles.blurContent}>
                <div style={{ ...styles.findingItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.findingNumber}>03</div>
                  <div>
                    <div style={styles.findingTitle}>Competitor Benchmark Analysis</div>
                    <div style={styles.findingDesc}>
                      Detailed comparison across 5 competitors showing share of voice, 
                      sentiment differential, and AI citation gap analysis...
                    </div>
                  </div>
                </div>
                <div style={{ ...styles.findingItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.findingNumber}>04</div>
                  <div>
                    <div style={styles.findingTitle}>AI Engine Visibility Matrix</div>
                    <div style={styles.findingDesc}>
                      ChatGPT, Perplexity, Gemini, Claude — citation frequency, 
                      position ranking, sentiment of AI-generated responses...
                    </div>
                  </div>
                </div>
                <div style={{ ...styles.findingItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.findingNumber}>05</div>
                  <div>
                    <div style={styles.findingTitle}>Emerging Risk Assessment</div>
                    <div style={styles.findingDesc}>
                      Topic cluster analysis showing 3 emerging risk themes with 
                      velocity tracking and projected impact timeline...
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA overlay */}
              <div style={styles.blurCta}>
                <div style={styles.blurCtaCard}>
                  <div style={styles.blurCtaTitle}>Unlock the full report</div>
                  <div style={styles.blurCtaDesc}>
                    15 pages · 200+ queries analyzed · 4 AI engines · 5 competitor benchmarks · 12 recommendations
                  </div>
                  <a href="/atelier/audit" style={styles.blurCtaButton}>
                    Get the full report →
                  </a>
                  <div style={styles.blurCtaNote}>Free · No credit card · Delivered in 7 days</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Full content when not teaser */
          <div style={styles.findingsList}>
            {d.detailedFindings.map((finding, i) => (
              <div key={i} style={styles.findingItem}>
                <div style={styles.findingNumber}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={styles.findingTitle}>Finding #{i + 1}</div>
                  <div style={styles.findingDesc}>{finding}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <PageFooter page={3} />
      </div>

      {/* ─── COMPETITOR TABLE (BLURRED IN TEASER) ───────── */}
      <div style={{ ...styles.page, position: "relative" }}>
        <PageHeader title="Competitor Analysis" page={4} />
        
        {teaser ? (
          <>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Company</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Articles</th>
                  <th style={styles.th}>Sentiment</th>
                  <th style={styles.th}>AI Rank</th>
                </tr>
              </thead>
              <tbody>
                <tr style={styles.tr}>
                  <td style={styles.td}>{d.companyName}</td>
                  <td style={{ ...styles.td, ...styles.tdBold, color: "#4A7B5F" }}>{d.reputationScore}</td>
                  <td style={styles.td}>{d.totalArticles}</td>
                  <td style={styles.td}>{d.sentimentPositive}% pos</td>
                  <td style={styles.td}>{d.aiRank}</td>
                </tr>
                <tr style={styles.tr}>
                  <td style={styles.td}>{d.topCompetitor}</td>
                  <td style={{ ...styles.td, ...styles.tdBold, color: "#4A7B5F" }}>{d.topCompetitorScore}</td>
                  <td style={styles.td}>312</td>
                  <td style={styles.td}>72% pos</td>
                  <td style={styles.td}>#1</td>
                </tr>
              </tbody>
            </table>

            {/* Blur the remaining rows */}
            <div style={styles.blurContainer}>
              <div style={styles.blurContent}>
                <table style={{ ...styles.table, filter: "blur(5px)", userSelect: "none" }}>
                  <tbody>
                    {[1, 2, 3].map((i) => (
                      <tr key={i} style={styles.tr}>
                        <td style={styles.td}>Competitor {i + 2}</td>
                        <td style={styles.td}>--</td>
                        <td style={styles.td}>---</td>
                        <td style={styles.td}>--% pos</td>
                        <td style={styles.td}>#{i + 3}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div style={{ ...styles.findingItem, filter: "blur(5px)", marginTop: "24px" }}>
                  <div style={styles.findingNumber}>★</div>
                  <div>
                    <div style={styles.findingTitle}>Strategic Gap Analysis</div>
                    <div style={styles.findingDesc}>
                      Your share of voice is 18% vs industry leader's 27%. 
                      AI citation gap: 3 engines cite competitors, only 1 cites you...
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={styles.blurCta}>
                <div style={styles.blurCtaCard}>
                  <div style={styles.blurCtaTitle}>5 competitors benchmarked</div>
                  <div style={styles.blurCtaDesc}>See how you compare on every metric</div>
                  <a href="/atelier/audit" style={styles.blurCtaButton}>
                    Unlock competitor analysis →
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Company</th>
                <th style={styles.th}>Score</th>
                <th style={styles.th}>Articles</th>
                <th style={styles.th}>Sentiment</th>
                <th style={styles.th}>AI Rank</th>
              </tr>
            </thead>
            <tbody>
              {d.competitorAnalysis.map((c, i) => (
                <tr key={i} style={styles.tr}>
                  <td style={styles.td}>{c.name}</td>
                  <td style={{ ...styles.td, ...styles.tdBold, color: "#4A7B5F" }}>{c.score}</td>
                  <td style={styles.td}>--</td>
                  <td style={styles.td}>{c.sentiment}</td>
                  <td style={styles.td}>#{i + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <PageFooter page={4} />
      </div>

      {/* ─── RECOMMENDATIONS (BLURRED IN TEASER) ────────── */}
      <div style={{ ...styles.page, position: "relative" }}>
        <PageHeader title="Recommendations" page={5} />
        
        {teaser ? (
          <>
            <div style={styles.recommendationItem}>
              <div style={styles.recommendationNum}>01</div>
              <div>
                <div style={styles.recommendationTitle}>Address emerging risk immediately</div>
                <div style={styles.recommendationDesc}>
                  "{d.emergingRisk}" is trending +{d.riskIncrease}% in 24h. 
                  Prepare a holding statement and monitor Hespress, Medias24, and Le360 
                  for the next 48 hours.
                </div>
                <div style={styles.recommendationPriority}>PRIORITY: HIGH</div>
              </div>
            </div>

            <div style={styles.blurContainer}>
              <div style={styles.blurContent}>
                <div style={{ ...styles.recommendationItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.recommendationNum}>02</div>
                  <div>
                    <div style={styles.recommendationTitle}>Improve AI visibility on Perplexity</div>
                    <div style={styles.recommendationDesc}>
                      Currently cited in 3/200 queries on Perplexity. 
                      Content restructuring recommended to improve entity recognition...
                    </div>
                  </div>
                </div>
                <div style={{ ...styles.recommendationItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.recommendationNum}>03</div>
                  <div>
                    <div style={styles.recommendationTitle}>Close sentiment gap with competitor</div>
                    <div style={styles.recommendationDesc}>
                      {d.topCompetitor} maintains 72% positive vs your {d.sentimentPositive}%. 
                      Key driver: their ESG coverage generates 3x more positive mentions...
                    </div>
                  </div>
                </div>
                <div style={{ ...styles.recommendationItem, filter: "blur(4px)", userSelect: "none" }}>
                  <div style={styles.recommendationNum}>04</div>
                  <div>
                    <div style={styles.recommendationTitle}>Launch WhatsApp monitoring protocol</div>
                    <div style={styles.recommendationDesc}>
                      Set up real-time alerts for negative sentiment spikes. 
                      Current response time: 48h. Recommended: under 15 min...
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={styles.blurCta}>
                <div style={styles.blurCtaCard}>
                  <div style={styles.blurCtaTitle}>12 recommendations total</div>
                  <div style={styles.blurCtaDesc}>Prioritized by impact × effort matrix</div>
                  <a href="/atelier/audit" style={styles.blurCtaButton}>
                    See all recommendations →
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            {d.recommendations.map((rec, i) => (
              <div key={i} style={styles.recommendationItem}>
                <div style={styles.recommendationNum}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div style={styles.recommendationTitle}>Recommendation #{i + 1}</div>
                  <div style={styles.recommendationDesc}>{rec}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <PageFooter page={5} />
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#4A7B5F" : score >= 50 ? "#8B9DAF" : "#A0524B";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#E5E5E5" strokeWidth="8" />
      <circle
        cx="70" cy="70" r={radius} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="68" textAnchor="middle" fontSize="36" fontWeight="700" fill="#0A0A0A" fontFamily="JetBrains Mono, monospace">{score}</text>
      <text x="70" y="88" textAnchor="middle" fontSize="12" fill="#71717A" fontFamily="JetBrains Mono, monospace">/ 100</text>
    </svg>
  );
}

function CoverStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.coverStat}>
      <div style={styles.coverStatValue}>{value}</div>
      <div style={styles.coverStatLabel}>{label}</div>
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={styles.legendItem}>
      <span style={{ ...styles.legendDot, background: color }} />
      <span style={styles.legendLabel}>{label}</span>
      <span style={styles.legendValue}>{value}</span>
    </div>
  );
}

function PageHeader({ title, page }: { title: string; page: number }) {
  return (
    <div style={styles.pageHeader}>
      <div style={styles.pageHeaderTitle}>{title}</div>
      <div style={styles.pageHeaderLogo}>HARCH ATELIER</div>
    </div>
  );
}

function PageFooter({ page }: { page: number }) {
  return (
    <div style={styles.pageFooter}>
      <div>Confidential — Harch Atelier</div>
      <div>Page {page} of 15</div>
    </div>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: "'Inter', sans-serif",
    color: "#0A0A0A",
    background: "#FFFFFF",
  },
  page: {
    width: "100%",
    maxWidth: "800px",
    minHeight: "1100px",
    margin: "0 auto 32px",
    background: "#FFFFFF",
    border: "1px solid #E5E5E5",
    borderRadius: "4px",
    padding: "48px 56px",
    position: "relative",
    boxSizing: "border-box",
  },
  
  // Cover page
  coverHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    paddingBottom: "24px", borderBottom: "1px solid #E5E5E5", marginBottom: "60px",
  },
  coverLogo: { display: "flex", alignItems: "center", gap: "8px" },
  coverLogoMark: { color: "#4A5D6E", fontSize: "20px" },
  coverLogoText: { fontSize: "14px", fontWeight: 700, letterSpacing: "0.15em", color: "#4A5D6E", fontFamily: "'JetBrains Mono', monospace" },
  coverConfidential: { fontSize: "10px", fontWeight: 600, color: "#A0524B", letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" },
  coverTitleBlock: { textAlign: "center", marginBottom: "48px" },
  coverEyebrow: { fontSize: "12px", color: "#71717A", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" },
  coverTitle: { fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em", color: "#0A0A0A", margin: "0 0 8px" },
  coverDate: { fontSize: "16px", color: "#525252", fontFamily: "'JetBrains Mono', monospace" },
  coverScoreBlock: { textAlign: "center", marginBottom: "48px" },
  coverScoreLabel: { fontSize: "11px", color: "#71717A", letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: "12px" },
  coverStatsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "48px" },
  coverStat: { textAlign: "center", padding: "20px 12px", background: "#FAFAFA", borderRadius: "6px", border: "1px solid #E5E5E5" },
  coverStatValue: { fontSize: "28px", fontWeight: 800, color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em" },
  coverStatLabel: { fontSize: "10px", color: "#71717A", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginTop: "4px" },
  coverFooter: { position: "absolute", bottom: "32px", left: "56px", right: "56px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", borderTop: "1px solid #E5E5E5", paddingTop: "12px" },
  
  // Page header/footer
  pageHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", borderBottom: "1px solid #E5E5E5", marginBottom: "32px" },
  pageHeaderTitle: { fontSize: "24px", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" },
  pageHeaderLogo: { fontSize: "10px", fontWeight: 600, color: "#71717A", letterSpacing: "0.15em", fontFamily: "'JetBrains Mono', monospace" },
  pageFooter: { position: "absolute", bottom: "32px", left: "56px", right: "56px", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#71717A", fontFamily: "'JetBrains Mono', monospace", borderTop: "1px solid #E5E5E5", paddingTop: "12px" },
  
  // Summary
  summaryBlock: { marginBottom: "40px" },
  summaryText: { fontSize: "15px", lineHeight: 1.75, color: "#525252", marginBottom: "16px" },
  
  // Sentiment
  sentimentSection: { marginBottom: "40px" },
  sectionTitle: { fontSize: "11px", fontWeight: 600, color: "#71717A", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" },
  sentimentBar: { display: "flex", height: "32px", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" },
  sentimentPositive: { background: "#4A7B5F", transition: "width 0.5s" },
  sentimentNeutral: { background: "#71717A", transition: "width 0.5s" },
  sentimentNegative: { background: "#A0524B", transition: "width 0.5s" },
  sentimentLegend: { display: "flex", gap: "24px" },
  legendItem: { display: "flex", alignItems: "center", gap: "8px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "2px" },
  legendLabel: { fontSize: "13px", color: "#525252" },
  legendValue: { fontSize: "13px", fontWeight: 700, color: "#0A0A0A", fontFamily: "'JetBrains Mono', monospace" },
  
  // Findings
  findingsList: { display: "flex", flexDirection: "column", gap: "20px" },
  findingItem: { display: "flex", gap: "16px", padding: "20px", background: "#FAFAFA", borderRadius: "6px", border: "1px solid #E5E5E5" },
  findingNumber: { fontSize: "20px", fontWeight: 800, color: "#4A5D6E", fontFamily: "'JetBrains Mono', monospace", minWidth: "32px" },
  findingTitle: { fontSize: "15px", fontWeight: 600, color: "#0A0A0A", marginBottom: "6px" },
  findingDesc: { fontSize: "14px", color: "#525252", lineHeight: 1.6 },
  
  // Table
  table: { width: "100%", borderCollapse: "collapse", marginBottom: "24px" },
  th: { textAlign: "left", padding: "12px 16px", fontSize: "11px", fontWeight: 600, color: "#71717A", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", borderBottom: "2px solid #E5E5E5" },
  tr: { borderBottom: "1px solid #F0F0F0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#525252" },
  tdBold: { fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" },
  
  // Recommendations
  recommendationItem: { display: "flex", gap: "16px", padding: "24px", background: "#FAFAFA", borderRadius: "6px", border: "1px solid #E5E5E5", marginBottom: "16px" },
  recommendationNum: { fontSize: "20px", fontWeight: 800, color: "#4A7B5F", fontFamily: "'JetBrains Mono', monospace", minWidth: "32px" },
  recommendationTitle: { fontSize: "15px", fontWeight: 600, color: "#0A0A0A", marginBottom: "6px" },
  recommendationDesc: { fontSize: "14px", color: "#525252", lineHeight: 1.6, marginBottom: "8px" },
  recommendationPriority: { display: "inline-block", fontSize: "10px", fontWeight: 700, color: "#A0524B", background: "rgba(160,82,75,0.1)", padding: "2px 8px", borderRadius: "2px", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" },
  
  // Blur teaser
  blurContainer: { position: "relative", marginTop: "16px" },
  blurContent: { filter: "blur(0px)" },
  blurCta: {
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    width: "100%", display: "flex", justifyContent: "center",
  },
  blurCtaCard: {
    background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "8px",
    padding: "32px 40px", textAlign: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  },
  blurCtaTitle: { fontSize: "20px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px" },
  blurCtaDesc: { fontSize: "13px", color: "#71717A", marginBottom: "20px", fontFamily: "'JetBrains Mono', monospace" },
  blurCtaButton: {
    display: "inline-block", padding: "12px 28px", background: "#4A7B5F",
    color: "#FFFFFF", fontSize: "14px", fontWeight: 600, textDecoration: "none",
    borderRadius: "6px", fontFamily: "'Inter', sans-serif",
  },
  blurCtaNote: { fontSize: "11px", color: "#71717A", marginTop: "12px", fontFamily: "'JetBrains Mono', monospace" },
};

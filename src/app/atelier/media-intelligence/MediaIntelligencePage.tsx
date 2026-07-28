"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  MEDIA INTELLIGENCE REPORT — Year-in-review style (Signal AI 2021)
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

const TOP_TRENDS = [
  { rank: 1, trend: "Banking digital transformation", coverage: "12,847", sentiment: 78, peak: "July 2026", summary: "Maroc Telecom and Bank of Africa led digital transformation narratives. Mobile banking adoption up 34% YoY." },
  { rank: 2, trend: "African Continental Free Trade (AfCFTA)", coverage: "9,234", sentiment: 71, peak: "June 2026", summary: "Coverage of cross-border trade agreements, with OCP Group and Attijariwafa Bank featured prominently as beneficiaries." },
  { rank: 3, trend: "ESG & Sustainable Finance", coverage: "7,892", sentiment: 74, peak: "May 2026", summary: "Bank of Africa's sustainable finance framework and OCP's green ammonia project drove positive sentiment." },
  { rank: 4, trend: "Cybersecurity threats", coverage: "6,541", sentiment: 38, peak: "August 2026", summary: "Rising concerns over cyber attacks on Moroccan banks. 3 major incidents reported across the sector." },
  { rank: 5, trend: "Royal Air Maroc expansion", coverage: "5,123", sentiment: 67, peak: "July 2026", summary: "RAM's new routes to Asia and North America covered positively, despite labor dispute undercurrents." },
  { rank: 6, trend: "Phosphate prices & food security", coverage: "4,876", sentiment: 62, peak: "April 2026", summary: "OCP Group central to global food security narrative as fertilizer prices stabilized." },
  { rank: 7, trend: "Telecom infrastructure investment", coverage: "4,234", sentiment: 65, peak: "September 2026", summary: "5G rollout announcements from all 3 Moroccan telcos, with Inwi leading positive sentiment." },
  { rank: 8, trend: "Mergers & Acquisitions", coverage: "3,892", sentiment: 58, peak: "August 2026", summary: "Consolidation in the retail and cement sectors, with Marjane acquiring 2 regional chains." },
  { rank: 9, trend: "Labor disputes & social movements", coverage: "3,456", sentiment: 28, peak: "June 2026", summary: "Banking and aviation sectors hit by strike threats. Bank of Africa and RAM most affected." },
  { rank: 10, trend: "Climate events & sustainability", coverage: "3,123", sentiment: 45, peak: "August 2026", summary: "Drought concerns and water scarcity drove sustainability narrative across agro-industry." },
];

const INDUSTRY_PILLARS = [
  { industry: "Banking", innovation: 35, performance: 41, purpose: 24, topTheme: "Growth", sentiment: 72 },
  { industry: "Telecommunications", innovation: 52, performance: 30, purpose: 18, topTheme: "Technology", sentiment: 68 },
  { industry: "Mining & Phosphates", innovation: 48, performance: 35, purpose: 17, topTheme: "Sustainability", sentiment: 82 },
  { industry: "Aviation", innovation: 28, performance: 47, purpose: 25, topTheme: "Operations", sentiment: 61 },
  { industry: "Retail", innovation: 30, performance: 42, purpose: 28, topTheme: "Operations", sentiment: 55 },
  { industry: "Energy", innovation: 26, performance: 44, purpose: 30, topTheme: "Sustainability", sentiment: 44 },
];

const COMPANY_SPOTLIGHTS = [
  {
    company: "OCP Group",
    headline: "OCP Group dominates sustainability narrative with green ammonia announcement",
    text: "OCP Group's $1.2B green ammonia plant in Jorf Lasfar generated over 842 articles in Q2 2026, with 89% positive sentiment. The project positions OCP as a global leader in sustainable fertilizer production and reinforces Morocco's role in global food security.",
    metric: "+12 pts", metricLabel: "reputation score increase Q2 2026",
  },
  {
    company: "Bank of Africa",
    headline: "Bank of Africa's pan-African expansion accelerates with Nigeria entry",
    text: "Bank of Africa's Lagos office opening in July 2026 generated 386 articles across African business media. The expansion narrative scored 78/100 in strength, with sentiment at +0.75 (strongly positive). However, labor disputes and a MAD 2.5M compliance fine created countervailing negative coverage.",
    metric: "#2", metricLabel: "banking sector rank (up from #3)",
  },
  {
    company: "Inwi",
    headline: "Inwi leads positive sentiment among Moroccan telcos with 5G launch",
    text: "Inwi's 5G rollout in Casablanca and Rabat generated 234 articles with 84% positive sentiment — the highest of any Moroccan telco. The operator's 'digital inclusion' narrative resonated strongly with media, contrasting with Maroc Telecom's more mixed coverage on the same topic.",
    metric: "+2 ranks", metricLabel: "moved up in Harch 100",
  },
];

export default function MediaIntelligencePage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "100px 32px 80px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Harch AI 2026 Media Report · FY 2026
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "980px",
          }}>
            The state of Moroccan<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>corporate reputation.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Authored by senior analysts at Harch AI using our technology to gather insights on the main
            and sometimes more surprising news stories and trends in Moroccan and African corporate media in 2026.
          </p>

          {/* Report stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "61,218", label: "articles analyzed" },
              { value: "30+", label: "media sources" },
              { value: "100", label: "companies ranked" },
              { value: "6", label: "industries profiled" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{ fontSize: "28px", fontWeight: 800, color: C.text, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP TRENDS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Signal AI Insight
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
          How the top trends of 2026 evolved.
        </h2>
        <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.6, marginBottom: "48px", maxWidth: "760px" }}>
          It comes as no surprise that banking digital transformation is the top trend of 2026 by some margin,
          with over 12,800 pieces of coverage. This amounted to almost the same amount of coverage of all
          the other trends combined.
        </p>

        {/* Trends table */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden", boxShadow: C.shadow,
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: C.surfaceAlt }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Trend</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Coverage</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Sentiment</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Peak</th>
                <th style={thStyle}>Summary</th>
              </tr>
            </thead>
            <tbody>
              {TOP_TRENDS.map(t => (
                <tr key={t.rank} style={{
                  borderBottom: `1px solid ${C.borderLight}`,
                  transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...tdStyle, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: t.rank <= 3 ? C.sage : C.textMuted }}>
                    {t.rank}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: C.text }}>
                    {t.trend}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontFamily: "'JetBrains Mono', monospace", color: C.textSec }}>
                    {parseInt(t.coverage).toLocaleString()}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: "100px",
                      fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                      background: t.sentiment >= 70 ? "rgba(74,123,95,0.1)" : t.sentiment >= 50 ? "rgba(184,115,51,0.1)" : "rgba(160,82,75,0.1)",
                      color: t.sentiment >= 70 ? C.sage : t.sentiment >= 50 ? C.amber : C.red,
                    }}>
                      {t.sentiment}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", color: C.textMuted, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
                    {t.peak}
                  </td>
                  <td style={{ ...tdStyle, color: C.textSec, fontSize: "12px", lineHeight: 1.5 }}>
                    {t.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* INDUSTRY PILLAR ANALYSIS */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Reputation pillars by industry
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            What drives the narrative in each industry.
          </h2>
          <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.6, marginBottom: "48px", maxWidth: "760px" }}>
            We analyzed how Innovation, Performance, and Purpose pillars are weighted in each industry&apos;s
            narrative — and which themes dominate each pillar.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {INDUSTRY_PILLARS.map(ind => (
              <div key={ind.industry} style={{
                padding: "24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
              }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "180px 1fr 100px 100px",
                  gap: "24px", alignItems: "center",
                }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.text }}>
                    {ind.industry}
                  </div>
                  {/* Pillar bar */}
                  <div>
                    <div style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden", marginBottom: "6px" }}>
                      <div style={{ width: `${ind.innovation}%`, background: C.sage }} />
                      <div style={{ width: `${ind.performance}%`, background: C.accent }} />
                      <div style={{ width: `${ind.purpose}%`, background: C.amber }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                      <span style={{ color: C.sage }}>● Innovation {ind.innovation}%</span>
                      <span style={{ color: C.accent }}>● Performance {ind.performance}%</span>
                      <span style={{ color: C.amber }}>● Purpose {ind.purpose}%</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Top theme</div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>{ind.topTheme}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sentiment</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: ind.sentiment >= 65 ? C.sage : ind.sentiment >= 50 ? C.amber : C.red, fontFamily: "'JetBrains Mono', monospace" }}>
                      {ind.sentiment}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANY SPOTLIGHTS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Company spotlights
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          The stories that defined 2026.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {COMPANY_SPOTLIGHTS.map((s, i) => (
            <div key={i} style={{
              padding: "40px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "16px",
              boxShadow: C.shadow,
              display: "grid", gridTemplateColumns: "1fr 200px",
              gap: "40px", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase",
                  marginBottom: "12px", fontWeight: 700,
                }}>
                  {s.company}
                </div>
                <h3 style={{
                  fontSize: "22px", fontWeight: 700, color: C.text,
                  letterSpacing: "-0.02em", margin: "0 0 16px", lineHeight: 1.3,
                }}>
                  {s.headline}
                </h3>
                <p style={{
                  fontSize: "14px", color: C.textSec, lineHeight: 1.65, margin: 0,
                }}>
                  {s.text}
                </p>
              </div>
              <div style={{
                padding: "24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
                textAlign: "center",
              }}>
                <div style={{
                  fontSize: "32px", fontWeight: 800, color: C.sage,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, letterSpacing: "-0.04em", marginBottom: "6px",
                }}>
                  {s.metric}
                </div>
                <div style={{
                  fontSize: "11px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.4,
                }}>
                  {s.metricLabel}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Get the full report
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Download the full 2026 Media Intelligence Report.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            40 pages of analysis covering 10 trends, 6 industries, 20 company spotlights, and 5 emerging risks for 2027.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Download full report (PDF, 40 pages) →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600,
  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
  fontFamily: "'JetBrains Mono', monospace",
  borderBottom: `1px solid ${C.border}`,
};

const tdStyle: React.CSSProperties = {
  padding: "16px", fontSize: "13px", color: C.textSec,
};

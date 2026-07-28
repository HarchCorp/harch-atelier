"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

const FEATURED = [
  {
    type: "Whitepaper",
    title: "The new era of reputation-based decision making",
    desc: "Why 85% of C-suite leaders prioritize reputation over profit margin — and what Comms leaders must do to capitalize.",
    readTime: "15 min read",
    date: "July 2026",
    color: C.sage,
    href: "/atelier/decision-augmentation",
    featured: true,
  },
  {
    type: "Report",
    title: "Harch AI 2026 Media Intelligence Report",
    desc: "61,218 articles analyzed. Top 10 trends, 6 industry profiles, 3 company spotlights. The state of Moroccan corporate reputation.",
    readTime: "40 pages PDF",
    date: "August 2026",
    color: C.accent,
    href: "/atelier/media-intelligence",
    featured: true,
  },
];

const ALL_INSIGHTS = [
  { type: "Ranking", title: "Harch 100 — Morocco's most reputable companies", desc: "Live ranking of top 100 Moroccan companies by reputation score. Innovation · Performance · Purpose pillars.", time: "Interactive", date: "Updated weekly", color: C.sageBright, href: "/atelier/harch-100" },
  { type: "Dashboard", title: "Risk Tracker — Industry Risk Dashboard", desc: "32 risk categories across 6 industries. Real-time monitoring with Frequency × Impact × Velocity scoring.", time: "Interactive", date: "Updated daily", color: C.red, href: "/atelier/risk-tracker" },
  { type: "Case Study", title: "How a top-3 Moroccan bank cut crisis response time by 65%", desc: "12 crisis alerts in 6 months. 40 hours saved per week. Sentiment up 18 points.", time: "8 min read", date: "June 2026", color: C.amber, href: "/atelier/customers" },
  { type: "Template", title: "Institutional Reputation Audit (12-page PDF)", desc: "The exact template we deliver to enterprise clients. Cover, exec summary, sentiment, AI visibility, risks, action plan.", time: "Preview (2 free pages)", date: "Updated monthly", color: C.accent, href: "/atelier/templates/institutional-audit" },
  { type: "Methodology", title: "How Harch AI works — from scrape to insight", desc: "Step-by-step breakdown of our 9-step pipeline. Google News RSS, HarchIQ sentiment, topic clustering, risk detection.", time: "12 min read", date: "May 2026", color: C.sage, href: "/atelier/method" },
  { type: "FAQ", title: "Everything you wanted to know about AI reputation intelligence", desc: "20+ questions answered: data sources, sentiment model, AI engines tracked, pricing, deployment, security.", time: "10 min read", date: "Updated July 2026", color: C.sageBright, href: "/atelier/faq" },
  { type: "Product", title: "Five products. One intelligence engine.", desc: "Platform, API & MCP, Insight Reports, Dashboards, Briefings. Which one fits your team's needs?", time: "Interactive", date: "July 2026", color: C.amber, href: "/atelier/products" },
  { type: "Approach", title: "Meet HarchIQ — the trainable AI for reputation intelligence", desc: "HarchIQ reads 5M+ documents/day, understands context, surfaces what matters. 9-step pipeline explained.", time: "8 min read", date: "July 2026", color: C.sage, href: "/atelier/approach/our-ai" },
  { type: "Approach", title: "Our data — 30+ sources, 5M+ articles per day", desc: "The most comprehensive Moroccan & African media dataset. Sources, pipeline, and data quality measures.", time: "10 min read", date: "July 2026", color: C.accent, href: "/atelier/approach/our-data" },
  { type: "Approach", title: "Our commitment — security, compliance, customer success", desc: "GDPR & Loi 09-08 compliant. 99.9% uptime SLA. 24/7 incident response. Money-back guarantee.", time: "6 min read", date: "July 2026", color: C.amber, href: "/atelier/approach/our-commitment" },
  { type: "Expertise", title: "Enterprise Risk expertise", desc: "32 risk categories. 6 industries. Predictive, not reactive. Industry-specific risk mapping.", time: "5 min read", date: "July 2026", color: C.red, href: "/atelier/expertise/enterprise-risk" },
  { type: "Expertise", title: "ESG expertise", desc: "Track sustainability narratives, greenwashing risks, and investor sentiment. 3 ESG pillars, 9 themes.", time: "5 min read", date: "July 2026", color: C.sageBright, href: "/atelier/expertise/esg" },
];

export default function InsightsPage() {
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
            Insights · Whitepapers, reports, tools
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Insights to put reputation first.
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px",
          }}>
            Whitepapers, media intelligence reports, case studies, methodology deep-dives, and interactive tools.
            Everything Comms leaders need to make better, faster, reputation-based decisions.
          </p>
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Featured
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "20px",
        }}>
          {FEATURED.map(r => (
            <a key={r.title} href={r.href} style={{
              display: "flex", flexDirection: "column",
              padding: "32px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "16px",
              boxShadow: C.shadow, textDecoration: "none",
              transition: "all 0.2s", borderTop: `3px solid ${r.color}`,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = C.shadow;
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: "20px",
              }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 12px", borderRadius: "100px",
                  background: `${r.color}15`, color: r.color,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  {r.type}
                </span>
                <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.date}
                </span>
              </div>
              <h3 style={{
                fontSize: "22px", fontWeight: 700, color: C.text,
                letterSpacing: "-0.02em", margin: "0 0 14px",
                lineHeight: 1.25,
              }}>
                {r.title}
              </h3>
              <p style={{
                fontSize: "14px", color: C.textSec, lineHeight: 1.6,
                marginBottom: "24px", flex: 1,
              }}>
                {r.desc}
              </p>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingTop: "20px", borderTop: `1px solid ${C.borderLight}`,
              }}>
                <span style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.readTime}
                </span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: r.color, fontFamily: "'Inter', sans-serif" }}>
                  Read →
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ALL INSIGHTS GRID */}
      <section style={{
        background: C.surface, padding: "80px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            All insights · {ALL_INSIGHTS.length} resources
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
            Explore the library.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}>
            {ALL_INSIGHTS.map((r, i) => (
              <a key={i} href={r.href} style={{
                display: "flex", flexDirection: "column",
                padding: "28px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
                textDecoration: "none", transition: "all 0.2s",
                borderTop: `3px solid ${r.color}`,
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: "14px",
                }}>
                  <span style={{
                    fontSize: "10px", fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    padding: "3px 10px", borderRadius: "100px",
                    background: `${r.color}15`, color: r.color,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {r.type}
                  </span>
                  <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.date}
                  </span>
                </div>
                <h3 style={{
                  fontSize: "17px", fontWeight: 700, color: C.text,
                  letterSpacing: "-0.01em", margin: "0 0 10px", lineHeight: 1.3,
                }}>
                  {r.title}
                </h3>
                <p style={{
                  fontSize: "13px", color: C.textSec, lineHeight: 1.55,
                  marginBottom: "16px", flex: 1,
                }}>
                  {r.desc}
                </p>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingTop: "14px", borderTop: `1px solid ${C.borderLight}`,
                }}>
                  <span style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                    {r.time}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: r.color, fontFamily: "'Inter', sans-serif" }}>
                    Access →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Weekly intelligence
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Get the Harch weekly digest.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Every Monday at 8am Casa time: top 5 reputation stories of the week, emerging risks, and one actionable insight.
            Free. No spam. Unsubscribe anytime.
          </p>
          <form onSubmit={(e) => e.preventDefault()} style={{
            display: "flex", gap: "8px", maxWidth: "440px",
            margin: "0 auto", flexWrap: "wrap", justifyContent: "center",
          }}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              style={{
                flex: 1, minWidth: "240px",
                padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "#FFFFFF",
                fontSize: "14px", fontFamily: "'Inter', sans-serif",
                outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "14px 24px", background: C.sage,
              color: "#FFFFFF", border: "none",
              borderRadius: "8px", fontSize: "14px", fontWeight: 600,
              fontFamily: "'Inter', sans-serif", cursor: "pointer",
            }}>
              Subscribe →
            </button>
          </form>
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

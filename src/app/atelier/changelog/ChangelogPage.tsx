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

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch" | "fix";
  title: string;
  changes: { category: string; items: string[] }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "2.4.0",
    date: "July 19, 2026",
    type: "major",
    title: "Signal AI-style mega-menu + 16 new pages",
    changes: [
      { category: "Added", items: [
        "Mega-menu navigation with 6 top-level items and 41 dropdown links",
        "5 Expertise pages (Enterprise Risk, Reputation Risk, PR & Comms, ESG, Regulation)",
        "5 Insight Report pages (Risk, Reputation Risk, Reputation, Media Impact, Deep Dive)",
        "3 Approach pages (Our AI, Our Data, Our Commitment)",
        "Ask HarchIQ conversational AI chat interface",
        "Insights hub page with 14 resources",
        "Reputation Tracker (sister to Risk Tracker)",
        "Decision Augmentation page (Signal AI whitepaper thesis)",
        "Customers page with 4 case studies",
        "Media Intelligence Report (2026 year-in-review)",
        "Trust Center (security & compliance)",
        "Contact, Careers, Partners, Legal pages",
      ]},
      { category: "Changed", items: [
        "Replaced all GLM-4 mentions with HarchIQ (our branded trainable AI)",
        "Engine lists now: ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok",
        "Nav simplified to 6 items with mega-menu dropdowns",
      ]},
    ],
  },
  {
    version: "2.3.0",
    date: "July 18, 2026",
    type: "major",
    title: "Massive content expansion — News, Blog, Industries, Companies",
    changes: [
      { category: "Added", items: [
        "Charts library: 11 reusable SVG components (BarChart, LineChart, DonutChart, Gauge, Heatmap, Sparkline, RadarChart, StackedBar, StatCard, MetricRow, HorizontalBarChart)",
        "Live News Feed with 36 articles, 5 filters, sticky filter bar",
        "Blog with 15 SEO articles (~21,500 words total)",
        "6 Industry profile pages (Banking, Telecom, Mining, Aviation, Retail, Energy)",
        "5 Company profile pages (OCP, Attijariwafa, Maroc Telecom, RAM, Bank of Africa)",
        "Institutional Audit template (12-page PDF with blur teaser)",
        "Risk Intelligence engine: 32 risk categories, Frequency × Impact × Velocity scoring",
        "Signal AI 500-style Harch 100 with Innovation/Performance/Purpose pillars",
        "Risk Tracker with Industry Risk Dashboard",
      ]},
    ],
  },
  {
    version: "2.2.0",
    date: "July 17, 2026",
    type: "minor",
    title: "Signal AI-style Products + Solutions pages",
    changes: [
      { category: "Added", items: [
        "Products page: 5 products (Platform, API & MCP, Insight Reports, Dashboards, Briefings)",
        "Solutions page: 4 solutions (Narrative Planning, Threat Sensing, Benchmarking, Media Monitoring)",
        "Reputation Dashboards product page with materiality matrix",
        "Enterprise Risk Intelligence product page with risk matrix",
        "API & MCP product page with code examples (Python, TypeScript, cURL, MCP)",
        "Integrations page (12 integrations: Slack, Teams, Tableau, PowerBI, Claude, etc.)",
      ]},
      { category: "Changed", items: [
        "Home page hero: 'Promote. Protect. Shape.' (Signal AI style)",
        "Stats: 5M+ articles/day, 100M+ entities, 120+ languages, 32 risk categories",
      ]},
    ],
  },
  {
    version: "2.1.0",
    date: "July 16, 2026",
    type: "fix",
    title: "Critical SEO + data consistency + accessibility fixes",
    changes: [
      { category: "Fixed", items: [
        "Double-pipe title bug on 42 pages (title: string → title: { absolute })",
        "Canonical URLs missing /atelier/ prefix (5 company pages + 56 sitemap routes)",
        "Cross-page data contradictions (Harch 100 scores, quarterly trends, risk levels)",
        "Fabricated CEO name 'Mohamed El Kettani' → 'Ismail Douiri' (Attijariwafa)",
        "Fabricated digital platforms 'TawbaTam/TikTal' → 'Tijari' (Attijariwafa)",
        "OCP phosphate reserves 31% → 70% (was factually wrong)",
        "Energy page logic error 'second-lowest ahead of retail' → 'lowest behind retail'",
        "Removed fabricated 'Mohammedia refinery fire' (Samir closed since 2015)",
        "Mega-menu keyboard accessibility (aria-expanded, aria-haspopup, onClick, Escape)",
        "Skip-to-content link added (WCAG 2.4.1)",
        "Harch 100 expandable rows keyboard accessible (tabIndex, role, aria-expanded, onKeyDown)",
        "News Feed dates 2025 → 2026, stat cards honest, AR tags fixed",
      ]},
    ],
  },
  {
    version: "2.0.0",
    date: "July 15, 2026",
    type: "major",
    title: "Light theme rebuild — AI Reputation Intelligence",
    changes: [
      { category: "Added", items: [
        "Complete light theme rebuild (#FAFAFA bg, sage #4A7B5F accent)",
        "BrandBadge component: 'HARCH | Atelier' pattern",
        "FR/EN language switcher in nav",
        "Harch 100 ranking (Signal AI 500 style)",
        "Risk Tracker (Industry Risk Dashboard)",
        "PDF templates with blur teaser (free → paid conversion)",
        "WhatsApp daily digest preview",
      ]},
      { category: "Removed", items: [
        "Dark theme (user rejected: 'dégueulasse')",
        "GEO (Generative Engine Optimization) framing — pivoted to AI Reputation Intelligence",
      ]},
    ],
  },
  {
    version: "1.5.0",
    date: "July 12, 2026",
    type: "minor",
    title: "Intelligence Engine v2 — institutional-grade",
    changes: [
      { category: "Added", items: [
        "Entity-level sentiment analysis (FR/AR/EN trilingual, 108+ word lexicon)",
        "Topic clustering (10 categories)",
        "Narrative detection (5 dominant narratives with strength scoring)",
        "Risk assessment (0-100, 5 levels)",
        "Competitor benchmarking",
        "Recommendation engine (prioritized, with timeline and owner)",
        "9-step analysis pipeline (Scrape → Analyze → Score → Rank → Deliver)",
      ]},
    ],
  },
  {
    version: "1.0.0",
    date: "July 8, 2026",
    type: "major",
    title: "Initial launch — Harch Atelier",
    changes: [
      { category: "Added", items: [
        "Initial Next.js 16 + TypeScript + Turbopack setup",
        "30+ Moroccan and African media sources (RSS + Google News aggregation)",
        "Company aliases for 12 Moroccan companies",
        "Google News RSS as primary scraper source (48+ articles per company)",
        "Dashboard with live audit API",
        "Pricing page (Starter 5K / Pro 15K / Enterprise 50K MAD/mois)",
      ]},
    ],
  },
];

const TYPE_COLORS = {
  major: { bg: "rgba(74,123,95,0.1)", text: "#4A7B5F", label: "MAJOR" },
  minor: { bg: "rgba(74,93,110,0.1)", text: "#4A5D6E", label: "MINOR" },
  patch: { bg: "rgba(184,115,51,0.1)", text: "#B87333", label: "PATCH" },
  fix: { bg: "rgba(160,82,75,0.1)", text: "#A0524B", label: "FIX" },
};

const CATEGORY_COLORS = {
  Added: "#4A7B5F",
  Changed: "#4A5D6E",
  Fixed: "#A0524B",
  Removed: "#71717A",
  Deprecated: "#B87333",
};

export default function ChangelogPage() {
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
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Changelog · Product updates
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px",
          }}>
            What's new at <span style={{ color: C.sage }}>Harch Atelier.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "640px",
          }}>
            Every update to the Harch Atelier platform — new features, improvements, bug fixes, and breaking changes.
            Subscribe to our weekly digest to stay informed.
          </p>
        </div>
      </section>

      {/* CHANGELOG ENTRIES */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
          {CHANGELOG.map((entry, i) => {
            const typeColor = TYPE_COLORS[entry.type];
            return (
              <div key={entry.version} style={{
                position: "relative",
                paddingBottom: i === CHANGELOG.length - 1 ? 0 : "48px",
              }}>
                {/* Timeline line */}
                {i < CHANGELOG.length - 1 && (
                  <div style={{
                    position: "absolute", left: "19px", top: "40px", bottom: "0",
                    width: "2px", background: C.border,
                  }} />
                )}
                
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "24px" }}>
                  {/* Timeline dot */}
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: typeColor.bg, border: `2px solid ${typeColor.text}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: 800, color: typeColor.text,
                    fontFamily: "'JetBrains Mono', monospace",
                    flexShrink: 0, zIndex: 1,
                  }}>
                    ●
                  </div>

                  {/* Entry content */}
                  <div>
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      marginBottom: "8px", flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontSize: "24px", fontWeight: 800, color: C.text,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em",
                      }}>
                        v{entry.version}
                      </span>
                      <span style={{
                        fontSize: "10px", fontWeight: 700,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: "3px 10px", borderRadius: "100px",
                        background: typeColor.bg, color: typeColor.text,
                        letterSpacing: "0.08em",
                      }}>
                        {typeColor.label}
                      </span>
                      <span style={{
                        fontSize: "12px", color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {entry.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontSize: "20px", fontWeight: 700, color: C.text,
                      letterSpacing: "-0.02em", margin: "0 0 20px",
                    }}>
                      {entry.title}
                    </h2>

                    {/* Changes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {entry.changes.map((change, ci) => {
                        const catColor = CATEGORY_COLORS[change.category as keyof typeof CATEGORY_COLORS] || C.accent;
                        return (
                          <div key={ci}>
                            <div style={{
                              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                              color: catColor, letterSpacing: "0.12em", textTransform: "uppercase",
                              marginBottom: "10px", fontWeight: 700,
                            }}>
                              {change.category}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {change.items.map((item, ii) => (
                                <div key={ii} style={{
                                  display: "flex", gap: "10px",
                                  fontSize: "14px", color: C.textSec, lineHeight: 1.55,
                                }}>
                                  <span style={{ color: catColor, fontWeight: 700, flexShrink: 0 }}>•</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "80px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Stay updated
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Get the weekly product update.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Every Friday: new features, improvements, and fixes. Plus early access to beta features.
          </p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "8px", maxWidth: "440px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              style={{
                flex: 1, minWidth: "240px",
                padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "#FFFFFF",
                fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <button type="submit" style={{
              padding: "14px 24px", background: C.sage, color: "#FFFFFF",
              border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
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

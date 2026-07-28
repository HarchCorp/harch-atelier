"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — SOLUTIONS PAGE
//  Signal AI-style: 4 solutions for PR & Comms teams
//  Corporate Narrative Planning · Reputational Threat Sensing
//  Benchmarking & Measurement · Media Monitoring
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface Solution {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  capabilities: string[];
  questions: string[]; // Big PR questions this answers
  deliverable: string;
  metric: { value: string; label: string };
}

const SOLUTIONS: Solution[] = [
  {
    id: "narrative-planning",
    title: "Corporate Narrative Planning",
    tagline: "Identify dominant narratives. Shape your story with powerful, industry-backed insights.",
    description: "Stop reacting to the news cycle. Harch AI identifies the dominant narratives forming around your company, your competitors, and your industry — so you can shape the story before it shapes you. Our HarchIQ engine detects emerging narratives in real-time across 30+ Moroccan and African media sources, in French, Arabic, and English.",
    icon: "◆",
    color: C.sage,
    capabilities: [
      "5 dominant narrative detection per company with strength scoring (0-100)",
      "Narrative trajectory tracking: emerging · growing · peak · declining",
      "Sentiment per narrative — see which stories are positive vs negative",
      "Topic clustering across 10 categories (financial results, leadership, products, ESG, M&A, digital, crisis, expansion, partnerships, regulation)",
      "Innovation / Performance / Purpose pillar weighting (Signal AI 500 style)",
      "9 key themes: Collaborations, Products & services, Technology, Governance, Growth, Operations, CSR, Culture, Sustainability",
    ],
    questions: [
      "What do we want our company to be famous for?",
      "What are the key drivers of trust in our brand?",
      "Which narrative is gaining momentum this week?",
      "Where are competitors winning the conversation?",
    ],
    deliverable: "Narrative Intelligence Report (PDF, monthly) + Real-time dashboard",
    metric: { value: "5", label: "narratives tracked per company" },
  },
  {
    id: "threat-sensing",
    title: "Reputational Threat Sensing",
    tagline: "Spot reputational risks ahead of time. Be proactive, not reactive.",
    description: "Don't wait for a crisis to erupt. Harch AI scans 30+ media sources 24/7 and detects emerging threats before they escalate. With 32 risk event categories (geopolitical, operational, financial, environmental, legal, consumer, technology) and Frequency × Impact × Velocity scoring, you'll know which risks are rising — and what to do about them.",
    icon: "⚠",
    color: C.red,
    capabilities: [
      "32 risk event categories (Signal AI methodology)",
      "Risk scoring: Frequency × Impact Severity × Velocity (0-100 composite)",
      "Industry-specific risk weighting (Banking × 1.8 on fraud, Telecom × 1.7 on cyber, Mining × 1.7 on accidents)",
      "Risk trajectory: rising · stable · declining",
      "Real-time WhatsApp alerts when risk velocity > 50% in 24h",
      "AI-generated mitigation recommendations per risk",
      "Emerging risk detection — catch risks before they hit mainstream media",
    ],
    questions: [
      "What threats and issues are emerging in my supply chain?",
      "Which negative narrative is gaining traction this week?",
      "When should we activate crisis communications?",
      "What's the risk trajectory of our industry?",
    ],
    deliverable: "Risk Tracker Dashboard + WhatsApp crisis alerts + Quarterly risk review",
    metric: { value: "32", label: "risk event categories monitored" },
  },
  {
    id: "benchmarking",
    title: "Benchmarking & Measurement",
    tagline: "Compare, assess, and align your reputation with top-tier industry players.",
    description: "You can't improve what you can't compare. Harch AI benchmarks your reputation against your top 5 competitors across 10+ metrics — share of voice, sentiment gap, AI visibility gap, narrative strength, and more. The Harch 100 ranking shows where you stand among Morocco's most reputable companies, updated monthly.",
    icon: "▲",
    color: C.accent,
    capabilities: [
      "Competitor benchmarking across 5 metrics (score, share of voice, sentiment gap, AI visibility, narrative strength)",
      "Harch 100 ranking — Morocco's top 100 companies by reputation score",
      "Industry Risk Dashboard for 6 industries (Banking, Telecom, Mining, Retail, Aviation, Energy)",
      "Quarterly trend tracking (4Q historical)",
      "Share of conversation vs industry total",
      "Reputation pillars comparison (Innovation / Performance / Purpose)",
      "Pillar weight analysis — what % of your narrative is Innovation vs Performance vs Purpose",
    ],
    questions: [
      "How do we measure the impact of our comms work?",
      "Are we winning or losing share of voice this quarter?",
      "Where does our industry rank us vs competitors?",
      "What's our reputation trajectory over the last 12 months?",
    ],
    deliverable: "Competitor Benchmark Report + Harch 100 position + Quarterly trend analysis",
    metric: { value: "100", label: "Moroccan companies ranked" },
  },
  {
    id: "media-monitoring",
    title: "Media Monitoring",
    tagline: "Evaluate and optimize your media campaigns, backed by quantifiable metrics.",
    description: "Real-time media monitoring across 30+ Moroccan and African sources, with trilingual sentiment analysis (FR · AR · EN). Every article is analyzed at the entity level — not just keyword mentions — so you know exactly what's being said about you, by whom, and how it's being received.",
    icon: "◉",
    color: C.sageBright,
    capabilities: [
      "30+ Moroccan & African media sources (TelQuel, Medias24, Hespress, Aujourd'hui, Financial Afrik, Africa News, +24 more)",
      "Google News aggregation — captures every Moroccan media mention",
      "Trilingual sentiment analysis (FR · AR · EN) with 108+ word lexicon",
      "Entity-level sentiment — track company vs competitors in same article",
      "Source authority scoring — know which outlets matter most",
      "Top 30 articles by relevance, ranked weekly",
      "AI visibility monitoring — what ChatGPT, Perplexity, Gemini, Claude say about you",
    ],
    questions: [
      "What is the media saying about my company today?",
      "Which sources matter most for my industry?",
      "Are we being cited by AI engines when prospects ask about us?",
      "How has our sentiment evolved over the last 30 days?",
    ],
    deliverable: "Daily WhatsApp digest + Weekly media report + Live dashboard",
    metric: { value: "30+", label: "media sources monitored" },
  },
];

export default function SolutionsPage() {
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
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.sage, animation: "pulse 2s infinite",
            }} />
            Solutions · For Comms & PR leaders
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Actionable insights that answer<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>big PR questions.</span>
          </h1>

          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Our PR solution offers unparalleled insights based on the world's most valuable earned media.
            With our product suite, you can quickly gain clarity on the topics shaping emerging narratives.
            This empowers you to understand emerging trends and align your strategy with prevailing sentiments.
          </p>

          {/* Stats row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "100M+", label: "entities labeled/day" },
              { value: "5M+", label: "articles ingested/day" },
              { value: "120+", label: "languages translated" },
              { value: "32", label: "risk categories" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{
                  fontSize: "28px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, marginBottom: "6px",
                }}>
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

      {/* SOLUTIONS — One per section */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        {SOLUTIONS.map((sol, i) => (
          <SolutionSection key={sol.id} solution={sol} index={i + 1} />
        ))}
      </section>

      {/* STRATEGIC QUESTIONS — Signal AI whitepaper style */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "100px 32px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            The new era of reputation-based decision making
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 24px", color: "#FFFFFF",
            maxWidth: "800px",
          }}>
            When reputation is the biggest driver behind decisions, business leaders turn to Comms.
          </h2>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6, marginBottom: "48px", maxWidth: "760px",
          }}>
            85% of C-suite leaders prioritize reputation over profit margin when making decisions.
            Comms leaders can flex their strategic muscle by taking advantage of AI tools that make
            sense of vast volumes of data — and subsequently act as advisors to the C-suite.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {[
              "What do we want our company to be famous for?",
              "What are the key drivers of trust in our brand?",
              "What threats and issues are emerging in my supply chain?",
              "How do we measure the impact of our comms work and relate it back to business performance?",
              "Which narrative is gaining momentum this week?",
              "Where does our industry rank us vs competitors?",
            ].map((q, i) => (
              <div key={i} style={{
                padding: "24px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
              }}>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.sageBright, letterSpacing: "0.1em",
                  marginBottom: "12px", fontWeight: 700,
                }}>
                  Q{i + 1}
                </div>
                <div style={{
                  fontSize: "16px", color: "#FFFFFF",
                  lineHeight: 1.5, fontWeight: 500,
                }}>
                  {q}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.bg, padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Get started
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em", margin: "0 0 20px",
          }}>
            Ready to put reputation first?
          </h2>
          <p style={{ fontSize: "17px", color: C.textSec, marginBottom: "32px", lineHeight: 1.6 }}>
            Request a personalized demo and see how Harch AI can transform your comms team
            from tactical delivery to strategic influence.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request a demo →
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

// ─── Sub-components ─────────────────────────────────────────────

function SolutionSection({ solution, index }: { solution: Solution; index: number }) {
  const isReverse = index % 2 === 0;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      gap: "64px", alignItems: "center",
      padding: "60px 0", borderBottom: `1px solid ${C.border}`,
      direction: isReverse ? "rtl" : "ltr",
    }}>
      {/* Left: copy */}
      <div style={{ direction: "ltr" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          marginBottom: "16px",
        }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "10px",
            background: `${solution.color}15`,
            color: solution.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {solution.icon}
          </div>
          <span style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: solution.color, letterSpacing: "0.14em",
            textTransform: "uppercase", fontWeight: 700,
          }}>
            Solution {String(index).padStart(2, "0")}
          </span>
        </div>

        <h2 style={{
          fontSize: "32px", fontWeight: 700, color: C.text,
          letterSpacing: "-0.03em", margin: "0 0 16px",
        }}>
          {solution.title}
        </h2>

        <p style={{
          fontSize: "16px", color: solution.color, fontWeight: 600,
          lineHeight: 1.5, marginBottom: "20px",
        }}>
          {solution.tagline}
        </p>

        <p style={{
          fontSize: "15px", color: C.textSec, lineHeight: 1.65,
          marginBottom: "32px",
        }}>
          {solution.description}
        </p>

        {/* Big metric */}
        <div style={{
          padding: "20px 24px", background: C.surface,
          border: `1px solid ${C.border}`, borderRadius: "10px",
          borderLeft: `4px solid ${solution.color}`,
          display: "flex", alignItems: "center", gap: "20px",
        }}>
          <div>
            <div style={{
              fontSize: "32px", fontWeight: 800, color: solution.color,
              fontFamily: "'JetBrains Mono', monospace",
              lineHeight: 1, letterSpacing: "-0.04em",
            }}>
              {solution.metric.value}
            </div>
            <div style={{
              fontSize: "11px", color: C.textMuted,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.08em", textTransform: "uppercase",
              marginTop: "4px",
            }}>
              {solution.metric.label}
            </div>
          </div>
          <div style={{
            fontSize: "12px", color: C.textSec, lineHeight: 1.5,
            flex: 1, borderLeft: `1px solid ${C.borderLight}`, paddingLeft: "20px",
          }}>
            <strong style={{ color: C.text, display: "block", marginBottom: "4px" }}>
              Deliverable:
            </strong>
            {solution.deliverable}
          </div>
        </div>
      </div>

      {/* Right: capabilities + questions */}
      <div style={{ direction: "ltr" }}>
        {/* Capabilities */}
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px", fontWeight: 600,
        }}>
          Capabilities
        </div>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "12px", padding: "20px", marginBottom: "24px",
          boxShadow: C.shadow,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {solution.capabilities.map((cap, i) => (
              <div key={i} style={{
                display: "flex", gap: "10px",
                fontSize: "13px", color: C.textSec, lineHeight: 1.5,
              }}>
                <span style={{
                  color: solution.color, fontWeight: 700, flexShrink: 0,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  ▸
                </span>
                <span>{cap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Big PR questions */}
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px", fontWeight: 600,
        }}>
          Big PR questions answered
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {solution.questions.map((q, i) => (
            <div key={i} style={{
              padding: "12px 16px", background: C.surface,
              border: `1px solid ${C.borderLight}`, borderRadius: "8px",
              fontSize: "13px", color: C.text, lineHeight: 1.5,
              display: "flex", gap: "12px", alignItems: "flex-start",
            }}>
              <span style={{
                fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
                color: solution.color, fontWeight: 700, flexShrink: 0,
                padding: "2px 6px", borderRadius: "3px",
                background: `${solution.color}10`,
                marginTop: "2px",
              }}>
                Q{i + 1}
              </span>
              <span>{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

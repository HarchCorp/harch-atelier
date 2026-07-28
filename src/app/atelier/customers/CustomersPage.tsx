"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  CUSTOMERS — Case studies & social proof
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface CaseStudy {
  industry: string;
  company: string;
  challenge: string;
  solution: string;
  results: { metric: string; value: string }[];
  quote: { text: string; author: string; role: string };
  duration: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    industry: "Banking",
    company: "Top 3 Moroccan Bank",
    challenge: "The bank's communications team was spending 40+ hours per week manually tracking media coverage across French, Arabic, and English sources. They had no way to detect emerging negative narratives before they escalated, and couldn't benchmark their reputation against the 7 other major Moroccan banks.",
    solution: "We deployed Harch AI's Reputation Intelligence Platform with daily WhatsApp digests, real-time crisis alerts, and monthly board-ready PDF reports. HarchIQ was trained on the bank's specific competitors, key spokespeople, and strategic priorities.",
    results: [
      { metric: "Time saved", value: "40h/week" },
      { metric: "Crisis alerts", value: "12 in 6 months" },
      { metric: "Sentiment improvement", value: "+18 pts" },
      { metric: "AI visibility", value: "3→4 engines" },
    ],
    quote: {
      text: "Harch AI's reporting doesn't just help us understand current conditions — it illuminates our path forward. Their insights have directly influenced the direction of our communications strategy.",
      author: "Director of Communications",
      role: "Moroccan Financial Institution",
    },
    duration: "6 months",
  },
  {
    industry: "Telecommunications",
    company: "Pan-African Telco Operator",
    challenge: "Operating across 4 African markets, this telco needed to monitor reputation in French, English, Arabic, and Portuguese simultaneously. Their existing tool only covered English-language international media, missing 80% of local market coverage.",
    solution: "Harch AI's trilingual engine was deployed across all 4 markets with local media sources per country. The Risk Tracker dashboard gave them real-time visibility into operational risks (cyber, outages, labor disputes) per market.",
    results: [
      { metric: "Markets monitored", value: "4 countries" },
      { metric: "Media sources", value: "30+ added" },
      { metric: "Risk detection lead time", value: "+72 hours" },
      { metric: "Negative sentiment drop", value: "-22%" },
    ],
    quote: {
      text: "After 20+ years of ill-thought-through PR reports put in front of executives, we finally have a reporting mechanism with Harch AI that's seen as truly strategic across the business.",
      author: "Global Head of External Communications",
      role: "African Holdings Group",
    },
    duration: "8 months",
  },
  {
    industry: "Mining & Phosphates",
    company: "Moroccan Mining Leader",
    challenge: "As a major player in phosphate extraction, this company faced rising ESG scrutiny from international investors. They needed to track sustainability narratives, regulatory changes, and operational accident risks in real-time across 5 languages.",
    solution: "We deployed the full Harch AI suite with focus on Environmental and Legal risk categories. The Harch 100 ranking showed them where they stood vs industry peers, and quarterly Insight Reports gave their investor relations team board-ready ESG perception analysis.",
    results: [
      { metric: "ESG sentiment", value: "+34 pts" },
      { metric: "Risk mitigation", value: "5 incidents prevented" },
      { metric: "Investor confidence", value: "ESG rating upgrade" },
      { metric: "Harch 100 rank", value: "#1 in sector" },
    ],
    quote: {
      text: "We considered a number of platforms for media monitoring, but Harch AI stood out to us as being dynamic, forward-thinking, and keen to offer us a package that would best suit our needs.",
      author: "Communications Lead",
      role: "International Mining Company",
    },
    duration: "12 months",
  },
  {
    industry: "Public Sector",
    company: "African Government Agency",
    challenge: "A government agency needed to monitor public perception of a major national policy rollout. They required daily sentiment tracking across all Moroccan media, with the ability to detect regional variations and emerging opposition narratives.",
    solution: "Harch AI's platform was configured to track policy-related keywords, key spokespeople, and 6 specific narrative themes. Real-time alerts were set up for sentiment shifts >10% in 24h. Weekly executive briefings were distributed to 40+ senior officials.",
    results: [
      { metric: "Officials briefed", value: "40+" },
      { metric: "Policy sentiment", value: "Tracked daily" },
      { metric: "Narratives detected", value: "6 themes" },
      { metric: "Response time", value: "-65%" },
    ],
    quote: {
      text: "Harch AI allows us to give decision-makers early warning of public sentiment shifts. We help them plan an efficient response, and in that way provide them with a unique, impactful service.",
      author: "Senior Advisor",
      role: "Government Communications",
    },
    duration: "4 months",
  },
];

export default function CustomersPage() {
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
            Customers · Case studies
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Trusted by Comms leaders<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>across Morocco & Africa.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            From top-3 Moroccan banks to pan-African telcos and government agencies, Harch AI powers
            reputation intelligence for organizations that take perception seriously.
          </p>

          {/* Industry stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "12+", label: "enterprise customers" },
              { value: "4", label: "industries served" },
              { value: "4", label: "African markets" },
              { value: "92%", label: "renewal rate" },
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

      {/* LOGOS / INDUSTRY PILLS */}
      <section style={{
        background: C.surface, padding: "60px 32px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "32px" }}>
            Industries we serve
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" }}>
            {["Banking", "Telecommunications", "Mining & Phosphates", "Aviation", "Retail", "Energy", "Public Sector", "Hospitality", "Cement", "Agro-industry"].map(ind => (
              <span key={ind} style={{
                padding: "10px 18px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "100px",
                fontSize: "13px", fontWeight: 600, color: C.text,
                fontFamily: "'Inter', sans-serif",
              }}>
                {ind}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Case studies
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 60px" }}>
          Real customers. Real results.
        </h2>

        {CASE_STUDIES.map((cs, i) => (
          <CaseStudyCard key={i} study={cs} index={i + 1} />
        ))}
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Become a customer
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Ready to join them?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Request a personalized demo and discover how Harch AI can transform your comms team.
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

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "16px", padding: "40px", marginBottom: "32px",
      boxShadow: C.shadow,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: "24px", flexWrap: "wrap", gap: "16px",
      }}>
        <div>
          <div style={{
            display: "inline-block", fontSize: "10px", fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            padding: "3px 10px", borderRadius: "100px",
            background: `${C.sage}15`, color: C.sage,
            letterSpacing: "0.1em", textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            Case {String(index).padStart(2, "0")} · {study.industry}
          </div>
          <h3 style={{
            fontSize: "24px", fontWeight: 700, color: C.text,
            letterSpacing: "-0.02em", margin: 0,
          }}>
            {study.company}
          </h3>
        </div>
        <div style={{
          fontSize: "11px", color: C.textMuted,
          fontFamily: "'JetBrains Mono', monospace",
          padding: "6px 12px", background: C.surfaceAlt,
          borderRadius: "100px",
        }}>
          Engagement: {study.duration}
        </div>
      </div>

      {/* Challenge + Solution */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "32px", marginBottom: "32px",
      }}>
        <div>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.red, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "12px", fontWeight: 700,
          }}>
            Challenge
          </div>
          <p style={{ fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
            {study.challenge}
          </p>
        </div>
        <div>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: "12px", fontWeight: 700,
          }}>
            Solution
          </div>
          <p style={{ fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
            {study.solution}
          </p>
        </div>
      </div>

      {/* Results */}
      <div style={{
        padding: "24px", background: C.bg,
        border: `1px solid ${C.border}`, borderRadius: "12px",
        marginBottom: "24px",
      }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.12em", textTransform: "uppercase",
          marginBottom: "16px", fontWeight: 700,
        }}>
          Results
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "16px",
        }}>
          {study.results.map((r, i) => (
            <div key={i}>
              <div style={{
                fontSize: "24px", fontWeight: 800, color: C.sage,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1, marginBottom: "4px", letterSpacing: "-0.02em",
              }}>
                {r.value}
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                {r.metric}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <div style={{
        padding: "24px", borderLeft: `4px solid ${C.sage}`,
        background: C.surfaceAlt, borderRadius: "0 12px 12px 0",
      }}>
        <div style={{ fontSize: "32px", color: C.sage, lineHeight: 1, marginBottom: "8px", fontFamily: "'Inter', serif" }}>&ldquo;</div>
        <p style={{
          fontSize: "15px", color: C.text, lineHeight: 1.55,
          marginBottom: "16px", fontStyle: "italic",
        }}>
          {study.quote.text}
        </p>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.text }}>
          {study.quote.author}
        </div>
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
          {study.quote.role}
        </div>
      </div>
    </div>
  );
}

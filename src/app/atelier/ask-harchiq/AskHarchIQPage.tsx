"use client";

import { useState } from "react";
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

const SAMPLE_QUESTIONS = [
  { q: "What's Bank of Africa's reputation score this month?", a: "Bank of Africa scores 72/100 this month (up 1pt from 71). Sentiment: 68% positive. Top narrative: 'Pan-African expansion accelerating with Nigeria entry' (strength 72, sentiment +0.75). Key risk: Labor dispute (severity 65, rising velocity). AI visibility: 3/4 engines citing." },
  { q: "Which Moroccan bank has the strongest ESG narrative?", a: "Based on FY26 coverage, Bank of Africa leads ESG narrative among Moroccan banks with 28 articles and 79% positive sentiment, driven by their sustainable finance framework (MAD 5B target by 2027). Attijariwafa Bank is second (22 articles, 71% positive). CIH Bank lags with only 8 ESG articles." },
  { q: "What are the top 3 risks for the telecom industry right now?", a: "Top 3 risks for Moroccan telecommunications (July 2026): 1) Cyber Attack (score 80/100, rising) — 8 articles this month, 75% negative. 2) Data Breach (70/100, rising) — 5 articles. 3) System Failure (62/100, stable) — 6 articles. Industry overall risk: 58/100 (elevated). Trajectory: stable." },
  { q: "How does OCP Group compare to Managem on sustainability?", a: "OCP Group leads Managem significantly on sustainability narrative: OCP has 89 ESG articles (81% positive) vs Managem's 18 (59% positive). OCP's green ammonia project ($1.2B Jorf Lasfar) drove +12 pts in Q2 reputation score. Managem's main sustainability exposure: pollution incidents (6 articles, 50% negative)." },
  { q: "What's the media impact of our last PR campaign?", a: "I'd need your campaign dates and keywords to measure impact. In general, Harch AI measures: 1) Volume spike during campaign (vs baseline), 2) Sentiment shift (positive coverage ratio), 3) Share of voice vs competitors, 4) Source reach (which outlets picked it up), 5) AI engine pickup. Upload your campaign brief and I'll generate a full impact report." },
];

export default function AskHarchIQPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askQuestion = (q: string) => {
    setQuestion(q);
    setLoading(true);
    setAnswer(null);
    // Simulate AI response
    setTimeout(() => {
      const matched = SAMPLE_QUESTIONS.find(s => q.toLowerCase().includes(s.q.toLowerCase().split(" ").slice(0, 3).join(" ")) || s.q.toLowerCase().includes(q.toLowerCase().split(" ")[0] || ""));
      setAnswer(matched ? matched.a : "I can answer questions about any Moroccan or African company's reputation, sentiment, risks, narratives, AI visibility, and competitor benchmarks. Try one of the sample questions below, or ask your own. For enterprise-grade responses with full data, request a demo.");
      setLoading(false);
    }, 1500);
  };

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
            Ask HarchIQ · Conversational Intelligence
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Ask anything. <span style={{ color: C.sage }}>Get reputation intelligence.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "48px",
          }}>
            HarchIQ is your conversational AI for reputation intelligence. Ask about any Moroccan or African
            company — get instant answers on reputation scores, sentiment, risks, narratives, AI visibility,
            and competitor benchmarks. No dashboards to navigate. Just questions and answers.
          </p>
        </div>
      </section>

      {/* CHAT INTERFACE */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 32px" }}>
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "16px", boxShadow: C.shadow, overflow: "hidden",
        }}>
          {/* Chat header */}
          <div style={{
            padding: "16px 24px", borderBottom: `1px solid ${C.borderLight}`,
            background: C.surfaceAlt,
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: C.sage, color: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
            }}>
              H
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: C.text }}>HarchIQ</div>
              <div style={{ fontSize: "11px", color: C.sage, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage }} />
                Online · trained on Moroccan & African data
              </div>
            </div>
          </div>

          {/* Chat body */}
          <div style={{ padding: "32px", minHeight: "320px" }}>
            {question && (
              <div style={{
                display: "flex", justifyContent: "flex-end", marginBottom: "16px",
              }}>
                <div style={{
                  padding: "12px 18px", background: C.sage, color: "#FFFFFF",
                  borderRadius: "16px 16px 4px 16px", maxWidth: "70%",
                  fontSize: "14px", lineHeight: 1.5,
                }}>
                  {question}
                </div>
              </div>
            )}
            {loading && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: C.sage, color: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0,
                }}>
                  H
                </div>
                <div style={{
                  padding: "12px 18px", background: C.surfaceAlt,
                  borderRadius: "4px 16px 16px 16px",
                  fontSize: "14px", color: C.textMuted, fontStyle: "italic",
                }}>
                  HarchIQ is thinking...
                </div>
              </div>
            )}
            {answer && !loading && (
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{
                  width: "28px", height: "28px", borderRadius: "6px",
                  background: C.sage, color: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0,
                }}>
                  H
                </div>
                <div style={{
                  padding: "16px 20px", background: C.surfaceAlt,
                  borderRadius: "4px 16px 16px 16px", maxWidth: "80%",
                  fontSize: "14px", color: C.text, lineHeight: 1.6,
                }}>
                  {answer}
                </div>
              </div>
            )}
            {!question && (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: C.textMuted, fontSize: "14px",
              }}>
                <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.3 }}>💬</div>
                Ask HarchIQ anything about Moroccan or African company reputation.
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: "16px 24px", borderTop: `1px solid ${C.borderLight}`,
            background: C.surfaceAlt,
          }}>
            <form onSubmit={(e) => { e.preventDefault(); if (question.trim()) askQuestion(question); }} style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about a company, industry, or risk..."
                style={{
                  flex: 1, padding: "12px 16px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: "8px",
                  fontSize: "14px", color: C.text, fontFamily: "'Inter', sans-serif",
                  outline: "none",
                }}
              />
              <button type="submit" style={{
                padding: "12px 24px", background: C.sage, color: "#FFFFFF",
                border: "none", borderRadius: "8px",
                fontSize: "14px", fontWeight: 600, fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
              }}>
                Ask →
              </button>
            </form>
          </div>
        </div>

        {/* Sample questions */}
        <div style={{ marginTop: "40px" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Try these questions
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "12px",
          }}>
            {SAMPLE_QUESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => askQuestion(s.q)}
                style={{
                  padding: "16px 20px", background: C.surface,
                  border: `1px solid ${C.border}`, borderRadius: "10px",
                  textAlign: "left", cursor: "pointer",
                  fontSize: "13px", color: C.textSec, lineHeight: 1.5,
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.sage;
                  e.currentTarget.style.background = C.surfaceAlt;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.background = C.surface;
                }}
              >
                "{s.q}"
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            What you can ask
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
            HarchIQ knows your business.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}>
            {[
              { title: "Company reputation", desc: "'What's Attijariwafa Bank's reputation score?' 'How has OCP Group's sentiment evolved this quarter?'", icon: "◆" },
              { title: "Industry benchmarks", desc: "'Which Moroccan bank has the strongest ESG narrative?' 'Compare top 3 telcos on share of voice.'", icon: "▲" },
              { title: "Risk assessment", desc: "'What are the top 3 risks for the aviation industry?' 'Show me Bank of Africa's risk trajectory.'", icon: "⚠" },
              { title: "Narrative analysis", desc: "'What's the dominant narrative around Maroc Telecom?' 'Is Inwi winning the 5G conversation?'", icon: "◉" },
              { title: "AI visibility", desc: "'Does ChatGPT cite Bank of Africa when asked about Moroccan banks?' 'Which AI engine is most positive about OCP?'", icon: "⌬" },
              { title: "Competitor benchmarks", desc: "'How does Bank of Africa compare to Attijariwafa on sentiment?' 'Who's winning media coverage in telecom?'", icon: "★" },
              { title: "Campaign measurement", desc: "'What's the media impact of our last PR campaign?' 'Did our CEO interview move the needle?'", icon: "◐" },
              { title: "Trend analysis", desc: "'What are the top 5 trends in Moroccan banking this year?' 'Is ESG coverage rising in mining?'", icon: "📈" },
            ].map(item => (
              <div key={item.title} style={{
                padding: "24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
                borderTop: `3px solid ${C.sage}`,
              }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "8px",
                  background: `${C.sage}15`, color: C.sage,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: 700, marginBottom: "16px",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {item.icon}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "10px" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.55, fontStyle: "italic", margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Enterprise access
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Unlock full HarchIQ access.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            The demo above is just a taste. Enterprise customers get unlimited HarchIQ queries, custom training,
            and integration with their internal data via API and MCP.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request enterprise access →
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

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

export interface ReportData {
  slug: string;
  eyebrow: string;
  title: string;
  tagline: string;
  intro: string;
  color: string;
  pages: number;
  deliveryTime: string;
  format: string;
  stats: { value: string; label: string }[];
  whatsIncluded: string[];
  whatsInside: { section: string; desc: string }[];
  sampleQuestions: string[];
  pricing: { tier: string; price: string; frequency: string; features: string[] }[];
}

export function InsightReportPage({ data }: { data: ReportData }) {
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
            color: data.color, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: data.color, animation: "pulse 2s infinite" }} />
            {data.eyebrow} · {data.pages} pages · {data.deliveryTime}
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            {data.title}
          </h1>
          <p style={{
            fontSize: "clamp(18px, 2.5vw, 22px)", color: data.color, fontWeight: 600,
            lineHeight: 1.4, marginBottom: "32px", maxWidth: "760px",
          }}>
            {data.tagline}
          </p>
          <p style={{
            fontSize: "17px", color: C.textSec, lineHeight: 1.65,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            {data.intro}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="/atelier/audit" style={{
              padding: "14px 28px", background: data.color, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}>
              Request this report →
            </a>
            <a href="/atelier/templates/institutional-audit" style={{
              padding: "14px 28px", background: "transparent", color: C.text,
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", border: `1px solid ${C.border}`,
              fontFamily: "'Inter', sans-serif",
            }}>
              See sample report
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 32px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1px", background: C.border, border: `1px solid ${C.border}`,
          borderRadius: "12px", overflow: "hidden",
        }}>
          {data.stats.map(s => (
            <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: data.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "6px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section style={{
        background: C.surface, padding: "80px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            What's included
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
            In every report.
          </h2>
          <div style={{
            padding: "32px", background: C.bg,
            border: `1px solid ${C.border}`, borderRadius: "12px",
          }}>
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "8px 24px",
            }}>
              {data.whatsIncluded.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                  <span style={{ color: data.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Report structure
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          What&apos;s inside the {data.pages} pages.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.whatsInside.map((item, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "60px 1fr",
              gap: "20px", padding: "20px 24px",
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", boxShadow: C.shadow,
              borderLeft: `4px solid ${data.color}`,
            }}>
              <span style={{
                fontSize: "20px", fontWeight: 800, color: data.color,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                  {item.section}
                </div>
                <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.55 }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE QUESTIONS */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Questions this report answers
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
            Big questions, clear answers.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: "12px",
          }}>
            {data.sampleQuestions.map((q, i) => (
              <div key={i} style={{
                padding: "20px 24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "10px",
                display: "flex", gap: "14px", alignItems: "flex-start",
              }}>
                <span style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: data.color, fontWeight: 700, flexShrink: 0,
                  padding: "3px 8px", background: `${data.color}10`,
                  borderRadius: "4px", marginTop: "2px",
                }}>
                  Q{i + 1}
                </span>
                <span style={{ fontSize: "14px", color: C.text, lineHeight: 1.55 }}>
                  {q}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Pricing
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px" }}>
          Choose your cadence.
        </h2>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {data.pricing.map(p => (
            <div key={p.tier} style={{
              padding: "32px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, borderTop: `3px solid ${data.color}`,
            }}>
              <div style={{
                fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                color: data.color, letterSpacing: "0.12em", textTransform: "uppercase",
                marginBottom: "12px", fontWeight: 700,
              }}>
                {p.tier}
              </div>
              <div style={{
                fontSize: "36px", fontWeight: 800, color: C.text,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1, marginBottom: "4px", letterSpacing: "-0.04em",
              }}>
                {p.price}
              </div>
              <div style={{
                fontSize: "12px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: "20px",
              }}>
                {p.frequency}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", fontSize: "12px", color: C.textSec, lineHeight: 1.5 }}>
                    <span style={{ color: data.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "80px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Order your {data.eyebrow.toLowerCase()}.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            {data.deliveryTime}. Delivered as {data.format}. Senior analyst consultation included.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: data.color, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request this report →
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

// ─── DATA FOR ALL 5 REPORTS ─────────────────────────────────────


// REPORT_DATA moved to ./reportData.ts to avoid server/client serialization issues
// Pages should import directly from ./reportData, not from here.

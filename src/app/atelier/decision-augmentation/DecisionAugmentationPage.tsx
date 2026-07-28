"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  DECISION AUGMENTATION — Signal AI core thesis page
//  The new era of reputation-based decision making
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export default function DecisionAugmentationPage() {
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
            The new era of reputation-based decision making
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "980px",
          }}>
            Decision augmentation for<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Comms leaders.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            It has never been more important for Comms leaders to make the right decisions and make them confidently.
            But there has never been more information to consider. Harch AI augments your decision-making by making
            sense of vast volumes of data — surfacing the insights, warnings, and opportunities you need,
            before you have to ask.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "85%", label: "of C-suite prioritize reputation over margin" },
              { value: "#1", label: "blocker: overwhelming volume of data" },
              { value: "5M+", label: "articles ingested per day" },
              { value: "32", label: "risk categories tracked" },
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

      {/* THE PROBLEM */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
              The problem
            </div>
            <h2 style={{ fontSize: "40px", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 24px", lineHeight: 1.1 }}>
              The struggle to make sense of vast data.
            </h2>
            <div style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 16px" }}>
                Decision making is more complex than ever. The volume and velocity of changing data,
                coupled with growing pressure to understand perception, reputation, opportunity, and risk,
                means traditional comms tools are stuck.
              </p>
              <p style={{ margin: "0 0 16px" }}>
                <strong style={{ color: C.text }}>Issues remain unsolved.</strong> Decisions are based on
                gut feeling. Comms teams are overwhelmingly engaged in tactical delivery, not strategic influence.
              </p>
              <p style={{ margin: 0 }}>
                The CIPR&apos;s State of the Profession report echoes that frustration: despite calls for PR
                professionals to shift away from tactics towards strategic influence, practitioners are still
                stuck in tactical delivery.
              </p>
            </div>
          </div>
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: "16px", padding: "40px", boxShadow: C.shadow,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "20px", right: "24px",
              fontSize: "80px", fontWeight: 800, color: `${C.red}15`,
              fontFamily: "'JetBrains Mono', monospace", lineHeight: 1,
            }}>
              !
            </div>
            <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.red, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 700 }}>
              The blocker
            </div>
            <div style={{ fontSize: "24px", fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: "20px" }}>
              &ldquo;The overwhelming volume of data is the biggest blocker to the decision-making process.&rdquo;
            </div>
            <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5, marginBottom: "20px" }}>
              Signal AI research surveyed 1,000 C-suite leaders from organizations of 500+ employees about
              decision making. The verdict was clear: data volume is the #1 blocker.
            </div>
            <div style={{ paddingTop: "20px", borderTop: `1px solid ${C.borderLight}`, fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
              Source: Signal AI Decision Making Research, n=1,000 C-suite
            </div>
          </div>
        </div>
      </section>

      {/* THE SHIFT — reputation over margin */}
      <section style={{
        background: C.text, color: "#FFFFFF", padding: "100px 32px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            The shift
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 40px", color: "#FFFFFF", maxWidth: "800px" }}>
            Business leaders prioritize reputation over profit margin.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
            <div>
              {/* Bar chart 85% vs 15% */}
              <div style={{ marginBottom: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Reputation over margin</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: C.sageBright, fontFamily: "'JetBrains Mono', monospace" }}>85%</span>
                </div>
                <div style={{ height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: C.sage, borderRadius: "6px" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>Margin over reputation</span>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>15%</span>
                </div>
                <div style={{ height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: "15%", height: "100%", background: "rgba(255,255,255,0.3)", borderRadius: "6px" }} />
                </div>
              </div>
            </div>
            <div>
              <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.85)", lineHeight: 1.65, margin: "0 0 20px" }}>
                More than <strong style={{ color: C.sageBright }}>85% of C-suite leaders</strong> said reputation
                was a bigger priority than margin when making decisions for their business.
              </p>
              <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: 0 }}>
                This represents a huge opportunity for Comms leaders to capitalize on the alignment of comms
                activities and business objectives — and respond to the growing need to take on a more strategic role.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION — HarchIQ */}
      <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          The solution · Meet HarchIQ
        </div>
        <h2 style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 32px", maxWidth: "900px" }}>
          HarchIQ — the trainable AI that understands your decision context.
        </h2>
        <p style={{ fontSize: "17px", color: C.textSec, lineHeight: 1.65, marginBottom: "48px", maxWidth: "760px" }}>
          HarchIQ is the scalable, trainable intelligence at the heart of Harch AI. It reads over 5 million
          documents a day, identifies concepts from concrete entities to notional topics, sentiment and relationships,
          and links that information to its underlying knowledge graph. It surfaces critical media intelligence in real-time.
        </p>

        {/* 3-pillar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          {[
            {
              icon: "◆",
              title: "Reads everything",
              color: C.sage,
              points: [
                "5M+ news, blog, broadcast & regulatory documents per day",
                "30+ Moroccan & African media sources",
                "120+ languages translated",
                "Real-time ingestion with 15-min refresh",
              ],
            },
            {
              icon: "▲",
              title: "Understands context",
              color: C.accent,
              points: [
                "Trained on your industry, competitors, and priorities",
                "Entity-level understanding (companies, people, products, topics)",
                "Trilingual sentiment: French, Arabic, English",
                "32 risk event categories detected automatically",
              ],
            },
            {
              icon: "◉",
              title: "Surfaces what matters",
              color: C.amber,
              points: [
                "Predictive alerts before crises erupt",
                "Emerging narrative detection",
                "AI-generated recommendations per risk",
                "WhatsApp + email + dashboard delivery",
              ],
            },
          ].map(p => (
            <div key={p.title} style={{
              padding: "32px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, borderTop: `3px solid ${p.color}`,
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: `${p.color}15`, color: p.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", fontWeight: 700, marginBottom: "20px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {p.icon}
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: C.text, marginBottom: "16px", letterSpacing: "-0.02em" }}>
                {p.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {p.points.map((pt, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                    <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>▸</span>
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASE — EY-style trust score */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            In practice · Case study
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 24px", maxWidth: "800px" }}>
            Building a trust score for a Big 4 audit firm.
          </h2>
          <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "48px", maxWidth: "760px" }}>
            A Big 4 audit firm created a trust score using Harch AI, to identify the connections between
            organizations and defined pillars of trust in order to indicate the trustworthiness of a business
            in key areas according to different stakeholder groups. Armed with the right knowledge, their
            clients are better able to allocate resources required to protect and build trust in accordance
            with their enterprise strategy.
          </p>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}>
            {[
              { metric: "Trust score", value: "0-100", desc: "Composite across 5 trust pillars" },
              { metric: "Pillars tracked", value: "5", desc: "Integrity · Competence · Transparency · Purpose · Impact" },
              { metric: "Stakeholder groups", value: "4", desc: "Investors · Employees · Customers · Regulators" },
              { metric: "Resources reallocated", value: "+32%", desc: "Better allocation vs gut-feel decisions" },
            ].map(s => (
              <div key={s.metric} style={{
                padding: "24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "10px",
              }}>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {s.metric}
                </div>
                <div style={{ fontSize: "32px", fontWeight: 800, color: C.sage, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1, marginBottom: "8px", letterSpacing: "-0.02em" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "12px", color: C.textSec, lineHeight: 1.4 }}>
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE-PROOFING */}
      <section style={{
        background: C.bg, padding: "100px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Future-proofing the Comms industry
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 24px" }}>
            The data-literate Comms leader will be the most strategic voice in the C-suite.
          </h2>
          <p style={{ fontSize: "17px", color: C.textSec, marginBottom: "40px", lineHeight: 1.6 }}>
            The world is changing immeasurably. Tomorrow&apos;s Comms leaders need to adapt and evolve.
            Harnessing AI to make sense of data and indicate actionable insights will open the door for
            Comms teams to elevate their standing, drive crucial trust in their brand, and power long-term
            sustainable value for the business.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Start your decision augmentation journey →
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

"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop, PhaseDisclaimer } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  CAREERS — Solo-founder phase (no fake job postings)
//
//  Per MASTER_VISION.md "Interdictions absolues":
//  ❌ Ne JAMAIS inventer des dirigeants
//  ❌ Ne JAMAIS annoncer une filiale comme "operational" si elle ne l'est pas
//
//  Harch Atelier is currently solo-founder (Amine Harch El Korane, 16 ans).
//  The 8 fake job postings previously on this page have been removed.
//  When we hire for real, this page becomes real.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

const VALUES = [
  { title: "Customers come first", desc: "We measure our success by our customers' success. Every line of code, every analysis, every email should make our customers more successful." },
  { title: "Data over opinions", desc: "We let evidence settle debates. When in doubt, we run experiments, look at the data, and decide based on what we learn." },
  { title: "Trilingual by default", desc: "We think in French, Arabic, and English — sometimes in the same sentence. Moroccan identity is a feature, not a bug." },
  { title: "Ship every week", desc: "We ship value every week. Small improvements compound. Big bets start small and grow." },
  { title: "Write it down", desc: "If it's not documented, it doesn't exist. We write specs, postmortems, and decision logs — for our future selves and future colleagues." },
  { title: "Be the comms team we'd want to hire", desc: "We're building the tool we wish we had when we were PR managers. Empathy for our users is non-negotiable." },
];

export default function CareersPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <PhaseDisclaimer />

      {/* HERO — honest solo-founder status */}
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
            color: C.amber, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.amber, animation: "pulse 2s infinite",
            }} />
            Solo-founder phase · Building in Public
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.05, color: C.text,
            margin: "0 0 28px",
          }}>
            No fake job postings.<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              One founder. Real ambition.
            </span>
          </h1>

          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            marginBottom: "40px", maxWidth: "760px",
          }}>
            Harch Atelier is currently built by one person — Amine Harch El Korane,
            16 years old, based in Casablanca. The previous version of this page
            listed 8 fake job openings with fake benefits (MacBook Pro M3, equity, 25 days vacation)
            for a team of 19 that doesn&apos;t exist. That was wrong, and it&apos;s gone.
          </p>

          <p style={{
            fontSize: "16px", color: C.textMuted, lineHeight: 1.6,
            marginBottom: "40px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            When we hire for real, this page becomes real. Until then, here&apos;s
            what we believe in and how to reach out if you want to be involved.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="mailto:amine@harchcorp.com?subject=Speculative%20application%20-%20Harch%20Atelier" style={{
              padding: "14px 28px", background: C.sage, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}>
              Speculative application →
            </a>
            <a href="/atelier/about" style={{
              padding: "14px 28px", background: "transparent", color: C.text,
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", border: `1px solid ${C.border}`,
              fontFamily: "'Inter', sans-serif",
            }}>
              Read about the founder
            </a>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          How we work
        </div>
        <h2 style={{
          fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700,
          color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px",
        }}>
          The values we&apos;ll hire against.
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {VALUES.map(v => (
            <div key={v.title} style={{
              padding: "28px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow,
            }}>
              <h3 style={{
                fontSize: "17px", fontWeight: 700, color: C.text,
                marginBottom: "12px", letterSpacing: "-0.01em",
              }}>
                {v.title}
              </h3>
              <p style={{
                fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0,
              }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HIRING ROADMAP — honest timeline */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Hiring roadmap
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em",
            margin: "0 0 48px", maxWidth: "760px",
          }}>
            When we&apos;ll actually hire.
          </h2>

          <div style={{
            display: "flex", flexDirection: "column", gap: "24px",
          }}>
            {[
              {
                phase: "Phase 1 — Now (Q3-Q4 2026)",
                status: "Solo founder + 3 pilot clients",
                desc: "Amine builds the product, signs 3 pilot clients, validates PMF. No hires yet — focus is on shipping + revenue.",
                open: false,
              },
              {
                phase: "Phase 2 — First hire (Q1 2027)",
                status: "First engineering hire",
                desc: "Once 3 pilot clients are paying, hire the first senior full-stack engineer. Equity-heavy, salary-modest. Based in Casablanca.",
                open: false,
              },
              {
                phase: "Phase 3 — Sales + Comms analyst (Q2 2027)",
                status: "2 hires",
                desc: "Add a senior account executive (ex-PR agency or ex-comms dir) and a comms analyst who can write the monthly PDF reports.",
                open: false,
              },
              {
                phase: "Phase 4 — Scaling team (2028+)",
                status: "5-10 hires",
                desc: "NLP/ML engineer, product designer, customer success, DevOps. Real benefits package. Real office at Casablanca Finance City.",
                open: false,
              },
            ].map(p => (
              <div key={p.phase} style={{
                padding: "32px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
                opacity: p.open ? 1 : 0.85,
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "12px",
                  flexWrap: "wrap", gap: "8px",
                }}>
                  <h3 style={{
                    fontSize: "18px", fontWeight: 700, color: C.text,
                    letterSpacing: "-0.02em", margin: 0,
                  }}>
                    {p.phase}
                  </h3>
                  <span style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    padding: "3px 10px", borderRadius: "100px",
                    background: p.open ? `${C.sage}15` : `${C.textMuted}15`,
                    color: p.open ? C.sage : C.textMuted,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>
                    {p.status}
                  </span>
                </div>
                <p style={{
                  fontSize: "15px", color: C.textSec, lineHeight: 1.6, margin: 0,
                }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "48px", padding: "24px",
            background: `${C.amber}10`, border: `1px solid ${C.amber}30`,
            borderRadius: "12px",
          }}>
            <p style={{
              fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0,
            }}>
              <strong style={{ color: C.text }}>
                Speculative applications welcome.
              </strong>{" "}
              If you&apos;re a senior comms/PR professional in Morocco, an NLP engineer
              interested in GLM-4 applied to Arabic media, or a sales lead with
              Top 100 Moroccan enterprise experience — email{" "}
              <a href="mailto:amine@harchcorp.com" style={{
                color: C.sage, textDecoration: "underline",
              }}>
                amine@harchcorp.com
              </a>
              . We&apos;ll keep your profile warm and reach out when the right role opens.
            </p>
          </div>
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

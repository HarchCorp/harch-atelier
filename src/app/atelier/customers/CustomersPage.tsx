"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop, PhaseDisclaimer } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  CUSTOMERS — Building in Public (no fake case studies)
//
//  Per MASTER_VISION.md "Interdictions absolues":
//  ❌ Ne JAMAIS ajouter des témoignages falsifiés
//  ❌ Ne JAMAIS inventer des clients
//
//  This page is intentionally honest about pre-launch status.
//  Real case studies will replace this section as we sign clients.
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

export default function CustomersPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <PhaseDisclaimer />

      {/* HERO — honest pre-launch messaging */}
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
            Pre-launch · Building in Public
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.05, color: C.text,
            margin: "0 0 28px",
          }}>
            No fake logos.<br />
            No invented quotes.<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              A real product in progress.
            </span>
          </h1>

          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            marginBottom: "40px", maxWidth: "760px",
          }}>
            Most B2B sites show you a wall of fake client logos and invented quotes
            from "Director of Communications, Top 3 Moroccan Bank." We don&apos;t.
            Harch Atelier is being built transparently — a single founder, a real
            methodology, and the first 3 pilot clients being signed right now.
          </p>

          {/* Real status metrics */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "0", label: "fake testimonials" },
              { value: "0", label: "invented clients" },
              { value: "30+", label: "real media sources tracked" },
              { value: "8", label: "AI engines monitored" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{
                  fontSize: "28px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, marginBottom: "6px",
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: "11px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET CUSTOMERS — who we're building for */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Target customers
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em",
            margin: "0 0 60px", maxWidth: "760px",
          }}>
            Who we&apos;re building for — and who we&apos;re not.
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}>
            {[
              {
                tier: "Tier 1 — Top 100 Moroccan",
                desc: "Listed groups on Bourse de Casablanca (OCP, Attijariwafa, BoA, IAM, RAM...). Budget comm 5-50M MAD/an. Need board-ready monthly PDF. Decision-maker: CEO + Dircom.",
                fit: "Perfect fit",
              },
              {
                tier: "Tier 2 — Top 500 Moroccan",
                desc: "Mid-cap + subsidiaries of multinationals. Budget comm 1-5M MAD/an. Need WhatsApp Daily Digest for C-suite. Decision-maker: Dircom + Head of Digital.",
                fit: "Perfect fit",
              },
              {
                tier: "Tier 3 — Top 500 African francophone",
                desc: "Sénégal, Côte d'Ivoire, Tunisie, Algérie. Same media DNA (francophone + Arabic). Budget comm 2-20M MAD/an. Decision-maker: Group Comms Director.",
                fit: "Expansion 2027",
              },
              {
                tier: "Tier 4 — PME marocaines",
                desc: "Not a fit for now. Our pricing (5K-50K MAD/mois) is calibrated for mid-cap+. PME segment will be served by a future self-serve product.",
                fit: "Not a fit — yet",
              },
            ].map(t => (
              <div key={t.tier} style={{
                padding: "32px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
              }}>
                <div style={{
                  display: "inline-block", fontSize: "10px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 10px", borderRadius: "100px",
                  background: t.fit === "Not a fit — yet" ? `${C.amber}15` : `${C.sage}15`,
                  color: t.fit === "Not a fit — yet" ? C.amber : C.sage,
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "16px",
                }}>
                  {t.fit}
                </div>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: C.text,
                  marginBottom: "12px", letterSpacing: "-0.02em",
                }}>
                  {t.tier}
                </h3>
                <p style={{
                  fontSize: "14px", color: C.textSec, lineHeight: 1.6,
                }}>
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INDUSTRIES WE TRACK */}
      <section style={{
        background: C.surface, padding: "60px 32px",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "32px",
          }}>
            Industries we already track
          </div>
          <div style={{
            display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px",
          }}>
            {[
              "Banking", "Telecommunications", "Mining & Phosphates",
              "Aviation", "Retail", "Energy", "Public Sector",
              "Hospitality", "Cement", "Agro-industry",
            ].map(ind => (
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
          <p style={{
            fontSize: "13px", color: C.textMuted,
            fontFamily: "'JetBrains Mono', monospace",
            marginTop: "24px",
          }}>
            25 companies already scored in Harch 100 — these are real public companies,
            not invented clients. See /atelier/harch-100 for the live ranking.
          </p>
        </div>
      </section>

      {/* HOW WE'LL PROVE IT — methodology transparency */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          How we&apos;ll prove it
        </div>
        <h2 style={{
          fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700,
          color: C.text, letterSpacing: "-0.03em", margin: "0 0 40px",
        }}>
          Once we sign our first 3 pilot clients, this page becomes real.
        </h2>

        <div style={{
          display: "flex", flexDirection: "column", gap: "24px",
        }}>
          {[
            {
              step: "01",
              title: "Pilot phase (Q3-Q4 2026)",
              desc: "3 pilot clients at reduced pricing. Real anonymized case studies published here — with the client's explicit consent, real metrics, real quotes from real people.",
            },
            {
              step: "02",
              title: "Public case studies (Q1 2027)",
              desc: "Once pilot clients see ROI and agree to be named, this page transforms into real customer logos, real testimonials, real numbers. No invented content ever.",
            },
            {
              step: "03",
              title: "Harch 100 becomes industry standard (Q2 2027+)",
              desc: "The Harch 100 ranking — currently 25 Moroccan listed companies with real scraped scores — becomes the industry benchmark, quoted by journalists and analysts.",
            },
          ].map(s => (
            <div key={s.step} style={{
              display: "flex", gap: "32px", alignItems: "flex-start",
              padding: "32px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
            }}>
              <div style={{
                fontSize: "32px", fontWeight: 800, color: C.sage,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1, minWidth: "60px",
              }}>
                {s.step}
              </div>
              <div>
                <h3 style={{
                  fontSize: "18px", fontWeight: 700, color: C.text,
                  marginBottom: "8px", letterSpacing: "-0.02em",
                }}>
                  {s.title}
                </h3>
                <p style={{
                  fontSize: "15px", color: C.textSec, lineHeight: 1.6,
                }}>
                  {s.desc}
                </p>
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
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Become a pilot client
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF",
          }}>
            Want to be case study #1?
          </h2>
          <p style={{
            fontSize: "17px", color: "rgba(255,255,255,0.7)",
            marginBottom: "32px", lineHeight: 1.6,
          }}>
            We&apos;re selecting 3 pilot clients for Q3-Q4 2026. Reduced pricing,
            dedicated onboarding, and the option to be publicly named once ROI is proven.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request a free audit →
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

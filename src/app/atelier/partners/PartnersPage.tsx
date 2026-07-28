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

const PARTNER_TYPES = [
  {
    title: "PR & Comms Agencies",
    icon: "◆",
    color: C.sage,
    desc: "Resell Harch AI to your clients and embed our platform in your service offering. White-label options available for agencies with 10+ clients.",
    benefits: [
      "20% recurring commission on every client",
      "White-label dashboards and reports (your brand)",
      "Co-branded case studies and joint marketing",
      "Priority support with dedicated account manager",
      "Quarterly partner training and certification",
      "Access to partner-only API endpoints",
    ],
    requirements: [
      "Established PR or comms agency (3+ years)",
      "Minimum 5 active enterprise clients",
      "Based in Morocco, Africa, or MENA region",
      "Dedicated point of contact for partnership",
    ],
  },
  {
    title: "Technology Partners",
    icon: "⌬",
    color: C.accent,
    desc: "Integrate Harch AI's data into your platform. CRM, BI tools, social listening, customer experience — if you serve comms teams, let's talk.",
    benefits: [
      "Full API access (10K-100K calls/day based on tier)",
      "MCP server for AI agent integrations",
      "Co-development on joint use cases",
      "Technical partnership badge",
      "Listing in our integrations marketplace",
      "Joint product launches and PR",
    ],
    requirements: [
      "Live SaaS product with active user base",
      "Engineering capacity for API integration",
      "Information security review (SOC 2 or ISO 27001 preferred)",
      "Mutual customer reference within 6 months",
    ],
  },
  {
    title: "Strategic Allies",
    icon: "🤝",
    color: C.amber,
    desc: "Industry associations, business schools, think tanks, and government bodies. Let's collaborate on research, content, and advancing the comms profession.",
    benefits: [
      "Co-branded research and whitepapers",
      "Joint events and conference presence",
      "Speaking opportunities at Harch events",
      "Discounted or pro-bono access for members",
      "Thought leadership platform",
      "Annual partnership announcement",
    ],
    requirements: [
      "Recognized industry body or institution",
      "Alignment with our mission (reputation, comms, AI literacy)",
      "Active community of 500+ members",
      "Non-exclusive — we partner broadly",
    ],
  },
  {
    title: "Referral Partners",
    icon: "★",
    color: C.sageBright,
    desc: "Consultants, freelance comms pros, and industry connectors. Refer clients to Harch AI and earn recurring commissions.",
    benefits: [
      "15% recurring commission for 12 months",
      "Personal referral link with tracking",
      "Quarterly payout (bank transfer, MAD or EUR)",
      "Marketing collateral and demo support",
      "No minimum commitment",
      "Direct line to our sales team",
    ],
    requirements: [
      "Active professional network in Morocco or Africa",
      "LinkedIn profile or professional website",
      "Willingness to do warm intros (no cold spam)",
    ],
  },
];

export default function PartnersPage() {
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
            Partners · Build with us
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Partner with Harch.
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            We work with PR agencies, technology platforms, industry associations, and individual consultants.
            Four partnership models — pick the one that fits.
          </p>
        </div>
      </section>

      {/* PARTNER TYPES */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {PARTNER_TYPES.map(p => (
            <div key={p.title} style={{
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "16px", padding: "40px", boxShadow: C.shadow,
              borderTop: `3px solid ${p.color}`,
            }}>
              <div style={{
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: "24px", alignItems: "flex-start", marginBottom: "24px",
              }}>
                <div style={{
                  width: "56px", height: "56px", borderRadius: "12px",
                  background: `${p.color}15`, color: p.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "26px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <div>
                  <h2 style={{
                    fontSize: "26px", fontWeight: 700, color: C.text,
                    letterSpacing: "-0.02em", margin: "0 0 10px",
                  }}>
                    {p.title}
                  </h2>
                  <p style={{ fontSize: "15px", color: C.textSec, lineHeight: 1.6, margin: 0 }}>
                    {p.desc}
                  </p>
                </div>
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "32px",
              }}>
                <div>
                  <div style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: p.color, letterSpacing: "0.12em", textTransform: "uppercase",
                    marginBottom: "14px", fontWeight: 700,
                  }}>
                    Benefits
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {p.benefits.map((b, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                        <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>✓</span>
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{
                    fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                    color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
                    marginBottom: "14px", fontWeight: 700,
                  }}>
                    Requirements
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {p.requirements.map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                        <span style={{ color: C.textMuted, fontWeight: 700, flexShrink: 0 }}>▸</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: "24px", paddingTop: "24px",
                borderTop: `1px solid ${C.borderLight}`,
              }}>
                <a href="mailto:partners@harchcorp.com?subject=Partnership inquiry: {p.title}" style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", background: p.color,
                  color: "#FFFFFF", fontSize: "13px", fontWeight: 600,
                  textDecoration: "none", borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                }}>
                  Apply for {p.title.toLowerCase()} partnership →
                </a>
              </div>
            </div>
          ))}
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

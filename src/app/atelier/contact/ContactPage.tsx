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

const CONTACT_METHODS = [
  {
    title: "Sales & demos",
    email: "sales@harchcorp.com",
    desc: "Talk to our team about platform demos, pricing, and enterprise plans.",
    response: "Within 4 business hours",
    icon: "◆",
  },
  {
    title: "Customer support",
    email: "support@harchcorp.com",
    desc: "Existing customers with technical questions or feature requests.",
    response: "Within 2 business hours (Pro) / 30 min (Enterprise)",
    icon: "▲",
  },
  {
    title: "Security & vulnerability disclosure",
    email: "security@harchcorp.com",
    desc: "Report security vulnerabilities or request security documentation.",
    response: "Within 24 hours",
    icon: "🔒",
  },
  {
    title: "Press & media",
    email: "press@harchcorp.com",
    desc: "Journalists and analysts requesting interviews or data.",
    response: "Within 1 business day",
    icon: "✉",
  },
  {
    title: "Partnerships",
    email: "partners@harchcorp.com",
    desc: "PR agencies, consultancies, and technology partners.",
    response: "Within 2 business days",
    icon: "🤝",
  },
  {
    title: "Careers",
    email: "careers@harchcorp.com",
    desc: "Open positions, internships, and speculative applications.",
    response: "Within 5 business days",
    icon: "★",
  },
];

const OFFICES = [
  {
    city: "Casablanca",
    country: "Morocco",
    address: "Casablanca Finance City, Casa-Anfa",
    desc: "Headquarters — Product, Engineering, Sales",
    employees: 14,
  },
  {
    city: "Rabat",
    country: "Morocco",
    address: "Hay Riad Business District",
    desc: "Public Sector & Government Relations",
    employees: 3,
  },
  {
    city: "Paris",
    country: "France",
    address: "Station F (remote-first)",
    desc: "European Business Development",
    employees: 2,
  },
];

export default function ContactPage() {
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
            Contact us
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Let&apos;s talk reputation.
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Whether you want a demo, have a security question, or are interested in partnering —
            we respond fast. Pick the right inbox below to reach the right team.
          </p>
        </div>
      </section>

      {/* CONTACT METHODS GRID */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {CONTACT_METHODS.map(m => (
            <div key={m.title} style={{
              padding: "28px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, borderTop: `3px solid ${C.sage}`,
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px",
                background: `${C.sage}15`, color: C.sage,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", marginBottom: "16px",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {m.icon}
              </div>
              <h3 style={{
                fontSize: "18px", fontWeight: 700, color: C.text,
                marginBottom: "8px", letterSpacing: "-0.01em",
              }}>
                {m.title}
              </h3>
              <p style={{
                fontSize: "13px", color: C.textSec, lineHeight: 1.55,
                marginBottom: "16px",
              }}>
                {m.desc}
              </p>
              <a href={`mailto:${m.email}`} style={{
                display: "block", fontSize: "14px", fontWeight: 600,
                color: C.sage, marginBottom: "8px", textDecoration: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {m.email} →
              </a>
              <div style={{
                fontSize: "11px", color: C.textMuted,
                fontFamily: "'JetBrains Mono', monospace",
                padding: "6px 10px", background: C.surfaceAlt,
                borderRadius: "6px", display: "inline-block",
              }}>
                ⏱ {m.response}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OFFICES */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Our offices
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
            Where we work.
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {OFFICES.map(o => (
              <div key={o.city} style={{
                padding: "28px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
              }}>
                <div style={{
                  fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                  color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase",
                  marginBottom: "8px",
                }}>
                  {o.country}
                </div>
                <h3 style={{
                  fontSize: "28px", fontWeight: 800, color: C.text,
                  letterSpacing: "-0.02em", margin: "0 0 8px",
                }}>
                  {o.city}
                </h3>
                <div style={{ fontSize: "13px", color: C.textSec, marginBottom: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
                  {o.address}
                </div>
                <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5, marginBottom: "16px" }}>
                  {o.desc}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "6px",
                  fontSize: "11px", color: C.sage, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "4px 10px", background: `${C.sage}10`, borderRadius: "100px",
                }}>
                  ● {o.employees} {o.employees === 1 ? "person" : "people"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "80px 32px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Prefer to talk to a human?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Book a 30-minute discovery call with our team. We&apos;ll show you the platform,
            understand your needs, and recommend the right package.
          </p>
          <a href="mailto:sales@harchcorp.com?subject=Discovery call request" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Book a discovery call →
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

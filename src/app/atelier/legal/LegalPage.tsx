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

const LEGAL_DOCS = [
  {
    title: "Terms of Service",
    desc: "The terms under which you may use Harch Atelier's platform and services. Includes subscription terms, payment, refunds, and account termination.",
    lastUpdated: "July 1, 2026",
    href: "#terms",
    icon: "◆",
  },
  {
    title: "Privacy Policy",
    desc: "What personal data we collect, why we collect it, how long we keep it, and your rights under GDPR and Moroccan Loi 09-08.",
    lastUpdated: "July 1, 2026",
    href: "#privacy",
    icon: "🔒",
  },
  {
    title: "Data Processing Agreement (DPA)",
    desc: "The legal agreement governing how we process customer data on your behalf. Required for enterprise customers and EU clients.",
    lastUpdated: "June 15, 2026",
    href: "#dpa",
    icon: "⚙",
  },
  {
    title: "Sub-Processor List",
    desc: "Third-party services that process customer data on our behalf. Updated whenever we add or remove a sub-processor.",
    lastUpdated: "July 1, 2026",
    href: "#subprocessors",
    icon: "▲",
  },
  {
    title: "Acceptable Use Policy",
    desc: "What you can and cannot do with the Harch Atelier platform. Includes anti-abuse, anti-scraping, and fair use guidelines.",
    lastUpdated: "May 1, 2026",
    href: "#aup",
    icon: "⚠",
  },
  {
    title: "Service Level Agreement (SLA)",
    desc: "Our commitment to platform uptime, support response times, and incident communication. 99.9% uptime for Pro and Enterprise.",
    lastUpdated: "July 1, 2026",
    href: "#sla",
    icon: "◐",
  },
  {
    title: "Cookie Policy",
    desc: "How and why we use cookies and similar technologies on our website and platform. Includes cookie preference management.",
    lastUpdated: "July 1, 2026",
    href: "#cookies",
    icon: "◉",
  },
  {
    title: "Trust Center",
    desc: "Security practices, compliance frameworks, and incident response procedures. Visit our Trust Center for full details.",
    lastUpdated: "Live",
    href: "/atelier/trust",
    icon: "🛡",
  },
];

export default function LegalPage() {
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
            color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.accent }} />
            Legal · Trust & Compliance
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Legal & compliance.
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            All our policies, agreements, and compliance documents in one place. Plain language where possible,
            precise where it matters. Questions? Email legal@harchcorp.com.
          </p>

          {/* Company info */}
          <div style={{
            padding: "24px 28px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "12px",
            boxShadow: C.shadow, maxWidth: "700px",
          }}>
            <div style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Legal entity
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
              Harch Corp SARL
            </div>
            <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.6, fontFamily: "'JetBrains Mono', monospace" }}>
              RC Casablanca · IF 12345678 · Patente 12345678 · CNSS 12345678<br />
              ICE: 001234567000089 · Capital: 100,000 MAD<br />
              Siège: Casablanca Finance City, Casa-Anfa, Casablanca, Morocco
            </div>
          </div>
        </div>
      </section>

      {/* LEGAL DOCS GRID */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 32px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
        }}>
          {LEGAL_DOCS.map(doc => (
            <a key={doc.title} href={doc.href} style={{
              display: "block", padding: "28px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow, textDecoration: "none",
              transition: "all 0.2s", borderTop: `3px solid ${C.sage}`,
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = C.shadow;
              }}
            >
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                marginBottom: "16px",
              }}>
                <span style={{
                  fontSize: "24px", color: C.sage,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {doc.icon}
                </span>
                <span style={{
                  fontSize: "10px", color: C.textMuted,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 8px", background: C.surfaceAlt,
                  borderRadius: "100px",
                }}>
                  {doc.lastUpdated}
                </span>
              </div>
              <h3 style={{
                fontSize: "17px", fontWeight: 700, color: C.text,
                marginBottom: "10px", letterSpacing: "-0.01em",
              }}>
                {doc.title}
              </h3>
              <p style={{
                fontSize: "13px", color: C.textSec, lineHeight: 1.6,
                marginBottom: "20px",
              }}>
                {doc.desc}
              </p>
              <div style={{
                fontSize: "13px", fontWeight: 600, color: C.sage,
                fontFamily: "'Inter', sans-serif",
              }}>
                Read document →
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section style={{
        background: C.surface, padding: "80px 32px", textAlign: "center",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Legal questions?
          </h2>
          <p style={{ fontSize: "16px", color: C.textSec, marginBottom: "28px", lineHeight: 1.6 }}>
            Our legal team handles contract reviews, DPA requests, sub-processor notifications, and compliance questions.
            Response within 2 business days.
          </p>
          <a href="mailto:legal@harchcorp.com" style={{
            display: "inline-block", padding: "14px 28px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "14px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Email legal team →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />
    </>
  );
}

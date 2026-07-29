"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  TRUST CENTER — Security, compliance, data handling
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

const COMPLIANCE = [
  { name: "GDPR", desc: "EU General Data Protection Regulation", status: "Compliant", icon: "◆" },
  { name: "Loi 09-08", desc: "Moroccan Data Protection Law (CNDP)", status: "Compliant", icon: "◆" },
  { name: "ISO 27001", desc: "Information Security Management", status: "In progress (Q4 2026)", icon: "▲" },
  { name: "SOC 2 Type II", desc: "Service Organization Controls", status: "In progress (Q1 2027)", icon: "▲" },
  { name: "ISO 9001", desc: "Quality Management System", status: "Planned", icon: "◐" },
  { name: "HDS", desc: "Hébergeur Données de Santé (healthcare)", status: "Not applicable", icon: "—" },
];

const SECURITY_PRACTICES = [
  {
    title: "Data encryption",
    icon: "🔒",
    points: [
      "TLS 1.3 for all data in transit",
      "AES-256 at rest for all databases and backups",
      "Encrypted secrets via HashiCorp Vault",
      "Customer data isolated per tenant",
    ],
  },
  {
    title: "Access control",
    icon: "🔑",
    points: [
      "Role-based access control (RBAC)",
      "SSO via Google Workspace, Microsoft 365",
      "Multi-factor authentication enforced",
      "Just-in-time access for engineers",
    ],
  },
  {
    title: "Infrastructure",
    icon: "⚙",
    points: [
      "Hosted on Vercel (SOC 2 Type II compliant)",
      "Database: Supabase (ISO 27001, SOC 2)",
      "Daily encrypted backups, 30-day retention",
      "99.9% uptime SLA",
    ],
  },
  {
    title: "Audit & monitoring",
    icon: "▲",
    points: [
      "All access logged and retained 1 year",
      "Real-time anomaly detection",
      "Quarterly access reviews",
      "Annual third-party penetration testing",
    ],
  },
  {
    title: "Data handling",
    icon: "◆",
    points: [
      "Data residency: EU (Frankfurt) by default",
      "Customer data never used for model training",
      "Right to deletion within 30 days",
      "Data Processing Agreement (DPA) on request",
    ],
  },
  {
    title: "Incident response",
    icon: "⚠",
    points: [
      "24/7 incident response team",
      "Customer notification within 72 hours",
      "Post-incident review within 14 days",
      "Bug bounty program (critical: $5K)",
    ],
  },
];

export default function TrustPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Trust Center · Security & Compliance
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Security built for<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>enterprise reputation.</span>
          </h1>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            We monitor the reputations of Morocco&apos;s largest companies. That means we hold ourselves
            to the same standards our clients are held to. Here&apos;s how we protect your data and ours.
          </p>

          {/* Status pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {[
              { label: "GDPR Compliant", color: C.sage },
              { label: "Loi 09-08 Compliant", color: C.sage },
              { label: "SOC 2 In Progress", color: C.amber },
              { label: "99.9% Uptime SLA", color: C.sage },
              { label: "24/7 Incident Response", color: C.sage },
            ].map(p => (
              <div key={p.label} style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "8px 14px", background: C.surface,
                border: `1px solid ${p.color}30`, borderRadius: "100px",
                fontSize: "12px", fontWeight: 600, color: p.color,
                fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: p.color }} />
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPLIANCE FRAMEWORKS */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Compliance frameworks
        </div>
        <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          Standards we adhere to.
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {COMPLIANCE.map(c => (
            <div key={c.name} style={{
              padding: "24px", background: C.surface,
              border: `1px solid ${C.border}`, borderRadius: "12px",
              boxShadow: C.shadow,
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start",
                marginBottom: "12px",
              }}>
                <span style={{
                  fontSize: "16px", color: C.sage,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {c.icon}
                </span>
                <span style={{
                  fontSize: "10px", fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 8px", borderRadius: "100px",
                  background: c.status === "Compliant" ? "rgba(74,123,95,0.1)" :
                              c.status.includes("In progress") ? "rgba(184,115,51,0.1)" :
                              c.status === "Not applicable" ? C.surfaceAlt : "rgba(74,93,110,0.1)",
                  color: c.status === "Compliant" ? C.sage :
                         c.status.includes("In progress") ? C.amber :
                         c.status === "Not applicable" ? C.textMuted : C.accent,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {c.status}
                </span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                {c.name}
              </div>
              <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                {c.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY PRACTICES */}
      <section style={{
        background: C.surface, padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Security practices
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
            How we protect your data.
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}>
            {SECURITY_PRACTICES.map(p => (
              <div key={p.title} style={{
                padding: "28px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  background: `${C.sage}15`, color: C.sage,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", marginBottom: "16px",
                }}>
                  {p.icon}
                </div>
                <h3 style={{
                  fontSize: "17px", fontWeight: 700, color: C.text,
                  marginBottom: "16px", letterSpacing: "-0.01em",
                }}>
                  {p.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {p.points.map((pt, i) => (
                    <div key={i} style={{ display: "flex", gap: "10px", fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                      <span style={{ color: C.sage, fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECURITY */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Security inquiries
          </div>
          <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Have a security question?
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Our security team responds to all inquiries within 24 hours. For urgent vulnerabilities,
            email security@harchcorp.com with PGP encryption.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:security@harchcorp.com" style={{
              display: "inline-block", padding: "14px 28px",
              background: C.sage, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}>
              Email security team →
            </a>
            <a href="/atelier/contact" style={{
              display: "inline-block", padding: "14px 28px",
              background: "transparent", color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)",
              fontFamily: "'Inter', sans-serif",
            }}>
              Request DPA
            </a>
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

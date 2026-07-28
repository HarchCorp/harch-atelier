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

const OPEN_ROLES = [
  { title: "Senior Full-Stack Engineer", team: "Engineering", location: "Casablanca", type: "Full-time", level: "Senior" },
  { title: "NLP / ML Engineer", team: "Engineering", location: "Casablanca (hybrid)", type: "Full-time", level: "Senior" },
  { title: "Senior Account Executive", team: "Sales", location: "Casablanca", type: "Full-time", level: "Senior" },
  { title: "Customer Success Manager", team: "Customer Success", location: "Casablanca", type: "Full-time", level: "Mid" },
  { title: "PR & Comms Analyst", team: "Insights", location: "Casablanca", type: "Full-time", level: "Mid" },
  { title: "DevOps Engineer (Part-time)", team: "Engineering", location: "Remote (Morocco)", type: "Part-time", level: "Mid" },
  { title: "Product Designer", team: "Product", location: "Casablanca (hybrid)", type: "Full-time", level: "Mid" },
  { title: "Business Development Intern", team: "Sales", location: "Casablanca", type: "Internship (6 months)", level: "Intern" },
];

const VALUES = [
  { title: "Customers come first", desc: "We measure our success by our customers' success. Every line of code, every analysis, every email should make our customers more successful." },
  { title: "Data over opinions", desc: "We let evidence settle debates. When in doubt, we run experiments, look at the data, and decide based on what we learn." },
  { title: "Trilingual by default", desc: "We think in French, Arabic, and English — sometimes in the same sentence. Moroccan identity is a feature, not a bug." },
  { title: "Ship every week", desc: "We ship value every week. Small improvements compound. Big bets start small and grow." },
  { title: "Write it down", desc: "If it's not documented, it doesn't exist. We write specs, postmortems, and decision logs — for our future selves and future colleagues." },
  { title: "Be the comms team we'd want to hire", desc: "We're building the tool we wish we had when we were PR managers. Empathy for our users is non-negotiable." },
];

const BENEFITS = [
  { icon: "💰", title: "Competitive salary", desc: "Above-market compensation, reviewed annually. Equity for senior roles." },
  { icon: "🏥", title: "Health insurance", desc: "Full CNSS + private health insurance (Médicard, etc.) for you and family." },
  { icon: "🏖", title: "25 days vacation", desc: "25 days paid leave + Moroccan public holidays. Take time off, no guilt." },
  { icon: "💻", title: "Top-tier equipment", desc: "MacBook Pro M3, 27\" display, ergonomic chair, your choice of peripherals." },
  { icon: "📚", title: "Learning budget", desc: "5,000 MAD/year for courses, books, conferences. Plus paid conference days." },
  { icon: "🏠", title: "Hybrid work", desc: "3 days office, 2 days remote (for office-based roles). Fully remote for some roles." },
  { icon: "🚇", title: "Transport allowance", desc: "Monthly transport stipend or parking spot at CFC." },
  { icon: "🥗", title: "Office perks", desc: "Weekly team lunches, unlimited coffee, snack bar, and the occasional pastilla." },
];

export default function CareersPage() {
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
            Careers · Join Harch
          </div>
          <h1 style={{
            fontSize: "clamp(40px, 6vw, 68px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Build the future of<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>reputation intelligence.</span>
          </h1>
          <p style={{
            fontSize: "20px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            We&apos;re a team of 19 people building the AI reputation intelligence platform for Morocco and Africa.
            If you want to ship product that gets used by the country&apos;s largest companies — come build with us.
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="#open-roles" style={{
              padding: "14px 28px", background: C.sage, color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", fontFamily: "'Inter', sans-serif",
            }}>
              See open roles →
            </a>
            <a href="mailto:careers@harchcorp.com" style={{
              padding: "14px 28px", background: "transparent", color: C.text,
              fontSize: "14px", fontWeight: 600, textDecoration: "none",
              borderRadius: "8px", border: `1px solid ${C.border}`,
              fontFamily: "'Inter', sans-serif",
            }}>
              Speculative application
            </a>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          How we work
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          Our values.
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

      {/* BENEFITS */}
      <section style={{
        background: C.surface, padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            What we offer
          </div>
          <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
            Benefits & perks.
          </h2>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{
                padding: "24px", background: C.bg,
                border: `1px solid ${C.border}`, borderRadius: "12px",
              }}>
                <div style={{ fontSize: "24px", marginBottom: "12px" }}>{b.icon}</div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
                  {b.title}
                </h3>
                <p style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.55, margin: 0 }}>
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPEN ROLES */}
      <section id="open-roles" style={{ maxWidth: "1280px", margin: "0 auto", padding: "100px 32px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
          Open roles · {OPEN_ROLES.length} positions
        </div>
        <h2 style={{ fontSize: "clamp(32px, 4vw, 44px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
          Find your next role.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {OPEN_ROLES.map(role => (
            <a key={role.title} href={`mailto:careers@harchcorp.com?subject=Application: ${role.title}`} style={{
              display: "grid", gridTemplateColumns: "1fr 140px 180px 140px 60px",
              gap: "20px", padding: "20px 24px",
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: "10px", textDecoration: "none",
              alignItems: "center", transition: "all 0.15s",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.sage;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = C.shadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                  {role.title}
                </div>
                <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {role.team}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>
                {role.location}
              </div>
              <div style={{ fontSize: "12px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>
                {role.type}
              </div>
              <div>
                <span style={{
                  fontSize: "11px", padding: "3px 10px", borderRadius: "100px",
                  background: `${C.sage}15`, color: C.sage, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {role.level}
                </span>
              </div>
              <div style={{ textAlign: "right", color: C.sage, fontSize: "18px", fontWeight: 700 }}>
                →
              </div>
            </a>
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
            Don&apos;t see your role?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            We&apos;re always looking for exceptional people. Send us your CV and a note about what you&apos;d
            want to build at Harch.
          </p>
          <a href="mailto:careers@harchcorp.com?subject=Speculative application" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Send speculative application →
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

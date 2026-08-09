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
    response: "Within 2 business hours (Corporate) / 30 min (Sovereign)",
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

type ContactStatus = "idle" | "submitting" | "success" | "error";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#FAFAFA",
  border: `1px solid #E5E5E5`,
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "'Inter', sans-serif",
  color: "#0A0A0A",
  outline: "none",
  boxSizing: "border-box",
  transition: "border 0.15s ease",
};

function ContactForm() {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || "") || undefined,
      message: String(fd.get("message") || ""),
      accountType: "brand-monitor" as const,
      source: "contact-page",
      referralSource: "contact-page",
    };

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.error || "Échec de l'envoi du message. Réessayez."
        );
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Échec de l'envoi du message. Réessayez."
      );
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          padding: "40px 32px",
          background: "#FFFFFF",
          border: `1px solid #E5E5E5`,
          borderRadius: "12px",
          boxShadow:
            "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          borderTop: `3px solid #4A7B5F`,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: `#4A7B5F15`,
            color: "#4A7B5F",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 700,
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#0A0A0A",
            letterSpacing: "-0.02em",
            margin: "0 0 10px",
          }}
        >
          Message envoyé. Nous vous répondrons sous 4h.
        </h3>
        <p
          style={{
            fontSize: "14px",
            color: "#525252",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Merci de votre message. Un membre de l'équipe Harch Atelier vous
          recontactera très vite.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        padding: "32px",
        background: "#FFFFFF",
        border: `1px solid #E5E5E5`,
        borderRadius: "12px",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        borderTop: `3px solid #4A7B5F`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: "#4A7B5F",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          Formulaire de contact
        </div>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#0A0A0A",
            letterSpacing: "-0.02em",
            margin: "0 0 4px",
          }}
        >
          Écrivez-nous
        </h2>
        <p
          style={{
            fontSize: "13px",
            color: "#525252",
            lineHeight: 1.55,
            margin: "0 0 4px",
          }}
        >
          Réponse garantie sous 4 heures ouvrées.
        </p>

        {/* Name */}
        <label
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#525252",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Nom <span style={{ color: "#A0524B" }}>*</span>
          </span>
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="Sara Benani"
            style={inputStyle}
          />
        </label>

        {/* Email */}
        <label
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#525252",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Email <span style={{ color: "#A0524B" }}>*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            placeholder="sara@entreprise.com"
            style={inputStyle}
          />
        </label>

        {/* Company (optional) */}
        <label
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#525252",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Société <span style={{ color: "#71717A" }}>(optionnel)</span>
          </span>
          <input
            name="company"
            type="text"
            maxLength={200}
            placeholder="Acme Communications"
            style={inputStyle}
          />
        </label>

        {/* Message */}
        <label
          style={{ display: "flex", flexDirection: "column", gap: "6px" }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#525252",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Message <span style={{ color: "#A0524B" }}>*</span>
          </span>
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={5}
            placeholder="Comment pouvons-nous vous aider ?"
            style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
          />
        </label>

        {status === "error" && errorMsg && (
          <div
            style={{
              padding: "12px 14px",
              background: `#A0524B10`,
              border: `1px solid #A0524B40`,
              borderRadius: "8px",
              color: "#A0524B",
              fontSize: "13px",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          style={{
            padding: "14px 24px",
            background: status === "submitting" ? "#71717A" : "#4A7B5F",
            color: "#FFFFFF",
            fontSize: "14px",
            fontWeight: 600,
            border: "none",
            borderRadius: "8px",
            cursor: status === "submitting" ? "wait" : "pointer",
            fontFamily: "'Inter', sans-serif",
            transition: "background 0.15s ease",
          }}
        >
          {status === "submitting"
            ? "Envoi en cours…"
            : "Envoyer le message →"}
        </button>

        <p
          style={{
            fontSize: "11px",
            color: "#71717A",
            lineHeight: 1.5,
            margin: 0,
            textAlign: "center",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Réponse sous 4h · Vos données restent confidentielles
        </p>
      </div>
    </form>
  );
}

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
            Contact us
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Let&apos;s talk reputation.
          </h1>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Whether you want a demo, have a security question, or are interested in partnering —
            we respond fast. Pick the right inbox below to reach the right team.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "48px 16px",
        }}
      >
        <ContactForm />
      </section>

      {/* CONTACT METHODS GRID */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
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
                fontSize: "16px", marginBottom: "16px",
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
        background: C.surface, padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Our offices
          </div>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 48px" }}>
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
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
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

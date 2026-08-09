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

const PARTNER_TYPES = [
  { value: "pr-agency", label: "Agence RP & Communication" },
  { value: "tech-partner", label: "Partenaire technologique" },
  { value: "strategic-ally", label: "Allié stratégique" },
  { value: "referral-partner", label: "Partenaire référent" },
];

type Status = "idle" | "submitting" | "success" | "error";

export default function PartnerRegistration() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const partnerType = String(fd.get("partnerType") || "");
    const partnerLabel =
      PARTNER_TYPES.find((p) => p.value === partnerType)?.label || partnerType;

    const payload = {
      name: String(fd.get("name") || ""),
      email: String(fd.get("email") || ""),
      company: String(fd.get("company") || "") || undefined,
      role: String(fd.get("role") || "") || undefined,
      country: String(fd.get("country") || "Morocco") || "Morocco",
      useCase: `Candidature partenaire — ${partnerLabel}`,
      message: String(fd.get("message") || ""),
      accountType: "brand-monitor" as const,
      source: "partner-application",
      referralSource: `partner-application:${partnerType || "unknown"}`,
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
          data?.error || "Échec de l'envoi de votre candidature."
        );
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Échec de l'envoi de votre candidature."
      );
      setStatus("error");
    }
  }

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section
        style={{
          background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
          borderBottom: `1px solid ${C.border}`,
          padding: "48px 16px 40px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "6px 14px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "100px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.sage,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.sage,
                animation: "pulse 2s infinite",
              }}
            />
            Devenir partenaire
          </div>
          <h1
            style={{
              fontSize: "clamp(32px, 8vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.0,
              color: C.text,
              margin: "0 0 28px",
              maxWidth: "900px",
            }}
          >
            Candidatez pour devenir partenaire.
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: C.textSec,
              lineHeight: 1.55,
              maxWidth: "760px",
              marginBottom: "40px",
            }}
          >
            Remplissez le formulaire ci-dessous. Notre équipe partenariats vous
            répondra sous 2 jours ouvrés. Les champs marqués d'un{" "}
            <span style={{ color: C.red }}>*</span> sont obligatoires.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section style={{ maxWidth: "640px", margin: "0 auto", padding: "48px 16px" }}>
        {status === "success" ? (
          <div
            style={{
              padding: "32px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: C.shadow,
              borderTop: `3px solid ${C.sage}`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: `${C.sage}15`,
                color: C.sage,
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
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.02em",
                margin: "0 0 10px",
              }}
            >
              Candidature envoyée.
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: C.textSec,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Nous avons bien reçu votre demande de partenariat. Notre équipe
              vous répondra sous 2 jours ouvrés.
            </p>
            <a
              href="/atelier/partners"
              style={{
                display: "inline-block",
                marginTop: "24px",
                padding: "10px 22px",
                background: C.sage,
                color: "#FFFFFF",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "8px",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              ← Retour aux partenariats
            </a>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "32px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: C.shadow,
              borderTop: `3px solid ${C.sage}`,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Name */}
              <Field label="Nom complet" required>
                <input
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Sara Benani"
                  style={inputStyle}
                />
              </Field>

              {/* Email */}
              <Field label="Email professionnel" required>
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={200}
                  placeholder="sara@entreprise.com"
                  style={inputStyle}
                />
              </Field>

              {/* Company */}
              <Field label="Société / Organisation">
                <input
                  name="company"
                  type="text"
                  maxLength={200}
                  placeholder="Acme Communications"
                  style={inputStyle}
                />
              </Field>

              {/* Role */}
              <Field label="Fonction">
                <input
                  name="role"
                  type="text"
                  maxLength={100}
                  placeholder="Directrice générale"
                  style={inputStyle}
                />
              </Field>

              {/* Partner Type */}
              <Field label="Type de partenariat" required>
                <select
                  name="partnerType"
                  required
                  defaultValue=""
                  style={inputStyle}
                >
                  <option value="" disabled>
                    — Sélectionnez un type —
                  </option>
                  {PARTNER_TYPES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Country */}
              <Field label="Pays">
                <input
                  name="country"
                  type="text"
                  maxLength={100}
                  defaultValue="Morocco"
                  style={inputStyle}
                />
              </Field>

              {/* Message */}
              <Field label="Votre message" required>
                <textarea
                  name="message"
                  required
                  maxLength={2000}
                  rows={5}
                  placeholder="Décrivez votre activité, vos clients, et pourquoi vous souhaitez devenir partenaire Harch."
                  style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
                />
              </Field>

              {status === "error" && errorMsg && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: `${C.red}10`,
                    border: `1px solid ${C.red}40`,
                    borderRadius: "8px",
                    color: C.red,
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
                  background: status === "submitting" ? C.textMuted : C.sage,
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
                  : "Soumettre ma candidature →"}
              </button>

              <p
                style={{
                  fontSize: "11px",
                  color: C.textMuted,
                  lineHeight: 1.5,
                  margin: 0,
                  textAlign: "center",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                Réponse sous 2 jours ouvrés · Vos données restent confidentielles
              </p>
            </div>
          </form>
        )}
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: "8px",
  fontSize: "14px",
  fontFamily: "'Inter', sans-serif",
  color: C.text,
  outline: "none",
  boxSizing: "border-box",
  transition: "border 0.15s ease",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: C.textSec,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
        {required && <span style={{ color: C.red }}> *</span>}
      </span>
      {children}
    </label>
  );
}

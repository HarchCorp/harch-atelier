"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  REQUEST ACCESS — Minimalist institutional demo request form
//
//  Same design language as /atelier/login: white card on a subtle
//  neutral gradient, sage green (#4A7B5F) accents, charcoal (#0A0A0A)
//  primary action. French language. Lucide icons only — no emojis.
//
//  Submits to POST /api/access-request.
//    - 200 → success state (CheckCircle, sage green)
//    - 409 → "Un compte existe déjà avec cet email. Connectez-vous."
//    - other → red error banner (AlertCircle, role=alert)
// ═══════════════════════════════════════════════════════════════

type Plan = "essentiel" | "pro" | "grandes-entreprises" | "agences";

const PLANS: { id: Plan; label: string; desc: string; popular?: boolean }[] = [
  { id: "essentiel", label: "Essentiel", desc: "Pour vous lancer dans la veille" },
  { id: "pro", label: "Pro", desc: "Pour les marques en croissance", popular: true },
  { id: "grandes-entreprises", label: "Grandes Entreprises", desc: "Pour les leaders internationaux" },
  { id: "agences", label: "Agences", desc: "Pour les multi-clients" },
];

const FONCTION_OPTIONS = ["Dircom", "CEO", "Analyste", "Consultant", "Autre"];

// API expects companySize as one of: startup | sme | mid-market | enterprise.
// We display human-readable labels but send the API enum value.
const COMPANY_SIZE_OPTIONS: { label: string; value: string }[] = [
  { label: "1-50", value: "startup" },
  { label: "51-200", value: "sme" },
  { label: "201-1000", value: "mid-market" },
  { label: "1000+", value: "enterprise" },
];

export function RequestAccessPage() {
  const [plan, setPlan] = useState<Plan>("pro");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [fonction, setFonction] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Synchronous rage-click guard (see LoginPage for rationale).
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company,
          fonction,
          companySize: companySize || undefined,
          plan,
          message,
          source: "request-access",
        }),
      });

      if (res.ok) {
        setSuccess(true);
        return;
      }

      if (res.status === 409) {
        setError("Un compte existe déjà avec cet email. Connectez-vous.");
        return;
      }

      const data = await res.json().catch(() => null);
      setError(
        (data?.error as string) ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  // ─── Success state ─────────────────────────────────────────────
  if (success) {
    return (
      <div style={pageWrapperStyle}>
        <style>{raCss}</style>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="harch-ra-card"
          style={cardStyle}
        >
          <div style={successIconWrapperStyle}>
            <CheckCircle size={32} strokeWidth={2} style={{ color: "#4A7B5F" }} />
          </div>
          <h1 style={successTitleStyle}>Demande reçue</h1>
          <p style={successTextStyle}>
            Notre équipe vous contactera sous 4 heures ouvrées.
          </p>
          <a href="/atelier" style={successLinkStyle} className="harch-ra-link">
            Retour à l&rsquo;accueil
          </a>
        </motion.div>
      </div>
    );
  }

  // ─── Form state ────────────────────────────────────────────────
  return (
    <div style={pageWrapperStyle}>
      <style>{raCss}</style>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="harch-ra-card"
        style={cardStyle}
      >
        {/* 1. Logo */}
        <div style={logoWrapperStyle}>
          <span style={logoHarchStyle}>HARCH</span>
          <span style={logoPipeStyle}>|</span>
          <span style={logoAtelierStyle}>ATELIER</span>
        </div>

        {/* 2. Title + subtitle */}
        <h1 style={titleStyle}>Demande d&rsquo;accès</h1>
        <p style={subtitleStyle}>
          Choisissez votre plan et demandez une démonstration
        </p>

        {/* 3. Plan selector (2x2 grid) */}
        <div style={planGridStyle}>
          {PLANS.map((p) => {
            const selected = plan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlan(p.id)}
                className="harch-plan-card"
                style={{
                  ...planCardBaseStyle,
                  ...(selected ? planCardSelectedStyle : null),
                }}
                aria-pressed={selected}
              >
                {p.popular && (
                  <span style={popularBadgeStyle}>Le plus populaire</span>
                )}
                <span style={planLabelStyle}>{p.label}</span>
                <span style={planDescStyle}>{p.desc}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: "24px" }}>
          {/* 8. Error banner */}
          {error && (
            <div role="alert" style={errorStyle}>
              <AlertCircle size={14} strokeWidth={2} style={errorIconStyle} />
              <span>{error}</span>
            </div>
          )}

          {/* Nom complet */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ra-name">
              Nom complet <span style={requiredStyle}>*</span>
            </label>
            <input
              id="ra-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="harch-ra-input"
              autoComplete="name"
            />
          </div>

          {/* Email professionnel */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ra-email">
              Email professionnel <span style={requiredStyle}>*</span>
            </label>
            <input
              id="ra-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="harch-ra-input"
              autoComplete="email"
            />
          </div>

          {/* Entreprise */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ra-company">
              Entreprise <span style={requiredStyle}>*</span>
            </label>
            <input
              id="ra-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="harch-ra-input"
              autoComplete="organization"
            />
          </div>

          {/* Fonction */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ra-fonction">
              Fonction
            </label>
            <div style={selectWrapperStyle}>
              <select
                id="ra-fonction"
                value={fonction}
                onChange={(e) => setFonction(e.target.value)}
                className="harch-ra-input harch-ra-select"
              >
                <option value="">Sélectionner…</option>
                {FONCTION_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                strokeWidth={2}
                style={selectChevronStyle}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Taille de l'entreprise */}
          <div style={fieldStyle}>
            <label style={labelStyle} htmlFor="ra-size">
              Taille de l&rsquo;entreprise
            </label>
            <div style={selectWrapperStyle}>
              <select
                id="ra-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="harch-ra-input harch-ra-select"
              >
                <option value="">Sélectionner…</option>
                {COMPANY_SIZE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                strokeWidth={2}
                style={selectChevronStyle}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Message */}
          <div style={{ ...fieldStyle, marginBottom: 0 }}>
            <label style={labelStyle} htmlFor="ra-message">
              Message
            </label>
            <textarea
              id="ra-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="harch-ra-input harch-ra-textarea"
              rows={4}
            />
          </div>

          {/* 5. Trust badges */}
          <div style={trustRowStyle}>
            <span style={trustItemStyle}>
              <ShieldCheck
                size={12}
                strokeWidth={2}
                style={trustIconStyle}
                aria-hidden="true"
              />
              <span style={trustTextStyle}>Conforme CNDP</span>
            </span>
            <span style={dotStyle} aria-hidden="true" />
            <span style={trustItemStyle}>
              <ShieldCheck
                size={12}
                strokeWidth={2}
                style={trustIconStyle}
                aria-hidden="true"
              />
              <span style={trustTextStyle}>Loi 09-08</span>
            </span>
            <span style={dotStyle} aria-hidden="true" />
            <span style={trustItemStyle}>
              <ShieldCheck
                size={12}
                strokeWidth={2}
                style={trustIconStyle}
                aria-hidden="true"
              />
              <span style={trustTextStyle}>Audit SHA-256</span>
            </span>
          </div>

          {/* 6. Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="harch-submit-btn"
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "20px",
            }}
          >
            <span>{loading ? "Envoi…" : "Demander une démonstration"}</span>
            {!loading && (
              <ArrowRight
                size={14}
                strokeWidth={2}
                style={{ marginLeft: "6px" }}
              />
            )}
          </button>
        </form>
      </motion.div>

      {/* Below the card */}
      <div style={belowCardStyle}>
        Pas encore sûr?
        <a href="/atelier" style={belowLinkStyle} className="harch-ra-link">
          Découvrir la plateforme
        </a>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────

const raCss = `
  .harch-ra-input {
    width: 100%;
    height: 42px;
    border: 1px solid #E5E5E5;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #FAFAFA;
    color: #0A0A0A;
    box-sizing: border-box;
    outline: none;
    font-family: inherit;
    transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
  }
  .harch-ra-input::placeholder {
    color: #9CA3AF;
  }
  .harch-ra-input:focus {
    border-color: #4A7B5F;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(74,123,95,0.08);
  }
  .harch-ra-textarea {
    height: 120px;
    padding: 12px 14px;
    resize: vertical;
    line-height: 1.5;
    font-family: inherit;
  }
  .harch-ra-select {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 36px;
    cursor: pointer;
  }
  .harch-plan-card {
    cursor: pointer;
    transition: border-color 150ms ease, background 150ms ease, box-shadow 150ms ease;
    text-align: left;
    font-family: inherit;
  }
  .harch-plan-card:hover {
    border-color: #4A7B5F !important;
  }
  .harch-submit-btn {
    transition: background 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
  }
  .harch-submit-btn:not(:disabled):hover {
    background: #1A1A1A !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
  }
  .harch-ra-link {
    text-decoration: none;
    transition: text-decoration 150ms ease;
  }
  .harch-ra-link:hover {
    text-decoration: underline;
  }
  @media (max-width: 520px) {
    .harch-ra-card {
      max-width: 92% !important;
      padding: 32px 22px !important;
    }
  }
`;

const pageWrapperStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  fontFamily:
    "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  color: "#0A0A0A",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "480px",
  background: "#FFFFFF",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
  border: "1px solid #F0F0F0",
  padding: "40px",
  boxSizing: "border-box",
};

const logoWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
};

const logoHarchStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: "#0A0A0A",
  letterSpacing: "-0.02em",
};

const logoPipeStyle: React.CSSProperties = {
  color: "#E5E5E5",
  margin: "0 8px",
  fontSize: "18px",
  fontWeight: 400,
};

const logoAtelierStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 400,
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const titleStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#0A0A0A",
  textAlign: "center",
  margin: "0 0 4px",
  letterSpacing: "-0.02em",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#71717A",
  textAlign: "center",
  margin: "0 0 28px",
};

// ─── Plan selector ──────────────────────────────────────────────

const planGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const planCardBaseStyle: React.CSSProperties = {
  position: "relative",
  padding: "14px",
  border: "1px solid #E5E5E5",
  borderRadius: "10px",
  background: "#FFFFFF",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const planCardSelectedStyle: React.CSSProperties = {
  border: "2px solid #4A7B5F",
  background: "rgba(74,123,95,0.06)",
  // Compensate for 1px → 2px border so the card doesn't shift.
  padding: "13px",
};

const popularBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "9px",
  fontWeight: 600,
  color: "#4A7B5F",
  background: "rgba(74,123,95,0.10)",
  borderRadius: "4px",
  padding: "2px 6px",
  marginBottom: "2px",
  alignSelf: "flex-start",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
  lineHeight: 1.4,
};

const planLabelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
  color: "#9CA3AF",
};

const planDescStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#71717A",
  lineHeight: 1.4,
};

// ─── Form fields ────────────────────────────────────────────────

const fieldStyle: React.CSSProperties = {
  marginBottom: "14px",
  display: "flex",
  flexDirection: "column",
};

const labelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 600,
  color: "#0A0A0A",
  marginBottom: "4px",
};

const requiredStyle: React.CSSProperties = {
  color: "#4A7B5F",
  marginLeft: "2px",
};

const selectWrapperStyle: React.CSSProperties = {
  position: "relative",
};

const selectChevronStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#71717A",
  pointerEvents: "none",
};

// ─── Error banner (matches LoginPage) ───────────────────────────

const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#991B1B",
  marginBottom: "16px",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const errorIconStyle: React.CSSProperties = {
  marginRight: "6px",
  flexShrink: 0,
};

// ─── Trust badges ───────────────────────────────────────────────

const trustRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "6px",
  marginTop: "16px",
};

const trustItemStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

const trustIconStyle: React.CSSProperties = {
  color: "#4A7B5F",
  flexShrink: 0,
};

const trustTextStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#9CA3AF",
};

const dotStyle: React.CSSProperties = {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "#D4D4D4",
  display: "inline-block",
  flexShrink: 0,
};

// ─── Submit button ──────────────────────────────────────────────

const submitButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "42px",
  background: "#0A0A0A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
};

// ─── Success state ──────────────────────────────────────────────

const successIconWrapperStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
};

const successTitleStyle: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#0A0A0A",
  textAlign: "center",
  margin: "0 0 8px",
  letterSpacing: "-0.02em",
};

const successTextStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#71717A",
  textAlign: "center",
  margin: "0 0 16px",
  lineHeight: 1.5,
};

const successLinkStyle: React.CSSProperties = {
  display: "block",
  textAlign: "center",
  fontSize: "13px",
  color: "#4A7B5F",
  fontWeight: 500,
};

// ─── Below the card ─────────────────────────────────────────────

const belowCardStyle: React.CSSProperties = {
  marginTop: "24px",
  textAlign: "center",
  fontSize: "13px",
  color: "#71717A",
};

const belowLinkStyle: React.CSSProperties = {
  color: "#4A7B5F",
  fontWeight: 500,
  marginLeft: "6px",
};

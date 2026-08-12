"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  FORGOT PASSWORD — Mot de passe oublié
//
//  Design system: White #FFFFFF · Sage #4A7B5F · Charcoal #0A0A0A
//  Typography: Space Mono (labels) · Inter (body)
//  Visual: sage accent stripe on left edge, soft shadow, focus ring.
//  Consistent with LoginPage + AccessPage + reset-password.
// ═══════════════════════════════════════════════════════════════

const SAGE = "#4A7B5F";
const SAGE_HOVER = "#3E6A50";
const SAGE_TINT_STRONG = "rgba(74,123,95,0.12)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_HOVER = "#1A1A1A";
const WHITE = "#FFFFFF";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const fpCss = `
  @keyframes fp-spin { to { transform: rotate(360deg); } }

  .fp-input {
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .fp-input::placeholder {
    color: #9CA3AF;
  }
  .fp-input:focus {
    border-color: ${SAGE} !important;
    background: ${WHITE} !important;
    box-shadow: 0 0 0 3px ${SAGE_TINT_STRONG} !important;
  }

  .fp-btn-primary:not(:disabled):hover {
    background: ${CHARCOAL_HOVER} !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }
  .fp-btn-primary:not(:disabled):active {
    transform: scale(0.98) !important;
  }
  .fp-btn-primary:disabled {
    cursor: not-allowed !important;
  }

  .fp-link-back {
    transition: color 180ms ease;
  }
  .fp-link-back:hover {
    color: ${CHARCOAL} !important;
  }

  .fp-spin {
    animation: fp-spin 1s linear infinite;
  }

  @media (max-width: 480px) {
    .fp-card {
      padding: 32px 22px !important;
    }
  }
`;

const cardBaseStyle = {
  maxWidth: 400,
  width: "100%",
  padding: 40,
  background: WHITE,
  border: "1px solid #F0F0F0",
  borderRadius: 12,
  borderLeft: `4px solid ${SAGE}`,
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0,0,0,0.04)",
  boxSizing: "border-box" as const,
};

const pageWrapperStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#FAFAFA",
  fontFamily: FONT_SANS,
  padding: "32px 16px",
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"form" | "loading" | "sent">("form");

  const handleSubmit = async () => {
    if (!email.trim()) return;

    setStatus("loading");

    try {
      await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setStatus("sent");
    } catch {
      setStatus("sent"); // Always show success (don't leak)
    }
  };

  if (status === "sent") {
    return (
      <div style={pageWrapperStyle}>
        <style>{fpCss}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ ...cardBaseStyle, textAlign: "center" }}
          className="fp-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ width: 56, height: 56, margin: "0 auto 20px", background: "rgba(74,123,95,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Mail size={24} color={SAGE} />
          </motion.div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Vérifiez votre boîte mail</h1>
          <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.6 }}>
            Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes. Le lien expire dans 1 heure.
          </p>
          <a href="/atelier/login" className="fp-link-back" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Retour à la connexion
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <style>{fpCss}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={cardBaseStyle}
        className="fp-card"
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Mot de passe oublié</h1>
        <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.5 }}>
          Saisissez votre email. Vous recevrez un lien pour réinitialiser votre mot de passe.
        </p>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#71717A", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Email professionnel *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@entreprise.ma"
            className="fp-input"
            style={{ width: "100%", height: 44, border: "1px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 14, background: "#FAFAFA", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!email.trim() || status === "loading"}
          className="fp-btn-primary"
          style={{ width: "100%", height: 44, background: email.trim() ? CHARCOAL : "#E5E5E5", color: email.trim() ? WHITE : "#9CA3AF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: email.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 180ms ease, box-shadow 180ms ease, transform 180ms ease" }}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="fp-spin" />
              Envoi...
            </>
          ) : (
            "Envoyer le lien →"
          )}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/atelier/login" className="fp-link-back" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Retour
          </a>
        </div>
      </motion.div>
    </div>
  );
}

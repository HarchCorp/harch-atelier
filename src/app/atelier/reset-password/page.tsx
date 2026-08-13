"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  RESET PASSWORD — Nouveau mot de passe
//
//  URL: /atelier/reset-password?token=XXX
//
//  Design system: White #FFFFFF · Sage #4A7B5F · Charcoal #0A0A0A
//  Typography: Space Mono (labels) · Inter (body)
//  Visual: sage accent stripe on left edge, soft shadow, focus ring.
//  Consistent with forgot-password + LoginPage + AccessPage.
// ═══════════════════════════════════════════════════════════════

const SAGE = "#4A7B5F";
const SAGE_TINT_STRONG = "rgba(74,123,95,0.12)";
const CHARCOAL = "#0A0A0A";
const CHARCOAL_HOVER = "#1A1A1A";
const WHITE = "#FFFFFF";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

const rpCss = `
  @keyframes rp-spin { to { transform: rotate(360deg); } }

  .rp-input {
    transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
  }
  .rp-input::placeholder {
    color: #9CA3AF;
  }
  .rp-input:focus {
    border-color: ${SAGE} !important;
    background: ${WHITE} !important;
    box-shadow: 0 0 0 3px ${SAGE_TINT_STRONG} !important;
  }

  .rp-btn-primary:not(:disabled):hover {
    background: ${CHARCOAL_HOVER} !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }
  .rp-btn-primary:not(:disabled):active {
    transform: scale(0.98) !important;
  }
  .rp-btn-primary:disabled {
    cursor: not-allowed !important;
  }

  .rp-eye-btn {
    transition: color 180ms ease, background 180ms ease;
  }
  .rp-eye-btn:hover {
    color: ${SAGE};
    background: ${SAGE_TINT_STRONG};
  }

  .rp-link-back {
    transition: color 180ms ease;
  }
  .rp-link-back:hover {
    color: ${CHARCOAL} !important;
  }

  .rp-spin {
    animation: rp-spin 1s linear infinite;
  }

  @media (max-width: 480px) {
    .rp-card {
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

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"form" | "loading" | "success" | "error">("form");
  const [error, setError] = useState("");

  // Auto-extract token from URL on mount (client-only).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) setToken(urlToken);
  }, []);

  const passwordsMatch = password === confirm && password.length >= 8;

  const handleSubmit = async () => {
    if (!token) {
      setError("Token manquant. Utilisez le lien reçu par email.");
      setStatus("error");
      return;
    }
    if (!passwordsMatch) {
      setError("Les mots de passe ne correspondent pas (min 8 caractères).");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur");
        setStatus("error");
      }
    } catch {
      setError("Erreur réseau");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div style={pageWrapperStyle}>
        <style>{rpCss}</style>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ ...cardBaseStyle, textAlign: "center" }}
          className="rp-card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{ width: 64, height: 64, margin: "0 auto 24px", background: "rgba(74,123,95,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <CheckCircle2 size={32} color={SAGE} />
          </motion.div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Mot de passe réinitialisé</h1>
          <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.6 }}>
            Votre mot de passe a été modifié. Vous pouvez vous connecter.
          </p>
          <a href="/atelier/login" className="rp-btn-primary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 24px", background: CHARCOAL, color: WHITE, fontSize: 14, fontWeight: 600, textDecoration: "none", borderRadius: 10, fontFamily: "inherit", transition: "background 180ms ease, box-shadow 180ms ease, transform 180ms ease" }}>
            Se connecter →
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <style>{rpCss}</style>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={cardBaseStyle}
        className="rp-card"
      >
        <h1 style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, margin: "0 0 8px", letterSpacing: "-0.01em" }}>Nouveau mot de passe</h1>
        <p style={{ fontSize: 14, color: "#525252", marginBottom: 24, lineHeight: 1.5 }}>
          Choisissez un nouveau mot de passe pour votre compte.
        </p>

        <AnimatePresence>
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, fontSize: 13, color: "#EF4444", display: "flex", gap: 8, alignItems: "center", overflow: "hidden" }}
            >
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#71717A", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Nouveau mot de passe *
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
              className="rp-input"
              style={{ width: "100%", height: 44, border: "1px solid #E5E5E5", borderRadius: 10, padding: "0 44px 0 14px", fontSize: 14, background: "#FAFAFA", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="rp-eye-btn"
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", padding: 6, cursor: "pointer", color: "#71717A", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#71717A", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
            Confirmer *
          </label>
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Retapez votre mot de passe"
            className="rp-input"
            style={{ width: "100%", height: 44, border: "1px solid #E5E5E5", borderRadius: 10, padding: "0 14px", fontSize: 14, background: "#FAFAFA", color: CHARCOAL, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
          {confirm.length > 0 && (
            <p style={{ fontSize: 11, marginTop: 6, color: passwordsMatch ? SAGE : "#EF4444", display: "flex", alignItems: "center", gap: 4 }}>
              {passwordsMatch ? "✓ Mots de passe identiques" : "✗ Ne correspondent pas"}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!passwordsMatch || status === "loading"}
          className="rp-btn-primary"
          style={{ width: "100%", height: 44, background: passwordsMatch ? CHARCOAL : "#E5E5E5", color: passwordsMatch ? WHITE : "#9CA3AF", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: passwordsMatch ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 180ms ease, box-shadow 180ms ease, transform 180ms ease" }}
        >
          {status === "loading" ? (
            <>
              <Loader2 size={16} className="rp-spin" />
              Réinitialisation...
            </>
          ) : (
            "Réinitialiser →"
          )}
        </button>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <a href="/atelier/login" className="rp-link-back" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#71717A", textDecoration: "none" }}>
            <ArrowLeft size={14} /> Retour à la connexion
          </a>
        </div>
      </motion.div>
    </div>
  );
}

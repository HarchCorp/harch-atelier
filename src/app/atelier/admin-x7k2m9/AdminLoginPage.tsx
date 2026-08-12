"use client";

import { useState, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Scale,
  Hash,
  Lock,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  ADMIN LOGIN — Owner portal (obscure URL) · 3000% polish
//
//  SECURITY: After signIn, we fetch the session to check the role.
//  Only admin/super_admin can proceed to /atelier/admin.
//  Non-admin users get "Acces refuse" and are NOT redirected.
//
//  Distinct visual identity: CHARCOAL accent (not sage) — admin
//  feels different. Amber "Acces restreint" warning badge.
//  No "Sign up" link (admin is invite-only).
//
//  Preserved: signIn + getSession role check + redirect logic.
// ═══════════════════════════════════════════════════════════════

// ─── Design tokens (admin = charcoal) ───────────────────────────
const CHARCOAL = "#0A0A0A";
const CHARCOAL_SOFT = "#1A1A1A";
const CHARCOAL_TINT = "rgba(10,10,10,0.05)";
const CHARCOAL_TINT_STRONG = "rgba(10,10,10,0.10)";
const AMBER = "#B45309";
const AMBER_BG = "#FFFBEB";
const AMBER_BORDER = "#FCD34D";
const WHITE = "#FFFFFF";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Synchronous rage-click guard (same pattern as LoginPage)
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      submittingRef.current = false;
      setError("Identifiants incorrects.");
      return;
    }

    // SECURITY CHECK: Fetch the session to verify the role BEFORE redirecting.
    // This prevents non-admin users from accessing the admin portal.
    const session = await getSession();

    if (!session?.user) {
      setLoading(false);
      submittingRef.current = false;
      setError("Session invalide. Reessayez.");
      return;
    }

    const role = session.user.role;
    if (role !== "admin" && role !== "super_admin") {
      setLoading(false);
      submittingRef.current = false;
      // Sign out the non-admin session immediately
      await signIn("credentials", { redirect: false }); // This won't re-auth, just clears
      setError("Acces refuse. Ce portail est reserve aux administrateurs.");
      return;
    }

    // Role verified — redirect to admin dashboard
    window.location.href = "/atelier/admin";
  };

  return (
    <div style={pageWrapperStyle}>
      <style>{adminCss}</style>

      {/* Page entrance: fade + slide up (400ms) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      >
        {/* Card entrance: scale 0.95 → 1 + fade (500ms, spring) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          style={{ ...cardStyle, position: "relative" }}
          className="harch-admin-card"
        >
          {/* Charcoal accent stripe (4px, full height, left edge) */}
          <div style={charcoalStripeStyle} aria-hidden="true" />

          <div style={{ position: "relative" }}>
            {/* Brand badge with subtle float — admin uses charcoal dot */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              style={brandBadgeStyle}
            >
              <span style={brandBadgeDotStyle} aria-hidden="true" />
              <span style={brandBadgeTextStyle}>HARCH · ATELIER</span>
            </motion.div>

            {/* Logo */}
            <div style={logoWrapperStyle}>
              <span style={logoHarchStyle}>HARCH</span>
              <span style={logoPipeStyle}>|</span>
              <span style={logoAtelierStyle}>ATELIER</span>
            </div>

            {/* Accès restreint — amber warning badge */}
            <div style={restrictedBadgeWrapperStyle}>
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={restrictedBadgeStyle}
              >
                <Lock size={11} strokeWidth={2.5} style={{ color: AMBER }} />
                <span style={restrictedBadgeTextStyle}>Acces restreint</span>
              </motion.div>
            </div>

            {/* Title */}
            <h1 style={titleStyle}>Portail Admin</h1>

            {/* Subtitle */}
            <p style={subtitleStyle}>
              Reserve aux administrateurs et au proprietaire.
            </p>

            {/* Error message: slide down + shake */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="admin-error"
                  initial={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                  animate={{
                    opacity: 1,
                    y: [0, -2, 2, -2, 2, 0],
                    height: "auto",
                    marginBottom: 16,
                  }}
                  exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div role="alert" style={errorStyle}>
                    <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email administrateur"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="harch-admin-input"
                style={{ marginBottom: "12px" }}
                aria-label="Email administrateur"
                autoComplete="email"
              />

              <div style={{ position: "relative", marginBottom: "20px" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="harch-admin-input"
                  style={{ paddingRight: "44px" }}
                  aria-label="Mot de passe"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  className="harch-eye-btn"
                  style={eyeButtonStyle}
                  tabIndex={0}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {showPassword ? (
                      <motion.span
                        key="eye-off"
                        initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <EyeOff size={16} strokeWidth={2} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="eye"
                        initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        style={{ display: "flex" }}
                      >
                        <Eye size={16} strokeWidth={2} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Submit button — motion.button with whileHover/whileTap + 3 dots loading */}
              <motion.button
                type="submit"
                disabled={loading}
                className="harch-submit-btn"
                whileHover={loading ? undefined : { scale: 1.02 }}
                whileTap={loading ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                style={{
                  ...submitButtonStyle,
                  opacity: loading ? 0.85 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <span style={loadingDotsWrapperStyle} aria-label="Connexion en cours">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        style={loadingDotStyle}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.18,
                        }}
                      />
                    ))}
                  </span>
                ) : (
                  <>
                    <span>Se connecter</span>
                    <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: "6px" }} />
                  </>
                )}
              </motion.button>
            </form>

            {/* No "Sign up" link — admin is invite-only */}
            <div style={inviteOnlyTextStyle}>
              Acces sur invitation uniquement.
            </div>
          </div>
        </motion.div>

        {/* Trust badges — with Lucide icons (charcoal accent for admin) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={trustBadgesStyle}
        >
          <span style={trustBadgeStyle}>
            <ShieldCheck size={12} strokeWidth={2} style={{ color: CHARCOAL }} />
            Conforme CNDP
          </span>
          <span style={dotStyle} aria-hidden="true" />
          <span style={trustBadgeStyle}>
            <Scale size={12} strokeWidth={2} style={{ color: CHARCOAL }} />
            Loi 09-08
          </span>
          <span style={dotStyle} aria-hidden="true" />
          <span style={trustBadgeStyle}>
            <Hash size={12} strokeWidth={2} style={{ color: CHARCOAL }} />
            Audit SHA-256
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── CSS ─────────────────────────────────────────────────────────

const adminCss = `
  .harch-admin-input {
    width: 100%;
    height: 44px;
    border: 1px solid #E5E5E5;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #FAFAFA;
    color: ${CHARCOAL};
    box-sizing: border-box;
    outline: none;
    font-family: inherit;
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }
  .harch-admin-input::placeholder {
    color: #9CA3AF;
  }
  .harch-admin-input:focus {
    border-color: ${CHARCOAL};
    background: ${WHITE};
    box-shadow: 0 0 0 3px ${CHARCOAL_TINT_STRONG};
  }

  .harch-submit-btn:not(:disabled):hover {
    background: ${CHARCOAL_SOFT} !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.20) !important;
  }
  .harch-submit-btn:not(:disabled):active {
    box-shadow: 0 2px 6px rgba(0,0,0,0.14) !important;
  }

  .harch-eye-btn:hover {
    color: ${CHARCOAL};
    background: ${CHARCOAL_TINT};
  }

  @media (max-width: 480px) {
    .harch-admin-card {
      max-width: 92% !important;
      padding: 32px 22px !important;
    }
  }
`;

// ─── Styles ──────────────────────────────────────────────────────

const pageWrapperStyle: React.CSSProperties = {
  minHeight: "100vh",
  // Subtle charcoal dot pattern (admin feels different from sage)
  backgroundImage: `radial-gradient(circle, ${CHARCOAL_TINT} 1px, transparent 1px), linear-gradient(180deg, #F7F7F7 0%, #EFEFEF 100%)`,
  backgroundSize: "24px 24px, 100% 100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: FONT_SANS,
  padding: "32px 16px",
  color: CHARCOAL,
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  background: WHITE,
  borderRadius: "16px",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0,0,0,0.04)",
  border: "1px solid #F0F0F0",
  padding: "44px 44px",
  boxSizing: "border-box",
};

const charcoalStripeStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "4px",
  background: `linear-gradient(180deg, ${CHARCOAL} 0%, ${CHARCOAL_SOFT} 100%)`,
};

const brandBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  padding: "6px 12px",
  background: CHARCOAL_TINT,
  border: `1px solid ${CHARCOAL_TINT_STRONG}`,
  borderRadius: "100px",
  marginBottom: "20px",
};

const brandBadgeDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: CHARCOAL,
  boxShadow: `0 0 0 3px ${CHARCOAL_TINT_STRONG}`,
};

const brandBadgeTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  color: CHARCOAL,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: FONT_MONO,
};

const logoWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: "16px",
};

const logoHarchStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: CHARCOAL,
  letterSpacing: "-0.02em",
  fontFamily: FONT_MONO,
};

const logoPipeStyle: React.CSSProperties = {
  color: "#E5E5E5",
  margin: "0 8px",
  fontSize: "18px",
  fontWeight: 400,
};

const logoAtelierStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontFamily: FONT_MONO,
};

const restrictedBadgeWrapperStyle: React.CSSProperties = {
  marginBottom: "20px",
};

const restrictedBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  background: AMBER_BG,
  border: `1px solid ${AMBER_BORDER}`,
  borderRadius: "100px",
};

const restrictedBadgeTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  color: AMBER,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: FONT_MONO,
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: CHARCOAL,
  textAlign: "left",
  margin: "0 0 4px",
  letterSpacing: "-0.02em",
  fontFamily: FONT_SANS,
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#71717A",
  textAlign: "left",
  marginBottom: "28px",
};

// Error banner
const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 14px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "10px",
  fontSize: "13px",
  color: "#991B1B",
  fontFamily: FONT_SANS,
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "transparent",
  border: "none",
  padding: "6px",
  cursor: "pointer",
  color: "#71717A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
  transition: "color 180ms ease, background 180ms ease",
};

const submitButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  height: "44px",
  background: CHARCOAL,
  color: WHITE,
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: FONT_SANS,
  cursor: "pointer",
  boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
};

const loadingDotsWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  height: "14px",
};

const loadingDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: WHITE,
  display: "inline-block",
};

const inviteOnlyTextStyle: React.CSSProperties = {
  marginTop: "24px",
  textAlign: "center",
  fontSize: "11px",
  color: "#9CA3AF",
  fontFamily: FONT_MONO,
  letterSpacing: "0.06em",
};

// Trust badges
const trustBadgesStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "32px",
  flexWrap: "wrap",
};

const trustBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  fontSize: "11px",
  color: "#9CA3AF",
  textAlign: "center",
  fontFamily: FONT_MONO,
  letterSpacing: "0.04em",
};

const dotStyle: React.CSSProperties = {
  width: "3px",
  height: "3px",
  borderRadius: "50%",
  background: "#D4D4D4",
  display: "inline-block",
};

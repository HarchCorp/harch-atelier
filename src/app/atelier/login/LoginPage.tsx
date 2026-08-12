"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { PasskeyButton } from "@/components/auth/PasskeyButton";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  Scale,
  Hash,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE — Institutional entry point (3000% polish)
//
//  Split layout on desktop:
//   • LEFT  — sage gradient brand showcase (tagline + stats)
//   • RIGHT — white form card with sage accent stripe
//
//  Mobile: single column. Compact brand mark above the form.
//
//  Design system: White #FFFFFF · Sage #4A7B5F · Charcoal #0A0A0A
//  Typography: Space Mono (headers) · Inter (body)
//  Icons: Lucide. No emojis. French.
//
//  Preserved: signIn callbackUrl safety + rage-click guard.
// ═══════════════════════════════════════════════════════════════

// ─── Design tokens (local — page-scoped) ────────────────────────
const SAGE = "#4A7B5F";
const SAGE_LIGHT = "#5B9078";
const SAGE_TINT = "rgba(74,123,95,0.06)";
const SAGE_TINT_STRONG = "rgba(74,123,95,0.12)";
const CHARCOAL = "#0A0A0A";
const WHITE = "#FFFFFF";
const FONT_MONO = "'Space Mono', ui-monospace, monospace";
const FONT_SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Synchronous rage-click guard. React state (loading) is async —
  // 15 clicks in 500ms all see loading=false before the first
  // re-render. This ref flips to true synchronously on the first
  // click, blocking all subsequent clicks until the async handler
  // completes + resets.
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    // Build callback URL from the CURRENT browser origin (not
    // NEXTAUTH_URL) so it works on localhost, prod, and tunnels.
    // PRESERVE the ?callbackUrl=… query param that auth gates set
    // when redirecting unauthenticated users. Security: only accept
    // same-origin relative paths starting with "/atelier/".
    const urlParams = new URLSearchParams(window.location.search);
    const requestedCallback = urlParams.get("callbackUrl");
    const safeCallback =
      requestedCallback &&
      requestedCallback.startsWith("/atelier/") &&
      !requestedCallback.startsWith("//")
        ? requestedCallback
        : "/atelier/console";
    const callbackUrl = `${window.location.origin}${safeCallback}`;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);
    submittingRef.current = false;

    if (result?.error) {
      setError("Identifiants invalides. Veuillez reessayer.");
      return;
    }

    // result.url may be absolute (built from NEXTAUTH_URL). If it
    // points to a different host than the current one, strip it back
    // to a path so the browser stays on the correct origin.
    if (result?.url) {
      try {
        const targetUrl = new URL(result.url);
        if (targetUrl.origin !== window.location.origin) {
          window.location.href = targetUrl.pathname + targetUrl.search;
        } else {
          window.location.href = result.url;
        }
      } catch {
        window.location.href = result.url;
      }
    }
  };

  return (
    <div style={pageWrapperStyle}>
      <style>{loginCss}</style>

      {/* Page entrance: fade + slide up (400ms) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={entranceWrapperStyle}
      >
        {/* Card entrance: scale 0.95 → 1 + fade (500ms, spring) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          className="harch-split-grid"
          style={splitGridStyle}
        >
          {/* ─── LEFT: Brand showcase (desktop only) ─── */}
          <aside style={brandPanelStyle} className="harch-brand-panel">
            {/* Floating brand mark */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={brandMarkWrapperStyle}
            >
              <span style={brandMarkHarchStyle}>HARCH</span>
              <span style={brandMarkPipeStyle}>|</span>
              <span style={brandMarkAtelierStyle}>ATELIER</span>
            </motion.div>

            <div style={brandTaglineStyle}>
              Intelligence reputationnelle
              <br />
              pour leaders ambitieux.
            </div>

            <p style={brandSubTextStyle}>
              Surveillez 30+ sources medias et 4 moteurs IA en continu.
              Recevez l&apos;analyse de sentiment, les alertes crise sur WhatsApp,
              et un PDF mensuel pret pour le board.
            </p>

            {/* Stats row */}
            <div style={brandStatsStyle}>
              <div style={brandStatItemStyle}>
                <div style={brandStatNumberStyle}>30+</div>
                <div style={brandStatLabelStyle}>Sources medias</div>
              </div>
              <div style={brandStatDividerStyle} />
              <div style={brandStatItemStyle}>
                <div style={brandStatNumberStyle}>8</div>
                <div style={brandStatLabelStyle}>Marches couverts</div>
              </div>
              <div style={brandStatDividerStyle} />
              <div style={brandStatItemStyle}>
                <div style={brandStatNumberStyle}>24/7</div>
                <div style={brandStatLabelStyle}>Veille temps reel</div>
              </div>
            </div>

            {/* Decorative bottom signature */}
            <div style={brandFooterStyle}>
              <span style={brandFooterTextStyle}>Casablanca &middot; Paris &middot; Geneva</span>
            </div>
          </aside>

          {/* ─── RIGHT: Form panel ─── */}
          <section style={formPanelStyle} className="harch-form-panel">
            {/* Sage accent stripe (4px, full height, left edge) */}
            <div style={sageStripeStyle} aria-hidden="true" />

            <div style={formContentStyle}>
              {/* Mobile-only compact brand mark */}
              <div style={mobileBrandStyle} className="harch-mobile-brand">
                <span style={mobileBrandHarchStyle}>HARCH</span>
                <span style={mobileBrandPipeStyle}>|</span>
                <span style={mobileBrandAtelierStyle}>ATELIER</span>
              </div>

              {/* Desktop brand badge with subtle float */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                style={brandBadgeStyle}
                className="harch-desktop-brand"
              >
                <span style={brandBadgeDotStyle} aria-hidden="true" />
                <span style={brandBadgeTextStyle}>ATELIER · CONSOLE</span>
              </motion.div>

              {/* Title */}
              <h1 style={titleStyle}>Connexion</h1>

              {/* Subtitle */}
              <p style={subtitleStyle}>Accedez a votre tableau de bord</p>

              {/* Error message: slide down + shake */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error-banner"
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
                      <AlertCircle size={14} strokeWidth={2} style={errorIconStyle} />
                      <span>{error}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email professionnel"
                  autoComplete="email"
                  required
                  className="harch-login-input"
                  style={{ marginBottom: "12px" }}
                  aria-label="Email professionnel"
                />

                {/* Password — with show/hide toggle (smooth icon transition) */}
                <div style={{ position: "relative", marginBottom: "8px" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    required
                    className="harch-login-input"
                    style={{ paddingRight: "44px" }}
                    aria-label="Mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    style={eyeButtonStyle}
                    tabIndex={0}
                    className="harch-eye-btn"
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

                {/* Forgot password link — subtle, with underline slide */}
                <div style={forgotWrapperStyle}>
                  <a
                    href="/atelier/forgot-password"
                    className="harch-link-underline"
                    style={forgotLinkStyle}
                  >
                    Mot de passe oublie?
                  </a>
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

              {/* Divider with "ou" overlay */}
              <div style={dividerWrapperStyle}>
                <div style={dividerLineStyle} />
                <span style={dividerTextStyle}>ou</span>
              </div>

              {/* Passkey button — outline (distinct from primary) */}
              <PasskeyButton mode="login" email={email} />

              {/* Bottom links */}
              <div style={bottomLinksStyle}>
                Pas encore de compte?
                <a
                  href="/atelier/request-access"
                  className="harch-link-underline"
                  style={bottomLinkStyle}
                >
                  Demander l&rsquo;acces
                </a>
              </div>
            </div>
          </section>
        </motion.div>

        {/* Trust badges — below card, with Lucide icons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={trustBadgesStyle}
        >
          <span style={trustBadgeStyle}>
            <ShieldCheck size={12} strokeWidth={2} style={trustBadgeIconStyle} />
            Conforme CNDP
          </span>
          <span style={dotStyle} aria-hidden="true" />
          <span style={trustBadgeStyle}>
            <Scale size={12} strokeWidth={2} style={trustBadgeIconStyle} />
            Loi 09-08
          </span>
          <span style={dotStyle} aria-hidden="true" />
          <span style={trustBadgeStyle}>
            <Hash size={12} strokeWidth={2} style={trustBadgeIconStyle} />
            Audit SHA-256
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── CSS (class-based for pseudo-elements + responsive) ──────────

const loginCss = `
  .harch-login-input {
    width: 100%;
    height: 44px;
    border: 1px solid #E5E5E5;
    border-radius: 10px;
    padding: 0 14px;
    font-size: 14px;
    background: #FAFAFA;
    color: #0A0A0A;
    box-sizing: border-box;
    outline: none;
    font-family: inherit;
    transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
  }
  .harch-login-input::placeholder {
    color: #9CA3AF;
  }
  .harch-login-input:focus {
    border-color: ${SAGE};
    background: #FFFFFF;
    box-shadow: 0 0 0 3px ${SAGE_TINT_STRONG};
  }

  /* Underline slide animation for links */
  .harch-link-underline {
    position: relative;
    text-decoration: none;
    transition: color 180ms ease;
  }
  .harch-link-underline::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -2px;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .harch-link-underline:hover::after {
    transform: scaleX(1);
  }

  /* Submit button hover (when not disabled) */
  .harch-submit-btn:not(:disabled):hover {
    background: #1A1A1A !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.14) !important;
  }
  .harch-submit-btn:not(:disabled):active {
    box-shadow: 0 2px 6px rgba(0,0,0,0.10) !important;
  }

  /* Eye toggle hover */
  .harch-eye-btn:hover {
    color: ${SAGE};
    background: ${SAGE_TINT};
  }

  /* Responsive split layout */
  @media (min-width: 880px) {
    .harch-split-grid {
      grid-template-columns: 5fr 6fr !important;
    }
    .harch-brand-panel {
      display: flex !important;
    }
    .harch-mobile-brand {
      display: none !important;
    }
    .harch-desktop-brand {
      display: inline-flex !important;
    }
  }
  @media (max-width: 879px) {
    .harch-brand-panel {
      display: none !important;
    }
    .harch-mobile-brand {
      display: flex !important;
    }
    .harch-desktop-brand {
      display: none !important;
    }
  }
  @media (max-width: 480px) {
    .harch-split-grid {
      max-width: 92% !important;
    }
    .harch-form-panel {
      padding: 32px 22px !important;
    }
  }
`;

// ─── Inline style objects ────────────────────────────────────────

const pageWrapperStyle: React.CSSProperties = {
  minHeight: "100vh",
  // Subtle dot pattern (very faint sage) + soft neutral gradient underlay
  backgroundImage: `radial-gradient(circle, ${SAGE_TINT} 1px, transparent 1px), linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)`,
  backgroundSize: "24px 24px, 100% 100%",
  backgroundPosition: "0 0, 0 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  fontFamily: FONT_SANS,
  color: CHARCOAL,
};

const entranceWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
};

const splitGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  width: "100%",
  maxWidth: "920px",
  background: WHITE,
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0,0,0,0.04)",
  border: "1px solid #F0F0F0",
};

// ─── Brand panel (LEFT) ──────────────────────────────────────────
const brandPanelStyle: React.CSSProperties = {
  display: "none", // overridden on desktop via class
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "48px 40px",
  background: `linear-gradient(160deg, ${SAGE} 0%, ${SAGE_LIGHT} 60%, #3C6850 100%)`,
  color: WHITE,
  position: "relative",
  overflow: "hidden",
};

const brandMarkWrapperStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const brandMarkHarchStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: WHITE,
  letterSpacing: "-0.02em",
  fontFamily: FONT_MONO,
};

const brandMarkPipeStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.4)",
  margin: "0 10px",
  fontSize: "22px",
  fontWeight: 400,
};

const brandMarkAtelierStyle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "rgba(255,255,255,0.92)",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontFamily: FONT_MONO,
};

const brandTaglineStyle: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: "-0.02em",
  margin: "40px 0 16px",
  color: WHITE,
};

const brandSubTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.82)",
  margin: "0 0 40px",
  maxWidth: "320px",
};

const brandStatsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "stretch",
  gap: "20px",
  marginBottom: "32px",
};

const brandStatItemStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const brandStatNumberStyle: React.CSSProperties = {
  fontSize: "22px",
  fontWeight: 700,
  color: WHITE,
  fontFamily: FONT_MONO,
  letterSpacing: "-0.02em",
  lineHeight: 1,
};

const brandStatLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.7)",
  marginTop: "6px",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const brandStatDividerStyle: React.CSSProperties = {
  width: "1px",
  background: "rgba(255,255,255,0.18)",
};

const brandFooterStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.55)",
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontFamily: FONT_MONO,
};

const brandFooterTextStyle: React.CSSProperties = {
  fontFamily: FONT_MONO,
};

// ─── Form panel (RIGHT) ──────────────────────────────────────────
const formPanelStyle: React.CSSProperties = {
  position: "relative",
  padding: "44px 44px",
  background: WHITE,
  boxSizing: "border-box",
};

const sageStripeStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  top: 0,
  bottom: 0,
  width: "4px",
  background: `linear-gradient(180deg, ${SAGE} 0%, ${SAGE_LIGHT} 100%)`,
};

const formContentStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
};

// Mobile brand (visible only on mobile)
const mobileBrandStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "24px",
};

const mobileBrandHarchStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 700,
  color: CHARCOAL,
  letterSpacing: "-0.02em",
  fontFamily: FONT_MONO,
};

const mobileBrandPipeStyle: React.CSSProperties = {
  color: "#E5E5E5",
  margin: "0 8px",
  fontSize: "18px",
  fontWeight: 400,
};

const mobileBrandAtelierStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontFamily: FONT_MONO,
};

// Desktop brand badge (with float)
const brandBadgeStyle: React.CSSProperties = {
  display: "none", // overridden on desktop via class
  alignItems: "center",
  gap: "8px",
  alignSelf: "flex-start",
  padding: "6px 12px",
  background: SAGE_TINT,
  border: `1px solid ${SAGE_TINT_STRONG}`,
  borderRadius: "100px",
  marginBottom: "24px",
};

const brandBadgeDotStyle: React.CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  background: SAGE,
  boxShadow: `0 0 0 3px ${SAGE_TINT_STRONG}`,
};

const brandBadgeTextStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  color: SAGE,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontFamily: FONT_MONO,
};

const titleStyle: React.CSSProperties = {
  fontSize: "26px",
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
  margin: "0 0 28px",
};

// Error banner
const errorStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "10px",
  fontSize: "13px",
  color: "#991B1B",
  fontFamily: FONT_SANS,
};

const errorIconStyle: React.CSSProperties = {
  marginRight: "8px",
  flexShrink: 0,
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

const forgotWrapperStyle: React.CSSProperties = {
  textAlign: "right",
  marginBottom: "20px",
};

const forgotLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: SAGE,
  fontWeight: 500,
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
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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

const dividerWrapperStyle: React.CSSProperties = {
  position: "relative",
  margin: "24px 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const dividerLineStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: 0,
  right: 0,
  height: "1px",
  background: "#F0F0F0",
};

const dividerTextStyle: React.CSSProperties = {
  position: "relative",
  background: WHITE,
  color: "#9CA3AF",
  fontSize: "12px",
  padding: "0 12px",
  fontFamily: FONT_MONO,
};

const bottomLinksStyle: React.CSSProperties = {
  marginTop: "28px",
  textAlign: "center",
  fontSize: "13px",
  color: "#71717A",
};

const bottomLinkStyle: React.CSSProperties = {
  color: SAGE,
  fontWeight: 500,
  marginLeft: "4px",
};

// Trust badges (below card)
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

const trustBadgeIconStyle: React.CSSProperties = {
  color: SAGE,
};

const dotStyle: React.CSSProperties = {
  width: "3px",
  height: "3px",
  borderRadius: "50%",
  background: "#D4D4D4",
  display: "inline-block",
};

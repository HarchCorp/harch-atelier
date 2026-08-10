"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { PasskeyButton } from "@/components/auth/PasskeyButton";

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE — Modern institutional UX
//
//  Sign-in form for users who have already activated their account
//  via an invitation link. New users must request access first at
//  /atelier/request-access.
//
//  Design: white card on warm neutral background, charcoal primary
//  action, sage green accents. NO dark mode. French language.
// ═══════════════════════════════════════════════════════════════

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
      setError("Identifiants invalides. Veuillez réessayer.");
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
      <style>{loginInputCss}</style>

      <div className="harch-login-card" style={cardStyle}>
        {/* 1. Logo */}
        <div style={logoWrapperStyle}>
          <span style={logoHarchStyle}>HARCH</span>
          <span style={logoPipeStyle}>|</span>
          <span style={logoAtelierStyle}>ATELIER</span>
        </div>

        {/* 2. Title */}
        <h1 style={titleStyle}>Connexion</h1>

        {/* 3. Subtitle */}
        <p style={subtitleStyle}>Accédez à votre tableau de bord</p>

        {/* 8. Error message (if login fails) — shown above form */}
        {error && (
          <div role="alert" style={errorStyle}>
            {error}
          </div>
        )}

        {/* 4. Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@entreprise.com"
              autoComplete="email"
              required
              className="harch-login-input"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label htmlFor="password" style={labelStyle}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="harch-login-input"
                style={{ paddingRight: "44px" }}
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
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {/* Forgot password link */}
          <div style={forgotWrapperStyle}>
            <a href="/atelier/contact" style={forgotLinkStyle}>
              Mot de passe oublié?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = "#1A1A1A";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.15)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#0A0A0A";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loading ? "Connexion…" : "Se connecter →"}
          </button>
        </form>

        {/* 5. Divider */}
        <div style={dividerStyle} />

        {/* 6. Passkey button */}
        <PasskeyButton mode="login" email={email} />

        {/* 7. Bottom links */}
        <div style={bottomLinksStyle}>
          Pas encore de compte?{" "}
          <a href="/atelier/request-access" style={bottomLinkStyle}>
            Demander l&apos;accès →
          </a>
        </div>
      </div>

      {/* Trust badges (outside card) */}
      <div style={trustBadgesStyle}>
        <span style={trustBadgeStyle}>Conforme CNDP</span>
        <span style={dotStyle} aria-hidden="true">
          •
        </span>
        <span style={trustBadgeStyle}>Loi 09-08</span>
        <span style={dotStyle} aria-hidden="true">
          •
        </span>
        <span style={trustBadgeStyle}>Audit SHA-256</span>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────

const loginInputCss = `
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
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .harch-login-input::placeholder {
    color: #9CA3AF;
  }
  .harch-login-input:focus {
    border-color: #4A7B5F;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(74,123,95,0.1);
  }
  @media (max-width: 480px) {
    .harch-login-card {
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
  maxWidth: "440px",
  background: "#FFFFFF",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
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
  letterSpacing: "-0.01em",
};

const logoPipeStyle: React.CSSProperties = {
  color: "#E5E5E5",
  margin: "0 8px",
  fontSize: "18px",
  fontWeight: 400,
};

const logoAtelierStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#71717A",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontWeight: 500,
};

const titleStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: 700,
  color: "#0A0A0A",
  textAlign: "center",
  margin: "0 0 8px",
  letterSpacing: "-0.02em",
};

const subtitleStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#71717A",
  textAlign: "center",
  margin: "0 0 32px",
};

// Error banner shown above the form when signIn fails.
// Mirrors the design of success/info banners elsewhere in the app.
const errorStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "#FEF2F2",
  border: "1px solid #FECACA",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#991B1B",
  marginBottom: "16px",
  fontFamily: "'Inter', system-ui, sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#0A0A0A",
  marginBottom: "4px",
};

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  padding: "6px",
  cursor: "pointer",
  color: "#71717A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
};

const forgotWrapperStyle: React.CSSProperties = {
  textAlign: "right",
  marginBottom: "24px",
};

const forgotLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#4A7B5F",
  textDecoration: "none",
  fontWeight: 500,
};

const submitButtonStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  background: "#0A0A0A",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "10px",
  fontSize: "14px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  transition: "background 0.15s, box-shadow 0.15s, opacity 0.15s",
};

const dividerStyle: React.CSSProperties = {
  borderTop: "1px solid #F0F0F0",
  margin: "24px 0",
};

const bottomLinksStyle: React.CSSProperties = {
  marginTop: "24px",
  textAlign: "center",
  fontSize: "14px",
  color: "#71717A",
};

const bottomLinkStyle: React.CSSProperties = {
  color: "#4A7B5F",
  fontWeight: 500,
  textDecoration: "none",
};

const trustBadgesStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "24px",
  flexWrap: "wrap",
};

const trustBadgeStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#9CA3AF",
  textAlign: "center",
};

const dotStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#D1D5DB",
};

// ─── Icons ─────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

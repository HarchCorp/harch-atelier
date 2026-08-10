"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { PasskeyButton } from "@/components/auth/PasskeyButton";
import { ArrowRight, Eye, EyeOff, Fingerprint, AlertCircle } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE — Minimalist institutional entry point
//
//  Stripe / Linear / Vercel-grade login: one centered card on a
//  subtle neutral gradient. White surface, sage green accents,
//  charcoal primary action. French language. No emojis, no clutter.
//
//  Sign-in form for users who have already activated their account
//  via an invitation link. New users must request access first at
//  /atelier/request-access.
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
        <p style={subtitleStyle}>Accedez a votre tableau de bord</p>

        {/* 8. Error message (if login fails) — shown above form */}
        {error && (
          <div role="alert" style={errorStyle}>
            <AlertCircle size={14} strokeWidth={2} style={errorIconStyle} />
            <span>{error}</span>
          </div>
        )}

        {/* 4. Form */}
        <form onSubmit={handleSubmit}>
          {/* Email — label hidden, placeholder only */}
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

          {/* Password — label hidden, with show/hide toggle */}
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
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={2} />
              ) : (
                <Eye size={16} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Forgot password link */}
          <div style={forgotWrapperStyle}>
            <a href="/atelier/contact" style={forgotLinkStyle} className="harch-forgot-link">
              Mot de passe oublie?
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="harch-submit-btn"
            style={{
              ...submitButtonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            <span>{loading ? "Connexion..." : "Se connecter"}</span>
            {!loading && (
              <ArrowRight size={14} strokeWidth={2} style={{ marginLeft: "6px" }} />
            )}
          </button>
        </form>

        {/* 5. Divider with "ou" overlay */}
        <div style={dividerWrapperStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>ou</span>
        </div>

        {/* 6. Passkey button */}
        <PasskeyButton mode="login" email={email} />

        {/* 7. Bottom links */}
        <div style={bottomLinksStyle}>
          Pas encore de compte?
          <a href="/atelier/request-access" style={bottomLinkStyle}>
            Demander l&rsquo;acces
          </a>
        </div>
      </div>

      {/* 9. Trust badges (below card) */}
      <div style={trustBadgesStyle}>
        <span style={trustBadgeStyle}>Conforme CNDP</span>
        <span style={dotStyle} aria-hidden="true" />
        <span style={trustBadgeStyle}>Loi 09-08</span>
        <span style={dotStyle} aria-hidden="true" />
        <span style={trustBadgeStyle}>Audit SHA-256</span>
      </div>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────

const loginInputCss = `
  .harch-login-input {
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
  .harch-login-input::placeholder {
    color: #9CA3AF;
  }
  .harch-login-input:focus {
    border-color: #4A7B5F;
    background: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(74,123,95,0.08);
  }
  .harch-forgot-link {
    text-decoration: none;
    transition: text-decoration 150ms ease;
  }
  .harch-forgot-link:hover {
    text-decoration: underline;
  }
  .harch-submit-btn {
    transition: background 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
  }
  .harch-submit-btn:not(:disabled):hover {
    background: #1A1A1A !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
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
  maxWidth: "400px",
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
  marginBottom: "32px",
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

// Error banner — shown above the form when signIn fails.
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

const eyeButtonStyle: React.CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  padding: "4px",
  cursor: "pointer",
  color: "#71717A",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "6px",
};

const forgotWrapperStyle: React.CSSProperties = {
  textAlign: "right",
  marginBottom: "20px",
};

const forgotLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#4A7B5F",
  fontWeight: 500,
};

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
  background: "#FFFFFF",
  color: "#9CA3AF",
  fontSize: "12px",
  padding: "0 12px",
};

const bottomLinksStyle: React.CSSProperties = {
  marginTop: "28px",
  textAlign: "center",
  fontSize: "13px",
  color: "#71717A",
};

const bottomLinkStyle: React.CSSProperties = {
  color: "#4A7B5F",
  fontWeight: 500,
  marginLeft: "4px",
  textDecoration: "none",
};

const trustBadgesStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "32px",
  flexWrap: "wrap",
};

const trustBadgeStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#9CA3AF",
  textAlign: "center",
};

const dotStyle: React.CSSProperties = {
  width: "4px",
  height: "4px",
  borderRadius: "50%",
  background: "#D4D4D4",
  display: "inline-block",
};

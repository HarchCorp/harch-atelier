"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { C } from "../components/tokens";
import { BrandingProvider, type BrandingPayload } from "../components/BrandingProvider";
import { PasskeyButton } from "@/components/auth/PasskeyButton";

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE — For invited users only
//
//  Sign-in form for users who have already activated their account
//  via an invitation link. New users must request access first at
//  /atelier/request-access.
//
//  Admin signs in at a separate URL: /atelier/admin-x7k2m9
// ═══════════════════════════════════════════════════════════════

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<BrandingPayload | null>(null);
  // Synchronous rage-click guard. React state (loading) is async — 15
  // clicks in 500ms all see loading=false before the first re-render.
  // This ref flips to true synchronously on the first click, blocking
  // all subsequent clicks until the async handler completes + resets.
  const submittingRef = useRef(false);

  // Fetch white-label branding on mount (based on the request host /
  // subdomain). If the page is served from iq.attijari.harchcorp.com,
  // the branding API returns Attijariwafa's custom logo + colors +
  // login title. Otherwise it returns Harch defaults.
  useEffect(() => {
    fetch("/api/agency/branding", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BrandingPayload | null) => {
        if (data) setBranding(data);
      })
      .catch(() => {
        /* swallow — branding is best-effort */
      });
  }, []);

  const loginTitle = branding?.loginTitle || "HarchIQ";
  const loginSubtitle = branding?.loginSubtitle || "Console";
  const isWhiteLabel = branding?.resolvedFrom === "agency-client" || branding?.resolvedFrom === "agency-master";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Rage-click guard: synchronous ref check blocks all clicks after
    // the first one until the async signIn() completes.
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);
    setError(null);

    // Build callback URL from the CURRENT browser origin (not NEXTAUTH_URL)
    // so it works on localhost (dev), atelier.harchcorp.com (prod), and
    // cloudflared tunnels without redirecting to the wrong host.
    //
    // Agent 3 fix (Task 10-A3): PRESERVE the ?callbackUrl=… query param
    // that the auth gate at /atelier/console/{brand-monitor,…}/page.tsx
    // sets when redirecting unauthenticated users. Previously this was
    // hardcoded to "/atelier/console", so a user who tried to visit
    // /atelier/console/brand-monitor would land on /atelier/console
    // after login instead of the brand-monitor dashboard they wanted.
    // The flow now:
    //   1. Auth gate redirects to /atelier/login?callbackUrl=/atelier/console/brand-monitor
    //   2. LoginPage reads the param and passes it to signIn()
    //   3. signIn() returns result.url with the callbackUrl appended
    //   4. The pathname-only fallback (line ~86) keeps the user on the current origin
    const urlParams = new URLSearchParams(window.location.search);
    const requestedCallback = urlParams.get("callbackUrl");
    // SECURITY: only accept same-origin relative paths (must start with "/atelier/").
    // Reject absolute URLs and paths outside /atelier/ to prevent open-redirect abuse.
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
      setError("Invalid credentials.");
      return;
    }

    // result.url may be absolute (built from NEXTAUTH_URL). If it points
    // to a different host than the current one, strip it back to a path
    // so the browser stays on the correct origin.
    if (result?.url) {
      try {
        const targetUrl = new URL(result.url);
        if (targetUrl.origin !== window.location.origin) {
          // Different host — use only the pathname to stay on current origin
          window.location.href = targetUrl.pathname + targetUrl.search;
        } else {
          window.location.href = result.url;
        }
      } catch {
        // Not a valid URL — treat as a relative path
        window.location.href = result.url;
      }
    }
  };

  return (
    <BrandingProvider payload={branding ?? undefined}>
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
        {branding?.logoUrl ? (
          <img src={branding.logoUrl} alt={branding.displayName || "Logo"} height={28} style={{ height: "28px", width: "auto", objectFit: "contain" }} />
        ) : (
          <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
            {loginTitle}<span style={{ color: branding?.accentColor || C.accent, marginLeft: "8px" }}>{loginSubtitle}</span>
          </span>
        )}
        {isWhiteLabel && branding?.displayName && (
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", borderLeft: `1px solid ${C.border}`, paddingLeft: "12px" }}>
            {branding.displayName}
          </span>
        )}
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ maxWidth: "400px", width: "100%" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Sign in
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.5, marginBottom: "32px" }}>
            {isWhiteLabel && branding?.displayName
              ? `Access the ${branding.displayName} intelligence console.`
              : "Access your HarchIQ Console."}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required style={inputStyle} />
            </div>

            {error && (
              <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: "14px 20px", background: loading ? C.border : C.cta, border: "none", color: "#ffffff", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", borderRadius: "4px" }}>
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>No account yet? </span>
            <a href="/atelier/request-access" style={{ fontSize: "12px", color: C.accent, fontFamily: C.fontMono, textDecoration: "underline" }}>Request access</a>
          </div>

          {/* Demo access — one-click sign-in with a demo account that
              bypasses the database entirely. Safe for evaluation. */}
          <div style={{ marginTop: "20px", padding: "24px", background: "#fafaf9", border: `1px solid ${C.border}`, borderRadius: "8px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "11px", color: C.textBody, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "10px" }}>
              Evaluate without an account
            </div>
            <button
              type="button"
              onClick={() => { setEmail("demo-brand@harch.atelier"); setPassword("demo"); }}
              style={{ width: "100%", padding: "12px 16px", background: "#ffffff", border: `1px solid ${C.borderStrong}`, borderRadius: "6px", fontFamily: C.fontMono, fontSize: "12px", color: C.text, cursor: "pointer", marginBottom: "10px", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.borderStrong; }}
            >
              Fill demo credentials →  demo-brand@harch.atelier
            </button>
            <p style={{ margin: 0, fontSize: "12px", color: C.textBody, fontFamily: C.fontMono, lineHeight: 1.6 }}>
              Demo account runs on in-memory data. The console, dashboard, and account flows are fully interactive. Trader and investor desks are on standby.
            </p>
          </div>

          {/* Executive Demo link - intentionally discrete (small, muted,
              below the regular "Request access" link). We don't want
              regular users clicking it during normal sign-in, but it
              needs to be reachable for Comex presentations. The demo
              page (/atelier/demo) bypasses auth via a shared token. */}
          <div style={{ marginTop: "16px", textAlign: "center" }}>
            <a
              href="/atelier/demo"
              style={{
                fontSize: "11px",
                color: C.textMuted,
                fontFamily: C.fontMono,
                textDecoration: "none",
                letterSpacing: "0.04em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.textMuted; }}
            >
              Executive Demo →
            </a>
          </div>

          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <a href="/atelier" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>← Back to Harch Atelier</a>
          </div>

          {/* ZKP Auth link — the server never knows your password */}
          <div style={{ marginTop: "20px", padding: "12px 16px", background: C.bgSubtle, borderRadius: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "4px" }}>
              🔐 Zero-Knowledge Proof Auth
            </div>
            <a href="/atelier/lab/zkp" style={{ fontSize: "12px", color: C.accent, fontFamily: C.fontMono, textDecoration: "none", fontWeight: 600 }}>
              Try passwordless authentication →
            </a>
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
            <span style={{ fontSize: "10px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: C.border }} />
          </div>

          {/* Passkey / WebAuthn — biometric authentication */}
          <div style={{ marginTop: "16px" }}>
            <PasskeyButton mode="login" email={email} />
          </div>
        </div>
      </main>
    </div>
    </BrandingProvider>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid #e5e5e5",
  borderRadius: "4px",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "14px",
  color: "#0a0a0a",
  background: "#ffffff",
  boxSizing: "border-box",
  outline: "none",
};

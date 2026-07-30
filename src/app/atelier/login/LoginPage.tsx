"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { C } from "../components/tokens";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Use a callback URL that lets the server decide where to send the user
    // based on their accountType (handled by /atelier/console smart redirect)
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/atelier/console",
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </span>
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
            Access your HarchIQ Console.
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

          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <a href="/atelier" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>← Back to Harch Atelier</a>
          </div>
        </div>
      </main>
    </div>
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

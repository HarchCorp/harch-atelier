"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  LOGIN PAGE — Sign in only (no signup)
//
//  Per founder: 'il n'y a pas inscription, je suis le seul à fournir
//  les comptes.' This page is sign-in only. Account creation is done
//  manually via /api/setup (admin-only) or directly in the database.
// ═══════════════════════════════════════════════════════════════

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/atelier/console",
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid credentials. If you forgot your password, contact us directly.");
      return;
    }

    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Sign in
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.5, marginBottom: "32px" }}>
            Access your HarchIQ Console. Accounts are provided directly by the Harch Atelier team — there is no self-signup.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
                style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.bg, boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your access key"
                autoComplete="current-password"
                required
                style={{ width: "100%", padding: "12px 14px", border: `1px solid ${C.border}`, borderRadius: "4px", fontFamily: C.fontSans, fontSize: "14px", color: C.text, background: C.bg, boxSizing: "border-box", outline: "none", transition: "border-color 0.15s" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = C.accent)}
                onBlur={(e) => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {error && (
              <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ padding: "14px 20px", background: loading ? C.border : C.cta, border: "none", color: "#ffffff", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", borderRadius: "4px", transition: "background-color 0.15s", letterSpacing: "0.02em" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = C.ctaHover; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = C.cta; }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>
          </form>

          <div style={{ marginTop: "32px", padding: "16px 18px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "6px", fontSize: "13px", color: C.textBody, lineHeight: 1.5 }}>
            <strong style={{ color: C.text, fontFamily: C.fontMono, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              No account yet?
            </strong>{" "}
            HarchIQ Console access is granted by the Harch Atelier team only. To request access, contact{" "}
            <a href="mailto:atelier@harchcorp.com?subject=HarchIQ%20Console%20access%20request" style={{ color: C.accent, textDecoration: "underline" }}>
              atelier@harchcorp.com
            </a>
            .
          </div>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <a href="/atelier" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none", letterSpacing: "0.04em" }}>
              ← Back to Harch Atelier
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

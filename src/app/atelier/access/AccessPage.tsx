"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  ACCESS PAGE — Invitation acceptance
//
//  URL: /atelier/access?token=XXX
//
//  Flow:
//  1. User clicks the link admin sent them
//  2. This page loads, fetches invitation details via GET /api/access
//  3. Shows: "Welcome. Your access is ready."
//  4. User MUST set their own password (no temporary password)
//  5. User clicks "Activate my account" → POST /api/access
//  6. Account is created → user is signed in → redirected to Console
// ═══════════════════════════════════════════════════════════════

interface InvitationData {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: string;
  company: string | null;
  message: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  status: string;
}

export function AccessPage({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/access?token=${token}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Invalid invitation");
        } else {
          setInvitation(data);
        }
      } catch {
        setError("Network error");
      }
      setLoading(false);
    })();
  }, [token]);

  const handleActivate = async () => {
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setActivating(true);

    try {
      const res = await fetch(`/api/access?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Activation failed");
        setActivating(false);
        return;
      }

      // Account created — now sign in with the password the user just set
      const result = await signIn("credentials", {
        email: invitation?.email,
        password,
        redirect: false,
        callbackUrl: "/atelier/console",
      });

      if (result?.url) {
        window.location.href = result.url;
      } else {
        // Fallback: redirect to login
        window.location.href = "/atelier/login?activated=true";
      }
    } catch {
      setError("Network error");
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.fontSans }}>
        <div style={{ color: C.textMuted, fontFamily: C.fontMono, fontSize: "13px" }}>Loading...</div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Access denied</h1>
          <p style={{ fontSize: "15px", color: C.textBody, marginBottom: "24px" }}>{error}</p>
          <a href="/atelier/request-access" style={{ fontSize: "13px", color: C.accent, textDecoration: "underline" }}>Request new access</a>
        </div>
      </div>
    );
  }

  if (invitation?.status === "already_used") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Already activated</h1>
          <p style={{ fontSize: "15px", color: C.textBody, marginBottom: "24px" }}>This invitation has already been used. Your account is ready.</p>
          <a href="/atelier/login" style={{ display: "inline-block", padding: "12px 24px", background: C.cta, color: "#fff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>Sign in</a>
        </div>
      </div>
    );
  }

  if (invitation?.status === "expired") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "480px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: C.text, margin: "0 0 16px" }}>Invitation expired</h1>
          <p style={{ fontSize: "15px", color: C.textBody, marginBottom: "24px" }}>This invitation has expired. Please contact the Harch Atelier team for a new one.</p>
          <a href="/atelier/request-access" style={{ fontSize: "13px", color: C.accent, textDecoration: "underline" }}>Request new access</a>
        </div>
      </div>
    );
  }

  const accountTypeLabel: Record<string, string> = {
    "brand-monitor": "Brand Monitor",
    "market-competitor": "Market & Competitor",
    "investment-bank": "Investment Bank",
    "harch-alpha": "Harch Alpha",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </span>
      </header>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Invitation accepted
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Welcome, {invitation?.name?.split(" ")[0]}.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
            Thank you for joining HarchIQ Console. Create your password to activate your account.
          </p>

          {/* Pre-filled info */}
          <div style={{ padding: "20px", background: C.bgSubtle, border: `1px solid ${C.border}`, borderRadius: "6px", marginBottom: "24px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>Your account</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "4px" }}>Name</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation?.name}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "4px" }}>Email</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "4px" }}>Account type</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.accent }}>{invitation ? accountTypeLabel[invitation.accountType] || invitation.accountType : "—"}</div>
              </div>
              {invitation?.company && (
                <div>
                  <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, marginBottom: "4px" }}>Company</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: C.text }}>{invitation.company}</div>
                </div>
              )}
            </div>
          </div>

          {/* Password fields — user creates their own */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              Create your password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
              Confirm your password *
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger, marginBottom: "16px" }}>
              {error}
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={activating || !password || !confirmPassword}
            style={{ width: "100%", padding: "14px 20px", background: activating || !password || !confirmPassword ? C.border : C.cta, border: "none", color: "#ffffff", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: activating || !password || !confirmPassword ? "not-allowed" : "pointer", borderRadius: "4px" }}
          >
            {activating ? "Activating..." : "Activate my account →"}
          </button>

          <div style={{ marginTop: "16px", fontSize: "11px", color: C.textMuted, fontFamily: C.fontMono, textAlign: "center", lineHeight: 1.5 }}>
            By activating your account, you agree to use HarchIQ Console
            <br />responsibly and keep your credentials confidential.
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

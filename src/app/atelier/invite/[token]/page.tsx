"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { C } from "../../components/tokens";
import { BrandBadge } from "@/components/BrandBadge";

// ═══════════════════════════════════════════════════════════════
//  /atelier/invite/[token]
//
//  The invitation acceptance page. When an admin creates an invitation,
//  they send the user a link like:
//    https://atelier.harchcorp.com/atelier/invite/abc123token
//
//  This page:
//    1. Fetches the invitation info (email, invitedBy, accountType)
//    2. Shows a "Set your password" form
//    3. On submit, POSTs to /api/auth/accept-invite
//    4. On success, redirects to /atelier/login
//
//  Security:
//    - Token is validated server-side (must exist, not used, not expired)
//    - Password is bcrypt-hashed server-side (never sent plaintext beyond HTTPS)
//    - Rate-limited: 5 attempts per IP per 10 minutes
//    - Single-use: token is burned after acceptance
//
//  Task ID: YGGDRASIL-N50 (Invitation system)
// ═══════════════════════════════════════════════════════════════

interface InviteInfo {
  valid: boolean;
  error?: string;
  email?: string;
  name?: string;
  accountType?: string;
  role?: string;
  company?: string;
  message?: string;
  invitedBy?: string;
  expiresAt?: string;
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/invite-info?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data: InviteInfo) => {
        setInvite(data);
        setLoading(false);
      })
      .catch(() => {
        setInvite({ valid: false, error: "Failed to load invitation" });
        setLoading(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to accept invitation.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/atelier/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "13px", color: C.textMuted }}>Loading invitation…</div>
      </div>
    );
  }

  if (!invite?.valid) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "420px", width: "100%", padding: "40px 24px", textAlign: "center" }}>
          <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.text, margin: "24px 0 12px" }}>
            Invitation Invalid
          </h1>
          <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "24px" }}>
            {invite?.error === "Expired"
              ? "This invitation link has expired. Please request a new one from your administrator."
              : invite?.error === "Already used"
                ? "This invitation has already been used to create an account."
                : "This invitation link is invalid or no longer exists."}
          </p>
          <a href="/atelier/login" style={{ fontSize: "13px", color: C.accent, textDecoration: "none", fontWeight: 600 }}>
            ← Back to sign in
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "420px", width: "100%", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: C.text, margin: "0 0 12px" }}>
            Account Created
          </h1>
          <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.6, marginBottom: "24px" }}>
            Your account has been created successfully. Redirecting you to sign in…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: C.fontSans, padding: "24px" }}>
      <div style={{ maxWidth: "440px", width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <BrandBadge subsidiary="Atelier" size="md" theme="light" />
        </div>

        {/* Invitation card */}
        <div style={{
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          padding: "32px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          {/* Invitation info */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{
              fontFamily: C.fontMono,
              fontSize: "10px",
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              You're invited
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: C.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Welcome, {invite.name || invite.email}
            </h1>
            <p style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.6, margin: 0 }}>
              {invite.invitedBy} has invited you to join Harch Atelier as{" "}
              <strong style={{ color: C.text }}>{invite.role || invite.accountType}</strong>
              {invite.company ? ` at ${invite.company}` : ""}.
            </p>
            {invite.message && (
              <div style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: C.bgSubtle,
                borderRadius: "8px",
                fontSize: "13px",
                color: C.textBody,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}>
                "{invite.message}"
              </div>
            )}
          </div>

          {/* Set password form */}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontFamily: C.fontMono,
                fontSize: "10px",
                fontWeight: 700,
                color: C.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Email
              </label>
              <input
                type="email"
                value={invite.email || ""}
                disabled
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  fontFamily: C.fontSans,
                  fontSize: "14px",
                  color: C.textMuted,
                  background: C.bgSubtle,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                fontFamily: C.fontMono,
                fontSize: "10px",
                fontWeight: 700,
                color: C.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Choose a password (min 8 chars)"
                autoFocus
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  fontFamily: C.fontSans,
                  fontSize: "14px",
                  color: C.text,
                  background: C.surface,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontFamily: C.fontMono,
                fontSize: "10px",
                fontWeight: 700,
                color: C.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  fontFamily: C.fontSans,
                  fontSize: "14px",
                  color: C.text,
                  background: C.surface,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                fontSize: "13px",
                color: "#991b1b",
                marginBottom: "16px",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "14px",
                background: submitting ? C.border : C.cta,
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontFamily: C.fontSans,
                fontSize: "14px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Creating account…" : "Create account →"}
            </button>
          </form>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <a href="/atelier/login" style={{ fontSize: "12px", color: C.textMuted, textDecoration: "none" }}>
              Already have an account? Sign in →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <span style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textFaint, letterSpacing: "0.05em" }}>
            Expires {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "soon"}
          </span>
        </div>
      </div>
    </div>
  );
}

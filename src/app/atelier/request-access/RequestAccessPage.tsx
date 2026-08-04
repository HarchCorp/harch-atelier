"use client";

import { useEffect, useMemo, useState } from "react";
import { C } from "../components/tokens";
import { isWorkEmail } from "@/lib/harchiq/domain-extract";

// ═══════════════════════════════════════════════════════════════
//  REQUEST ACCESS — Public form (competitor-grade)
//
//  Two modes:
//    1. SIGN UP WITH WORK EMAIL — for users whose company is already
//       registered. Real-time domain lookup against
//       /api/companies/lookup-domain. If the domain matches a known
//       real company, the user creates a password and we POST to
//       /api/auth/register-company. They're auto-attached to their
//       company.
//    2. REQUEST ACCESS — for users whose company is NOT registered
//       yet (or who used a disposable email). Falls back to the
//       existing 3-step access-request form. Submits to
//       /api/access-request and creates a lead for the sales team.
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

type DomainStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "disposable"; message: string }
  | { kind: "unknown"; domain: string; message: string }
  | { kind: "known"; companyName: string; slug: string; sector: string; hasSubscription: boolean; message: string }
  | { kind: "error"; message: string };

type Mode = "signup" | "request";

export function RequestAccessPage() {
  const [mode, setMode] = useState<Mode>("signup");

  // ─── Sign-up mode state ───────────────────────────────────────
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus>({ kind: "idle" });
  const [signupStatus, setSignupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [signupError, setSignupError] = useState("");

  // ─── Request-access mode state (existing 3-step form) ─────────
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    role: "",
    accountType: "brand-monitor" as "brand-monitor" | "market-competitor" | "investment-bank" | "harch-alpha",
    companySize: "" as "" | "startup" | "sme" | "mid-market" | "enterprise",
    useCase: "",
    budget: "",
    phone: "",
    country: "Morocco",
    referralSource: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Real-time domain lookup (debounced 350ms) ───────────────
  // We do the client-side disposable check first (instant) and only
  // hit the API when the email looks like a work email. This avoids
  // a network round-trip for every keystroke on a gmail.com address.
  useEffect(() => {
    const email = signupEmail.trim();
    if (!email) {
      setDomainStatus({ kind: "idle" });
      return;
    }
    if (!email.includes("@")) {
      setDomainStatus({ kind: "idle" });
      return;
    }

    // Client-side disposable check — instant feedback, no network.
    if (!isWorkEmail(email)) {
      const domain = email.split("@")[1]?.toLowerCase() ?? "";
      setDomainStatus({
        kind: "disposable",
        message:
          domain.length > 0
            ? `Please use your work email address. ${domain} is a personal provider.`
            : "Please use your work email address.",
      });
      return;
    }

    setDomainStatus({ kind: "loading" });

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/companies/lookup-domain?email=${encodeURIComponent(email)}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        if (data.status === "known") {
          setDomainStatus({
            kind: "known",
            companyName: data.company.name,
            slug: data.company.slug,
            sector: data.company.sector,
            hasSubscription: data.hasSubscription,
            message: data.message,
          });
        } else if (data.status === "unknown") {
          setDomainStatus({
            kind: "unknown",
            domain: data.domain,
            message: data.message,
          });
        } else if (data.status === "disposable") {
          setDomainStatus({ kind: "disposable", message: data.message });
        } else {
          setDomainStatus({ kind: "idle" });
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setDomainStatus({
          kind: "error",
          message: "Couldn't verify your domain. Try again in a moment.",
        });
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [signupEmail]);

  const canSubmitSignup = useMemo(() => {
    if (domainStatus.kind !== "known") return false;
    if (!domainStatus.hasSubscription) return false;
    if (!signupEmail.trim() || !signupName.trim()) return false;
    if (signupPassword.length < 8) return false;
    return true;
  }, [domainStatus, signupEmail, signupName, signupPassword]);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitSignup) return;

    setSignupStatus("loading");
    setSignupError("");

    try {
      const res = await fetch("/api/auth/register-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail.trim(),
          name: signupName.trim(),
          password: signupPassword,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSignupStatus("success");
        return;
      }

      // 403 with status=pending_access means we created an AccessRequest
      // for them. Treat as soft-success (they should hear back from us).
      if (res.status === 403 && data.status === "pending_access") {
        setSignupStatus("success");
        return;
      }

      setSignupError(data.message || data.error || "Registration failed.");
      setSignupStatus("error");
    } catch {
      setSignupError("Network error. Please try again.");
      setSignupStatus("error");
    }
  };

  const handleRequestAccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) {
      setErrorMsg("Email and name are required.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Request failed.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  // ─── Success screens ─────────────────────────────────────────
  if (mode === "signup" && signupStatus === "success") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            {domainStatus.kind === "known" ? "Account created" : "Request received"}
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            {domainStatus.kind === "known"
              ? `Welcome aboard, ${signupName.split(" ")[0]}.`
              : "Thank you."}
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
            {domainStatus.kind === "known"
              ? `Your account is attached to ${domainStatus.companyName}. Sign in with your work email to access the console.`
              : `We couldn't find a company matching your email domain. Our team will review your request and reach out within 48 hours.`}
          </p>
          <div style={{ padding: "16px 20px", background: C.bgSubtle, borderRadius: "6px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Your account</div>
            <div style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>{signupName}</strong> · {signupEmail}<br />
              {domainStatus.kind === "known" && <>Company: <span style={{ color: C.accent }}>{domainStatus.companyName}</span></>}
            </div>
          </div>
          {domainStatus.kind === "known" ? (
            <a href="/atelier/login" style={{ display: "inline-block", padding: "12px 24px", background: C.cta, color: "#ffffff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>
              Sign in
            </a>
          ) : (
            <a href="/atelier" style={{ display: "inline-block", padding: "12px 24px", background: C.cta, color: "#ffffff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>
              Back to Harch Atelier
            </a>
          )}
        </div>
      </div>
    );
  }

  if (mode === "request" && status === "success") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: C.fontSans }}>
        <div style={{ maxWidth: "480px", width: "100%", textAlign: "center" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.cta, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Request received
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 16px" }}>
            Thank you, {formData.name.split(" ")[0]}.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
            Your request has been received. The Harch Atelier team will review it and send you an access link if approved — usually within 48 hours.
          </p>
          <div style={{ padding: "16px 20px", background: C.bgSubtle, borderRadius: "6px", marginBottom: "24px", textAlign: "left" }}>
            <div style={{ fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>Your request</div>
            <div style={{ fontSize: "13px", color: C.textBody, lineHeight: 1.6 }}>
              <strong style={{ color: C.text }}>{formData.name}</strong> · {formData.email}<br />
              Account type: <span style={{ color: C.accent }}>{formData.accountType}</span><br />
              {formData.company && <>Company: {formData.company}<br /></>}
              {formData.budget && <>Budget: {formData.budget}<br /></>}
            </div>
          </div>
          <a href="/atelier" style={{ display: "inline-block", padding: "12px 24px", background: C.cta, color: "#ffffff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>
            Back to Harch Atelier
          </a>
        </div>
      </div>
    );
  }

  const accountTypes = [
    { value: "brand-monitor" as const, label: "Brand Monitor", desc: "Monitor your company's reputation across media + AI" },
    // Task ID: 5-standby — the 3 offers below are on standby.
    // They still appear in the list (greyed-out + Standby badge)
    // so prospects know what's coming back, but they cannot be
    // selected. Their consoles render a StandbyBanner.
    { value: "market-competitor" as const, label: "Market & Competitor", desc: "Brand + up to 10 competitors + sector intelligence", standby: true },
    { value: "investment-bank" as const, label: "Investment Bank", desc: "Due diligence, M&A, portfolio roll-up, ESG screening", standby: true },
    { value: "harch-alpha" as const, label: "Harch Alpha", desc: "Track sentiment-to-price correlation on Moroccan assets", standby: true },
  ];

  const companySizes = [
    { value: "startup", label: "Startup", desc: "1-10 employees" },
    { value: "sme", label: "SME", desc: "11-50 employees" },
    { value: "mid-market", label: "Mid-market", desc: "51-500 employees" },
    { value: "enterprise", label: "Enterprise", desc: "500+ employees" },
  ];

  const budgets = [
    "< 5K MAD/month",
    "5K - 15K MAD/month",
    "15K - 40K MAD/month",
    "40K - 75K MAD/month",
    "75K+ MAD/month",
  ];

  const referralSources = [
    "LinkedIn",
    "Twitter/X",
    "Google search",
    "Word of mouth",
    "Press article",
    "Conference/event",
    "Other",
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <a href="/atelier" style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase", textDecoration: "none" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </a>
      </header>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>
          {/* ─── Mode switcher ─────────────────────────────────── */}
          <div style={{ display: "flex", gap: "0", marginBottom: "32px", border: `1px solid ${C.border}`, borderRadius: "6px", overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setMode("signup")}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: mode === "signup" ? C.bgSubtle : "transparent",
                border: "none",
                borderRight: `1px solid ${C.border}`,
                cursor: "pointer",
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: mode === "signup" ? C.cta : C.textMuted,
                transition: "all 0.15s",
              }}
            >
              Sign up with work email
            </button>
            <button
              type="button"
              onClick={() => setMode("request")}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: mode === "request" ? C.bgSubtle : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: C.fontMono,
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: mode === "request" ? C.cta : C.textMuted,
                transition: "all 0.15s",
              }}
            >
              Request access
            </button>
          </div>

          {/* ═══ SIGN UP MODE ════════════════════════════════════ */}
          {mode === "signup" && (
            <form onSubmit={handleSignupSubmit}>
              <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                Self-service registration
              </div>
              <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
                Sign up with your work email.
              </h1>
              <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.5, marginBottom: "24px" }}>
                If your company is already registered with Harch Atelier, you can create your account instantly. We&apos;ll match your email domain to your organization.
              </p>

              {/* Email + Name */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={labelStyle}>Full name *</label>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Jane Doe" required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Work email *</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="jane@company.com" required style={inputStyle} />
                </div>
              </div>

              {/* Password — only shown when domain is known + has subscription */}
              {domainStatus.kind === "known" && domainStatus.hasSubscription && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Password *</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Domain feedback banner */}
              <DomainFeedbackBanner status={domainStatus} />

              {/* Error message */}
              {signupStatus === "error" && signupError && (
                <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger, marginBottom: "16px", marginTop: "16px" }}>
                  {signupError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmitSignup || signupStatus === "loading"}
                style={btnStyle(!canSubmitSignup || signupStatus === "loading")}
              >
                {signupStatus === "loading" ? "Creating account..." : "Create account"}
              </button>

              {/* Fallback hint */}
              {domainStatus.kind === "unknown" && (
                <div style={{ marginTop: "16px", fontSize: "12px", color: C.textMuted, textAlign: "center" }}>
                  Your company isn&apos;t registered yet.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("request");
                      setFormData((prev) => ({ ...prev, email: signupEmail, name: signupName }));
                    }}
                    style={{ background: "none", border: "none", color: C.cta, cursor: "pointer", fontSize: "12px", fontWeight: 600, padding: 0, textDecoration: "underline" }}
                  >
                    Request access instead →
                  </button>
                </div>
              )}

              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <a href="/atelier/login" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>Already have an account? Sign in</a>
              </div>
            </form>
          )}

          {/* ═══ REQUEST ACCESS MODE (existing 3-step form) ══════ */}
          {mode === "request" && (
            <>
              {/* Progress indicator */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "32px" }}>
                {[1, 2, 3].map((s) => (
                  <div key={s} style={{
                    flex: 1,
                    height: "3px",
                    background: s <= step ? C.cta : C.border,
                    borderRadius: "2px",
                    transition: "background 0.2s",
                  }} />
                ))}
              </div>

              <form onSubmit={handleRequestAccessSubmit}>
                {/* Step 1: Account type + basic info */}
                {step === 1 && (
                  <div>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Step 1 of 3 · Account type
                    </div>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
                      What do you need?
                    </h1>
                    <p style={{ fontSize: "14px", color: C.textBody, lineHeight: 1.5, marginBottom: "24px" }}>
                      Choose your account type. You can&apos;t change this later without contacting us.
                    </p>

                    {/* Account type cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                      {accountTypes.map((opt) => {
                        const isStandby = !!(opt as { standby?: boolean }).standby;
                        const isSelected = formData.accountType === opt.value && !isStandby;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            disabled={isStandby}
                            onClick={() => !isStandby && update("accountType", opt.value)}
                            style={{
                              padding: "16px 20px",
                              background: isSelected ? C.bgSubtle : "transparent",
                              border: `1px solid ${isSelected ? C.accent : C.border}`,
                              borderRadius: "6px",
                              cursor: isStandby ? "not-allowed" : "pointer",
                              textAlign: "left",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              transition: "all 0.15s",
                              opacity: isStandby ? 0.55 : 1,
                              position: "relative",
                            }}
                          >
                            <div style={{
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              border: `2px solid ${isSelected ? C.accent : C.border}`,
                              flexShrink: 0,
                              position: "relative",
                            }}>
                              {isSelected && (
                                <div style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "2px",
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: C.accent,
                                }} />
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "14px", fontWeight: 600, color: isSelected ? C.accent : C.text }}>{opt.label}</div>
                              <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{opt.desc}</div>
                            </div>
                            {isStandby && (
                              <span
                                style={{
                                  fontFamily: C.fontMono,
                                  fontSize: "9px",
                                  fontWeight: 700,
                                  letterSpacing: "0.14em",
                                  textTransform: "uppercase",
                                  color: C.warningText,
                                  background: C.warningBg,
                                  border: `1px solid ${C.warningBorder}`,
                                  borderRadius: "4px",
                                  padding: "3px 7px",
                                  lineHeight: 1,
                                  flexShrink: 0,
                                }}
                              >
                                Standby
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Email + Name */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <label style={labelStyle}>Full name *</label>
                        <input type="text" value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" required style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email *</label>
                        <input type="email" value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@company.com" required style={inputStyle} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "12px" }}>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Phone (WhatsApp)</label>
                        <input type="tel" value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+212 6XX XXX XXX" style={inputStyle} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={labelStyle}>Country</label>
                        <input type="text" value={formData.country} onChange={(e) => update("country", e.target.value)} placeholder="Morocco" style={inputStyle} />
                      </div>
                    </div>

                    <button type="button" onClick={() => setStep(2)} disabled={!formData.email || !formData.name} style={btnStyle(!formData.email || !formData.name)}>
                      Continue →
                    </button>
                  </div>
                )}

                {/* Step 2: Company + size + budget */}
                {step === 2 && (
                  <div>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Step 2 of 3 · Company info
                    </div>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
                      Tell us about you.
                    </h1>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Company</label>
                      <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} placeholder="Bank of Africa" style={inputStyle} />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Your role</label>
                      <input type="text" value={formData.role} onChange={(e) => update("role", e.target.value)} placeholder="Comms Director, CEO, Analyst..." style={inputStyle} />
                    </div>

                    {/* Company size */}
                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Company size</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 120px), 1fr))", gap: "8px" }}>
                        {companySizes.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => update("companySize", opt.value)}
                            style={{
                              padding: "10px 12px",
                              background: formData.companySize === opt.value ? C.bgSubtle : "transparent",
                              border: `1px solid ${formData.companySize === opt.value ? C.accent : C.border}`,
                              borderRadius: "4px",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <div style={{ fontSize: "12px", fontWeight: 600, color: formData.companySize === opt.value ? C.accent : C.text }}>{opt.label}</div>
                            <div style={{ fontSize: "10px", color: C.textMuted }}>{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget */}
                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Monthly budget</label>
                      <select value={formData.budget} onChange={(e) => update("budget", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">Select a range</option>
                        {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={() => setStep(1)} style={{ ...btnStyle(false), background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, flex: 1 }}>
                        ← Back
                      </button>
                      <button type="button" onClick={() => setStep(3)} style={{ ...btnStyle(false), flex: 2 }}>
                        Continue →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Use case + referral + message */}
                {step === 3 && (
                  <div>
                    <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Step 3 of 3 · Almost there
                    </div>
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
                      What are you looking for?
                    </h1>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>Use case</label>
                      <textarea value={formData.useCase} onChange={(e) => update("useCase", e.target.value)} placeholder="I want to monitor what media and AI say about my company..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={labelStyle}>How did you hear about us?</label>
                      <select value={formData.referralSource} onChange={(e) => update("referralSource", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                        <option value="">Select a source</option>
                        {referralSources.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                      <label style={labelStyle}>Anything else? (optional)</label>
                      <textarea value={formData.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell us about your specific needs..." rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                    </div>

                    {status === "error" && (
                      <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger, marginBottom: "16px" }}>
                        {errorMsg}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button type="button" onClick={() => setStep(2)} style={{ ...btnStyle(false), background: "transparent", border: `1px solid ${C.border}`, color: C.textBody, flex: 1 }}>
                        ← Back
                      </button>
                      <button type="submit" disabled={status === "loading"} style={{ ...btnStyle(status === "loading"), flex: 2 }}>
                        {status === "loading" ? "Submitting..." : "Submit request"}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </>
          )}

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <a href="/atelier" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>← Back to Harch Atelier</a>
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DOMAIN FEEDBACK BANNER — inline validation result
// ═══════════════════════════════════════════════════════════════

function DomainFeedbackBanner({ status }: { status: DomainStatus }) {
  if (status.kind === "idle" || status.kind === "loading") {
    return null;
  }

  // Color palette per status kind
  const palette = {
    disposable: { bg: C.warningBg, border: C.warningBorder, text: C.warningText, icon: "!" },
    unknown: { bg: C.warningBg, border: C.warningBorder, text: C.warningText, icon: "?" },
    known: { bg: C.successBg, border: C.success, text: C.success, icon: "OK" },
    error: { bg: C.dangerBg, border: `${C.danger}30`, text: C.danger, icon: "x" },
  } as const;

  const p = palette[status.kind];

  return (
    <div style={{
      padding: "14px 16px",
      background: p.bg,
      border: `1px solid ${p.border}`,
      borderRadius: "6px",
      marginBottom: "16px",
      marginTop: "8px",
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    }}>
      <div style={{
        flexShrink: 0,
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: p.text,
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: 700,
        fontFamily: C.fontMono,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}>
        {p.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "13px", color: p.text, fontWeight: 600, marginBottom: "2px" }}>
          {status.kind === "known" && status.hasSubscription && `You're joining ${status.companyName}.`}
          {status.kind === "known" && !status.hasSubscription && `${status.companyName} is registered.`}
          {status.kind === "unknown" && "Unknown company domain."}
          {status.kind === "disposable" && "Use your work email."}
          {status.kind === "error" && "Lookup failed."}
        </div>
        <div style={{ fontSize: "12px", color: C.textBody, lineHeight: 1.5 }}>
          {status.message}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: "'Space Mono', monospace",
  color: "#737373",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  marginBottom: "6px",
};

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

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "14px 20px",
    background: disabled ? "#e5e5e5" : "#10b981",
    border: "none",
    color: "#ffffff",
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: "4px",
    transition: "background 0.15s",
  };
}

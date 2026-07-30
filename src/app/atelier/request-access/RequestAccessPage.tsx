"use client";

import { useState } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  REQUEST ACCESS — Public form (competitor-grade)
//
//  Copied patterns from Otterly, Nightwatch, Athena, Goodie:
//  - Account type selector (3 cards, like Athena's vertical tabs)
//  - Company size selector (like Nightwatch's team size)
//  - Budget range (like Otterly's pricing tiers)
//  - Use case textarea (like Goodie's "what are you looking for")
//  - Referral source (like Athena's "how did you hear")
//  - Phone for WhatsApp (our differentiator — competitors don't)
// ═══════════════════════════════════════════════════════════════

export function RequestAccessPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    company: "",
    role: "",
    accountType: "enterprise" as "trader" | "enterprise" | "investor",
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (status === "success") {
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
    { value: "enterprise" as const, label: "Enterprise", desc: "Monitor your company's reputation across media + AI" },
    { value: "trader" as const, label: "Trader", desc: "Track sentiment-to-price correlation on Moroccan assets" },
    { value: "investor" as const, label: "Investor", desc: "Due diligence, portfolio roll-up, ESG screening" },
  ];

  const companySizes = [
    { value: "startup", label: "Startup", desc: "1-10 employees" },
    { value: "sme", label: "SME", desc: "11-50 employees" },
    { value: "mid-market", label: "Mid-market", desc: "51-500 employees" },
    { value: "enterprise", label: "Enterprise", desc: "500+ employees" },
  ];

  const budgets = [
    "< 1K MAD/month",
    "1K - 5K MAD/month",
    "5K - 15K MAD/month",
    "15K - 50K MAD/month",
    "50K+ MAD/month",
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

          <form onSubmit={handleSubmit}>
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
                  {accountTypes.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update("accountType", opt.value)}
                      style={{
                        padding: "16px 20px",
                        background: formData.accountType === opt.value ? C.bgSubtle : "transparent",
                        border: `1px solid ${formData.accountType === opt.value ? C.accent : C.border}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        border: `2px solid ${formData.accountType === opt.value ? C.accent : C.border}`,
                        flexShrink: 0,
                        position: "relative",
                      }}>
                        {formData.accountType === opt.value && (
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
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: formData.accountType === opt.value ? C.accent : C.text }}>{opt.label}</div>
                        <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
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

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <a href="/atelier" style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}>← Back to Harch Atelier</a>
          </div>
        </div>
      </main>
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

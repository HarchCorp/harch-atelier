"use client";

import { useState } from "react";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  REQUEST ACCESS — Public form
//
//  Anyone can submit a request. Admin reviews and sends invitations.
//  No self-signup — access is granted by the Harch Atelier team.
// ═══════════════════════════════════════════════════════════════

export function RequestAccessPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) {
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
        body: JSON.stringify({ email, name, company, role, message }),
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
            Thank you, {name.split(" ")[0]}.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.6, marginBottom: "32px" }}>
            Your request has been received. The Harch Atelier team will review it and send you an access link if approved — usually within 48 hours.
          </p>
          <a href="/atelier" style={{ display: "inline-block", padding: "12px 24px", background: C.cta, color: "#ffffff", fontSize: "13px", fontWeight: 600, textDecoration: "none", borderRadius: "4px" }}>
            Back to Harch Atelier
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: C.fontSans }}>
      <header style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}` }}>
        <a href="/atelier" style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, letterSpacing: "0.18em", color: C.text, textTransform: "uppercase", textDecoration: "none" }}>
          HarchIQ<span style={{ color: C.accent, marginLeft: "8px" }}>Console</span>
        </a>
      </header>

      <main style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ maxWidth: "480px", width: "100%" }}>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", color: C.textMuted, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "12px" }}>
            Request access
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 700, color: C.text, letterSpacing: "-0.03em", margin: "0 0 12px" }}>
            Get your Console access.
          </h1>
          <p style={{ fontSize: "15px", color: C.textBody, lineHeight: 1.5, marginBottom: "32px" }}>
            HarchIQ Console access is granted by the Harch Atelier team only. Fill this form and we&apos;ll get back to you within 48 hours.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Full name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Bank of Africa" style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Your role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Comms Director, CEO, Analyst..." style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontFamily: C.fontMono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Message (optional)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us what you need..." rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>

            {status === "error" && (
              <div style={{ padding: "12px 14px", background: C.dangerBg, border: `1px solid ${C.danger}30`, borderRadius: "4px", fontSize: "13px", color: C.danger }}>
                {errorMsg}
              </div>
            )}

            <button type="submit" disabled={status === "loading"} style={{ padding: "14px 20px", background: status === "loading" ? C.border : C.cta, border: "none", color: "#ffffff", fontFamily: C.fontSans, fontSize: "14px", fontWeight: 600, cursor: status === "loading" ? "not-allowed" : "pointer", borderRadius: "4px" }}>
              {status === "loading" ? "Submitting..." : "Submit request"}
            </button>
          </form>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
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

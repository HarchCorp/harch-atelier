"use client";

import { useState } from "react";
import { ReputationAuditTemplate } from "../components/pdf-templates/ReputationAuditTemplate";
import { ColdOutreachEmail, WhatsAppDigestTemplate } from "../components/email-templates/Templates";
import { SAMPLE_DATA, TEMPLATE_REGISTRY } from "../templates/registry";

// ─── TEMPLATE GALLERY (CLIENT COMPONENT) ─────────────────────────
// Extracted from page.tsx so the page can be a server component
// with metadata + JSON-LD. This file owns the interactivity
// (active template selector state) only.

export default function TemplatesGallery() {
  const [activeTemplate, setActiveTemplate] = useState<string>("reputation-audit");

  return (
    <div style={{ background: "#FAFAFA", minHeight: "100vh", padding: "40px 32px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#4A5D6E", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Templates
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#0A0A0A", margin: "0 0 16px" }}>
            Report & delivery templates
          </h1>
          <p style={{ fontSize: "18px", color: "#525252", maxWidth: "640px", lineHeight: 1.6 }}>
            Reusable templates for every deliverable. Data flows in from monitoring agents,
            templates render with real numbers. Teaser mode shows partial data + blur for prospecting.
          </p>
        </div>

        {/* Template selector */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "48px", flexWrap: "wrap" }}>
          {Object.entries(TEMPLATE_REGISTRY).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setActiveTemplate(key)}
              style={{
                padding: "12px 20px",
                background: activeTemplate === key ? "#4A7B5F" : "#FFFFFF",
                color: activeTemplate === key ? "#FFFFFF" : "#525252",
                border: `1px solid ${activeTemplate === key ? "#4A7B5F" : "#E5E5E5"}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {template.name}
            </button>
          ))}
        </div>

        {/* Template info */}
        {activeTemplate && TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY] && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", marginBottom: "48px" }}>
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "28px" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px" }}>
                {TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY].outputFormat}
              </div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#0A0A0A", marginBottom: "12px" }}>
                {TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY].name}
              </h3>
              <p style={{ fontSize: "14px", color: "#525252", lineHeight: 1.6, marginBottom: "20px" }}>
                {TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY].description}
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A" }}>
                <div>📄 {TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY].pages} pages</div>
                <div>⏱ {TEMPLATE_REGISTRY[activeTemplate as keyof typeof TEMPLATE_REGISTRY].deliveryTime}</div>
              </div>
            </div>

            {/* Live preview */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "28px", overflow: "hidden" }}>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "20px" }}>
                Live Preview — Teaser Mode (blur)
              </div>

              {activeTemplate === "reputation-audit" && (
                <div style={{ maxHeight: "600px", overflowY: "auto", paddingRight: "8px" }}>
                  <ReputationAuditTemplate data={SAMPLE_DATA.bank_of_africa} teaser={true} />
                </div>
              )}

              {activeTemplate === "cold-email" && (
                <ColdOutreachEmail data={{
                  recipientName: "John Doe",
                  recipientCompany: "Bank of Africa",
                  sector: "Banking",
                  reputationScore: 78,
                  sentimentPositive: 68,
                  emergingRisk: "Banking fees discussion",
                  competitorName: "Attijariwafa Bank",
                  competitorScore: 84,
                }} />
              )}

              {activeTemplate === "whatsapp-daily" && (
                <WhatsAppDigestTemplate
                  companyName="Bank of Africa"
                  date="18/07"
                  articles={12}
                  positive={8}
                  neutral={3}
                  negative={1}
                  mentions={340}
                  aiRank="#2"
                  alertTopic="frais bancaires"
                  alertIncrease={47}
                  competitor="Attijariwafa"
                />
              )}

              {!["reputation-audit", "cold-email", "whatsapp-daily"].includes(activeTemplate) && (
                <div style={{ padding: "60px 20px", textAlign: "center", color: "#71717A" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
                  <div style={{ fontSize: "15px" }}>Template preview coming soon</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Data flow diagram */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E5E5", borderRadius: "8px", padding: "40px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, color: "#0A0A0A", marginBottom: "32px" }}>
            How data flows into templates
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            {[
              { label: "Scrape", desc: "30+ media sources", icon: "📡" },
              { label: "Analyze", desc: "HarchIQ sentiment + trends", icon: "🧠" },
              { label: "Fill", desc: "Data → template fields", icon: "📋" },
              { label: "Render", desc: "PDF / WhatsApp / Email", icon: "📄" },
              { label: "Deliver", desc: "Client receives output", icon: "🚀" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{
                  background: "#FAFAFA", border: "1px solid #E5E5E5", borderRadius: "8px",
                  padding: "20px 24px", textAlign: "center", minWidth: "140px",
                }}>
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>{step.icon}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A" }}>{step.label}</div>
                  <div style={{ fontSize: "12px", color: "#71717A", marginTop: "4px" }}>{step.desc}</div>
                </div>
                {i < 4 && <div style={{ fontSize: "20px", color: "#4A5D6E" }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CardGrid, CTABottom } from "../ApproachShared";

const C = { sage: "#4A7B5F", accent: "#4A5D6E", amber: "#8A5520", red: "#A0524B" };

export default function OurCommitmentPage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Our Commitment"
        title={<>Security, compliance, and <span style={{ color: C.amber }}>customer success.</span></>}
        subtitle="We monitor the reputations of Morocco's largest companies. That means we hold ourselves to the same standards our clients are held to. Here's our commitment to you — in writing."
        color={C.amber}
      />

      <Section>
        <SectionHeader label="The numbers" title="What we promise." />
        <StatsGrid color={C.amber} stats={[
          { value: "99.9%", label: "uptime SLA" },
          { value: "<5min", label: "alert latency" },
          { value: "24/7", label: "incident response" },
          { value: "72h", label: "breach notification" },
        ]} />
      </Section>

      <Section alt>
        <SectionHeader label="Security" title="How we protect your data." />
        <CardGrid color={C.amber} items={[
          { title: "Encryption everywhere", desc: "TLS 1.3 in transit, AES-256 at rest. Encrypted secrets via HashiCorp Vault. Customer data isolated per tenant.", icon: "🔒" },
          { title: "Access control", desc: "Role-based access control (RBAC). SSO via Google Workspace, Microsoft 365. MFA enforced. Just-in-time access for engineers.", icon: "🔑" },
          { title: "Infrastructure", desc: "Hosted on Vercel (SOC 2 Type II). Database: Supabase (ISO 27001, SOC 2). Daily encrypted backups, 30-day retention.", icon: "⚙" },
          { title: "Audit & monitoring", desc: "All access logged and retained 1 year. Real-time anomaly detection. Quarterly access reviews. Annual penetration testing.", icon: "▲" },
        ]} />
      </Section>

      <Section>
        <SectionHeader label="Compliance" title="Standards we adhere to." />
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}>
          {[
            { name: "GDPR", desc: "EU General Data Protection Regulation", status: "Compliant", icon: "◆" },
            { name: "Loi 09-08", desc: "Moroccan Data Protection Law (CNDP)", status: "Compliant", icon: "◆" },
            { name: "ISO 27001", desc: "Information Security Management", status: "In progress (Q4 2026)", icon: "▲" },
            { name: "SOC 2 Type II", desc: "Service Organization Controls", status: "In progress (Q1 2027)", icon: "▲" },
            { name: "ISO 9001", desc: "Quality Management System", status: "Planned", icon: "◐" },
          ].map(c => (
            <div key={c.name} style={{
              padding: "24px", background: "#FFFFFF",
              border: "1px solid #E5E5E5", borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "flex-start",
                marginBottom: "12px",
              }}>
                <span style={{ fontSize: "16px", color: C.amber, fontFamily: "'JetBrains Mono', monospace" }}>{c.icon}</span>
                <span style={{
                  fontSize: "10px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
                  padding: "3px 8px", borderRadius: "100px",
                  background: c.status === "Compliant" ? "rgba(74,123,95,0.1)" :
                              c.status.includes("In progress") ? "rgba(184,115,51,0.1)" : "rgba(74,93,110,0.1)",
                  color: c.status === "Compliant" ? C.sage :
                         c.status.includes("In progress") ? C.amber : C.accent,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {c.status}
                </span>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0A0A0A", marginBottom: "6px" }}>{c.name}</div>
              <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "24px" }}>
          <a href="/atelier/trust" style={{
            display: "inline-block", padding: "12px 24px",
            background: C.amber, color: "#FFFFFF",
            fontSize: "13px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Visit Trust Center →
          </a>
        </div>
      </Section>

      <Section alt>
        <SectionHeader label="Customer success" title="Your success is our success." />
        <div style={{
          padding: "24px", background: "#FFFFFF",
          border: "1px solid #E5E5E5", borderRadius: "16px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {[
              { title: "Onboarding in 7 days", desc: "From contract signature to first dashboard in 7 calendar days. Dedicated onboarding manager for Sovereign tier." },
              { title: "Response time SLAs", desc: "Corporate: 2 business hours. Sovereign: 30 minutes. Critical incidents: immediate, 24/7." },
              { title: "Quarterly business reviews", desc: "Every Sovereign customer gets a QBR with senior analysts. We review your metrics, adjust HarchIQ training, plan next quarter." },
              { title: "Customer success manager", desc: "Corporate and Sovereign get a dedicated CSM. They know your business, your team, and your goals." },
              { title: "Free HarchIQ retraining", desc: "Quarterly retraining session where we update your entity library, topics, and sentiment rules. Included in all tiers." },
              { title: "Money-back guarantee", desc: "If you're not satisfied in the first 60 days, we refund 100% of your subscription. No questions asked." },
              { title: "Product roadmap input", desc: "Sovereign customers get quarterly roadmap reviews and can request features. Top 5 requests ship within 90 days." },
              { title: "Training & certification", desc: "Free Harch Atelier Certified Analyst program for your team. 8-hour course, online or in-person at CFC." },
            ].map(item => (
              <div key={item.title} style={{
                padding: "20px", background: "#FAFAFA",
                border: "1px solid #E5E5E5", borderRadius: "10px",
              }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0A0A0A", marginBottom: "8px" }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.5 }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeader label="Incident response" title="When things go wrong." />
        <div style={{
          display: "flex", flexDirection: "column", gap: "12px",
          maxWidth: "900px",
        }}>
          {[
            { t: "T+0", title: "Incident detected", desc: "24/7 monitoring catches the issue. On-call engineer paged within 5 minutes." },
            { t: "T+15min", title: "Triage & classify", desc: "Severity assigned (P0/P1/P2/P3). Incident commander designated." },
            { t: "T+30min", title: "Customer notification (P0/P1)", desc: "Affected customers notified via email + WhatsApp. Status page updated." },
            { t: "T+1h", title: "Mitigation deployed", desc: "Workaround or fix deployed. Status page updated every 30 minutes." },
            { t: "T+4h", title: "Resolution", desc: "Root cause identified and fixed. Service restored." },
            { t: "T+72h", title: "Post-incident review", desc: "Detailed written post-mortem published to affected customers. Action items tracked to completion." },
            { t: "T+14d", title: "Process improvement", desc: "Lessons learned integrated into runbooks. Prevention measures deployed." },
          ].map(step => (
            <div key={step.t} style={{
              display: "grid", gridTemplateColumns: "100px 1fr",
              gap: "20px", padding: "20px 24px",
              background: "#FFFFFF", border: "1px solid #E5E5E5",
              borderRadius: "10px",
              borderLeft: `4px solid ${C.amber}`,
            }}>
              <span style={{
                fontSize: "16px", fontWeight: 700, color: C.amber,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {step.t}
              </span>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0A0A0A", marginBottom: "4px" }}>
                  {step.title}
                </div>
                <div style={{ fontSize: "13px", color: "#525252", lineHeight: 1.55 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <CTABottom
        title="Trust is earned, not claimed."
        subtitle="Visit our Trust Center for full security documentation, or email security@harchcorp.com with any questions."
        href="/atelier/trust"
        cta="Visit Trust Center →"
        color={C.amber}
      />
    </ApproachPage>
  );
}

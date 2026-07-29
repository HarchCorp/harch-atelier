"use client";

import { ApproachPage, Hero, Section, SectionHeader, CTABottom } from "../../approach/ApproachShared";

const C = {
  sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B",
  sageBright: "#6FA386", text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  border: "#E5E5E5", borderLight: "#F0F0F0", surface: "#FFFFFF", bg: "#FAFAFA",
};

// ═══════════════════════════════════════════════════════════════
//  INTEGRATIONS — Product Page
//  Connect Harch AI to BI tools, comms platforms, and AI agents
// ═══════════════════════════════════════════════════════════════

type Category = "Communication" | "BI & Analytics" | "AI & Automation";

interface Integration {
  name: string;
  desc: string;
  category: Category;
  icon: string;
  color: string;
}

const INTEGRATIONS: Integration[] = [
  // Communication
  { name: "Slack", desc: "Send alerts to channels", category: "Communication", icon: "S", color: C.amber },
  { name: "Microsoft Teams", desc: "Post briefings to teams", category: "Communication", icon: "T", color: C.accent },
  { name: "WhatsApp Business", desc: "Daily digest at 7am", category: "Communication", icon: "W", color: C.sage },
  { name: "Email (SMTP)", desc: "Crisis alerts + weekly reports", category: "Communication", icon: "@", color: C.red },

  // BI & Analytics
  { name: "Tableau", desc: "Connect via Web Data Connector", category: "BI & Analytics", icon: "Tb", color: C.accent },
  { name: "Power BI", desc: "REST API connector", category: "BI & Analytics", icon: "Pb", color: C.amber },
  { name: "Looker", desc: "LookML integration", category: "BI & Analytics", icon: "Lk", color: C.sage },
  { name: "Google Sheets", desc: "Apps Script add-on", category: "BI & Analytics", icon: "Gs", color: C.sageBright },

  // AI & Automation
  { name: "Claude (MCP)", desc: "Ask HarchIQ in Claude", category: "AI & Automation", icon: "Cl", color: C.amber },
  { name: "ChatGPT (Custom GPT)", desc: "Query reputation data", category: "AI & Automation", icon: "Gp", color: C.sage },
  { name: "Cursor", desc: "MCP server for code assistant", category: "AI & Automation", icon: "Cu", color: C.accent },
  { name: "Zapier", desc: "1000+ app connections", category: "AI & Automation", icon: "Zp", color: C.red },
];

const CATEGORY_META: { name: Category; desc: string; color: string }[] = [
  { name: "Communication", desc: "Push alerts, briefings, and daily digests where your team already works.", color: C.sage },
  { name: "BI & Analytics", desc: "Pipe Harch reputation scores and risk signals into your warehouse and dashboards.", color: C.accent },
  { name: "AI & Automation", desc: "Let AI agents and automation platforms query Harch data on demand.", color: C.amber },
];

const STEPS: { n: string; title: string; desc: string; color: string }[] = [
  { n: "01", title: "Generate an API key", desc: "Open the Harch dashboard, head to Settings → API, and spin up a scoped key for the integration you want to connect. Pro plans get 10K calls / day; Enterprise gets 100K.", color: C.sage },
  { n: "02", title: "Paste the key into the integration", desc: "Each integration has a one-line config — paste the API key, pick the company or watchlist you want to sync, and save. Most setups take under 2 minutes.", color: C.accent },
  { n: "03", title: "Data flows in real-time", desc: "Reputation scores, risk events, sentiment shifts, and article matches start streaming within minutes. Webhooks fire on score changes; BI tools refresh on your schedule.", color: C.amber },
];

function IntegrationCard({ item }: { item: Integration }) {
  return (
    <div style={{
      padding: "24px",
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      borderTop: `3px solid ${item.color}`,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
        <div style={{
          width: "44px", height: "44px",
          borderRadius: "10px",
          background: `${item.color}15`,
          color: item.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "15px", fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}>
          {item.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em", margin: 0 }}>
            {item.name}
          </h3>
          <span style={{
            display: "inline-block",
            marginTop: "4px",
            fontSize: "10px",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: item.color,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {item.category}
          </span>
        </div>
      </div>
      <p style={{ fontSize: "13.5px", color: C.textSec, lineHeight: 1.55, margin: "0 0 20px", flex: 1 }}>
        {item.desc}
      </p>
      <a
        href="/atelier/audit"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          fontWeight: 600,
          color: item.color,
          textDecoration: "none",
          fontFamily: "'Inter', sans-serif",
          alignSelf: "flex-start",
        }}
      >
        Connect →
      </a>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <ApproachPage>
      <Hero
        eyebrow="Product · Integrations"
        title={<>Connect Harch AI to <span style={{ color: C.sage }}>your favorite tools.</span></>}
        subtitle="Push reputation scores into your BI dashboards, route crisis alerts to Slack and WhatsApp, and let Claude, ChatGPT, and Cursor pull live Harch data on demand. 12 native integrations plus a REST API and MCP server for everything else."
        color={C.sage}
      />

      {/* INTEGRATION GRID — 3 categories */}
      <Section>
        <SectionHeader label="Integration library" title="12 native integrations, organized by what they do." />
        {CATEGORY_META.map(cat => {
          const items = INTEGRATIONS.filter(i => i.category === cat.name);
          return (
            <div key={cat.name} style={{ marginBottom: "48px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: "20px",
                paddingBottom: "14px",
                borderBottom: `1px solid ${C.borderLight}`,
              }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: cat.color,
                  flexShrink: 0,
                }} />
                <div>
                  <h3 style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: C.text,
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}>
                    {cat.name}
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: C.textSec,
                    lineHeight: 1.5,
                    margin: "4px 0 0",
                    maxWidth: "640px",
                  }}>
                    {cat.desc}
                  </p>
                </div>
              </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
              }}>
                {items.map(item => (
                  <IntegrationCard key={item.name} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      {/* HOW IT WORKS — 3 STEPS */}
      <Section alt>
        <SectionHeader label="How it works" title="Connect any integration in 3 steps." />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {STEPS.map(step => (
            <div key={step.n} style={{
              padding: "32px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
              borderTop: `3px solid ${step.color}`,
              position: "relative",
            }}>
              <div style={{
                fontSize: "44px",
                fontWeight: 800,
                color: `${step.color}40`,
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
                marginBottom: "20px",
                letterSpacing: "-0.04em",
              }}>
                {step.n}
              </div>
              <h3 style={{
                fontSize: "16px",
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.01em",
                margin: "0 0 12px",
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "14px",
                color: C.textSec,
                lineHeight: 1.6,
                margin: 0,
              }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* CUSTOM INTEGRATION */}
      <Section>
        <div style={{
          padding: "56px 48px",
          background: "#0A0A0A",
          color: "#FFFFFF",
          borderRadius: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "48px",
          alignItems: "center",
        }}>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.sageBright,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              Custom integration
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
            }}>
              Don&apos;t see your tool? Build with our REST API or MCP server.
            </h2>
            <p style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              marginBottom: "28px",
              maxWidth: "520px",
            }}>
              Every endpoint you need to pull reputation scores, detect risks, search articles, and compare companies is documented in our developer portal. Ship a working integration in an afternoon.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="/atelier/products/api-mcp"
                style={{
                  display: "inline-block",
                  padding: "14px 24px",
                  background: C.sage,
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Explore the API →
              </a>
              <a
                href="/atelier/audit"
                style={{
                  display: "inline-block",
                  padding: "14px 24px",
                  background: "transparent",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontFamily: "'Inter', sans-serif",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                Talk to engineering
              </a>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Quick start · REST API
            </div>
            <div style={{
              background: "#000000",
              color: "#E5E5E5",
              borderRadius: "10px",
              padding: "20px 22px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "13px",
              lineHeight: 1.7,
              border: "1px solid #1F1F1F",
              overflowX: "auto",
              whiteSpace: "pre",
            }}>
{`# Get a reputation score
curl -H "Authorization: Bearer sk_..." \\
     https://api.harchcorp.com/v1/reputation/score \\
     ?company=Bank+of+Africa

# 200 OK
{
  "company": "Bank of Africa",
  "score": 78,
  "pillars": { ... },
  "sentiment": { ... }
}`}
            </div>
          </div>
        </div>
      </Section>

      <CTABottom
        title="Request an integration demo."
        subtitle="Tell us which tools you already run. We'll show you the live data flow from Harch into your stack — usually in under 30 minutes."
        href="/atelier/audit"
        cta="Request integration demo →"
        color={C.sage}
      />
    </ApproachPage>
  );
}

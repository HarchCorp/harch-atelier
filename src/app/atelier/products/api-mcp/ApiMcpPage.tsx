"use client";

import { useState } from "react";
import { ApproachPage, Hero, Section, SectionHeader, StatsGrid, CTABottom } from "../../approach/ApproachShared";

const C = {
  sage: "#4A7B5F", accent: "#4A5D6E", amber: "#B87333", red: "#A0524B",
  sageBright: "#6FA386", text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  border: "#E5E5E5", borderLight: "#F0F0F0", surface: "#FFFFFF", bg: "#FAFAFA",
};

// ═══════════════════════════════════════════════════════════════
//  API & MCP INTEGRATIONS — Product Page
//  REST API, MCP server, webhooks, SDKs
// ═══════════════════════════════════════════════════════════════

const CODE_EXAMPLES: { id: string; label: string; lang: string; code: string }[] = [
  {
    id: "python",
    label: "Python",
    lang: "python",
    code: `from harch import HarchClient

client = HarchClient(api_key="sk_...")

result = client.reputation.score(company="Bank of Africa")
print(result.score)        # 78
print(result.pillars)      # {innovation: 82, performance: 76, purpose: 71}
print(result.sentiment)    # {positive: 0.68, neutral: 0.22, negative: 0.10}`,
  },
  {
    id: "typescript",
    label: "TypeScript",
    lang: "typescript",
    code: `import { HarchClient } from "@harch/sdk";

const client = new HarchClient({
  apiKey: process.env.HARCH_KEY,
});

const score = await client.reputation.score({
  company: "Bank of Africa",
});

console.log(score.score);        // 78
console.log(score.pillars);      // { innovation: 82, performance: 76, purpose: 71 }
console.log(score.sentiment);    // { positive: 0.68, neutral: 0.22, negative: 0.10 }`,
  },
  {
    id: "curl",
    label: "cURL",
    lang: "bash",
    code: `curl -H "Authorization: Bearer sk_..." \\
     "https://api.harchcorp.com/v1/reputation/score?company=Bank+of+Africa"

# Response:
# {
#   "company": "Bank of Africa",
#   "score": 78,
#   "pillars": { "innovation": 82, "performance": 76, "purpose": 71 },
#   "sentiment": { "positive": 0.68, "neutral": 0.22, "negative": 0.10 },
#   "as_of": "2026-07-15T09:30:00Z"
# }`,
  },
  {
    id: "mcp",
    label: "MCP",
    lang: "json",
    code: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_reputation_score",
    "arguments": {
      "company": "Bank of Africa"
    }
  }
}

# Available MCP tools:
#   - get_reputation_score
#   - get_reputation_pillars
#   - detect_risks
#   - analyze_sentiment
#   - search_articles
#   - compare_companies
#   - get_harch100_ranking`,
  },
];

const ENDPOINTS: { method: "GET" | "POST"; path: string; desc: string }[] = [
  { method: "GET", path: "/v1/reputation/score", desc: "Get company reputation score" },
  { method: "GET", path: "/v1/reputation/pillars", desc: "Get Innovation / Performance / Purpose pillars" },
  { method: "GET", path: "/v1/sentiment/analyze", desc: "Analyze sentiment of text" },
  { method: "GET", path: "/v1/risks/detect", desc: "Detect 32 risk categories" },
  { method: "GET", path: "/v1/articles/search", desc: "Search articles with filters" },
  { method: "GET", path: "/v1/companies/compare", desc: "Compare competitors" },
  { method: "POST", path: "/v1/alerts/subscribe", desc: "Subscribe to WhatsApp alerts" },
  { method: "GET", path: "/v1/harch100", desc: "Get Harch 100 ranking" },
];

const WEBHOOKS: { event: string; trigger: string; color: string }[] = [
  { event: "reputation.score_changed", trigger: "Score delta > 5 points", color: C.sage },
  { event: "risk.spike_detected", trigger: "Risk velocity > 50%", color: C.red },
  { event: "sentiment.shift_alert", trigger: "Sentiment shift > 10% in 24h", color: C.amber },
  { event: "narrative.emerging", trigger: "New narrative detected", color: C.accent },
];

const WEBHOOK_PAYLOAD = `{
  "event": "reputation.score_changed",
  "timestamp": "2026-07-15T09:30:00Z",
  "data": {
    "company": "Bank of Africa",
    "previous_score": 72,
    "current_score": 78,
    "delta": 6.0,
    "pillar_changes": {
      "innovation": 4,
      "performance": 8,
      "purpose": 6
    }
  },
  "delivery_id": "evt_01HZ8KQ3P4X2V7N9Y6B5C1D2E3"
}`;

const SDKS: { name: string; install: string; lang: string; color: string }[] = [
  { name: "Python", install: "pip install harch", lang: "python", color: C.sage },
  { name: "TypeScript", install: "npm install @harch/sdk", lang: "typescript", color: C.accent },
  { name: "Go", install: "go get github.com/harchcorp/harch-go", lang: "go", color: C.amber },
  { name: "Ruby", install: "gem install harch", lang: "ruby", color: C.red },
];

const MCP_CLIENTS: { name: string; desc: string; icon: string }[] = [
  { name: "Claude", desc: "Add Harch MCP server in Claude Desktop or claude.ai to query reputation data in conversation", icon: "C" },
  { name: "ChatGPT", desc: "Use the Harch Custom GPT or wire MCP server to ChatGPT for live reputation lookups", icon: "G" },
  { name: "Cursor", desc: "Drop-in MCP server for the Cursor code editor — fetch company data while you build", icon: "↗" },
  { name: "Windsurf", desc: "Add Harch MCP to Windsurf agents for reputation-aware research workflows", icon: "W" },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div style={{
      background: "#0A0A0A",
      color: "#E5E5E5",
      borderRadius: "12px",
      padding: "24px 28px",
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "13.5px",
      lineHeight: 1.7,
      overflowX: "auto",
      border: "1px solid #1F1F1F",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      whiteSpace: "pre",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #1F1F1F" }}>
        <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FF5F57" }} />
        <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#FEBC2E" }} />
        <span style={{ width: "11px", height: "11px", borderRadius: "50%", background: "#28C840" }} />
        <span style={{ marginLeft: "12px", fontSize: "11px", color: "#71717A", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {lang}
        </span>
      </div>
      <pre style={{ margin: 0, fontFamily: "inherit", fontSize: "inherit", lineHeight: "inherit", color: "inherit" }}>{code}</pre>
    </div>
  );
}

export default function ApiMcpPage() {
  const [activeTab, setActiveTab] = useState("python");
  const activeExample = CODE_EXAMPLES.find(e => e.id === activeTab) ?? CODE_EXAMPLES[0];

  return (
    <ApproachPage>
      <Hero
        eyebrow="Product · API & MCP Integrations"
        title={<>Build custom reputation intelligence <span style={{ color: C.accent }}>into your tools.</span></>}
        subtitle="REST API, an MCP server for AI agents, webhooks for real-time events, and official SDKs in 4 languages. Pull Harch reputation scores, risk signals, and sentiment into your BI stack, your CRM, or your AI assistant — wherever decisions get made."
        color={C.accent}
      />

      {/* STATS */}
      <Section>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <StatsGrid color={C.accent} stats={[
            { value: "10K", label: "API calls / day — Corporate plan" },
            { value: "100K", label: "API calls / day — Sovereign" },
            { value: "4", label: "official SDKs (Python, TS, Go, Ruby)" },
            { value: "99.9%", label: "API uptime SLA" },
          ]} />
        </div>
      </Section>

      {/* CODE EXAMPLES — 4 TABS */}
      <Section alt>
        <SectionHeader label="Quick start" title="Make your first call in 30 seconds." />
        <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "32px", maxWidth: "760px" }}>
          Pick a language, drop in your API key, and pull a reputation score for any company. Same shape across every SDK — switch languages without relearning the surface area.
        </p>

        {/* Tab switcher */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
          {CODE_EXAMPLES.map(tab => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: "10px 20px",
                  background: active ? C.accent : C.surface,
                  color: active ? "#FFFFFF" : C.textSec,
                  border: `1px solid ${active ? C.accent : C.border}`,
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <CodeBlock code={activeExample.code} lang={activeExample.lang} />
      </Section>

      {/* ENDPOINTS TABLE */}
      <Section>
        <SectionHeader label="Endpoints" title="8 endpoints that cover 90% of use cases." />
        <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "32px", maxWidth: "760px" }}>
          Every endpoint is rate-limited per API key, returns JSON, and is documented with request samples in Python, TypeScript, cURL, and MCP.
        </p>
        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          background: C.surface,
        }}>
          {/* Header row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 1.4fr",
            padding: "14px 24px",
            background: "#FAFAFA",
            borderBottom: `1px solid ${C.border}`,
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: C.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}>
            <span>Method</span>
            <span>Path</span>
            <span>Description</span>
          </div>
          {ENDPOINTS.map((ep, i) => (
            <div
              key={ep.path}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 1.4fr",
                padding: "16px 24px",
                borderBottom: i < ENDPOINTS.length - 1 ? `1px solid ${C.borderLight}` : "none",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <span style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                textAlign: "center",
                letterSpacing: "0.06em",
                background: ep.method === "GET" ? "rgba(74,123,95,0.12)" : "rgba(184,115,51,0.12)",
                color: ep.method === "GET" ? C.sage : C.amber,
                width: "fit-content",
              }}>
                {ep.method}
              </span>
              <code style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13.5px",
                color: C.text,
                fontWeight: 600,
              }}>
                {ep.path}
              </code>
              <span style={{ fontSize: "14px", color: C.textSec }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* WEBHOOKS */}
      <Section alt>
        <SectionHeader label="Webhooks" title="Get pushed when reputation moves." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "48px", alignItems: "start" }}>
          <div>
            <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "28px", maxWidth: "560px" }}>
              Subscribe to four event types. We POST JSON to your endpoint within 60 seconds of detection, retry with exponential backoff for 24 hours, and sign every payload with an HMAC-SHA256 header.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {WEBHOOKS.map(wh => (
                <div key={wh.event} style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "16px",
                  padding: "18px 20px",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "10px",
                  borderLeft: `4px solid ${wh.color}`,
                  alignItems: "center",
                }}>
                  <code style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "13px",
                    color: C.text,
                    fontWeight: 700,
                  }}>
                    {wh.event}
                  </code>
                  <span style={{ fontSize: "13px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>
                    {wh.trigger}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Example payload · reputation.score_changed
            </div>
            <CodeBlock code={WEBHOOK_PAYLOAD} lang="json" />
          </div>
        </div>
      </Section>

      {/* SDKs */}
      <Section>
        <SectionHeader label="SDKs" title="Official SDKs in 4 languages." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {SDKS.map(sdk => (
            <div key={sdk.name} style={{
              padding: "28px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
              borderTop: `3px solid ${sdk.color}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  borderRadius: "8px",
                  background: `${sdk.color}15`,
                  color: sdk.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {sdk.name.charAt(0)}
                </div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.text, letterSpacing: "-0.01em", margin: 0 }}>
                  {sdk.name}
                </h3>
              </div>
              <div style={{
                background: "#0A0A0A",
                color: "#E5E5E5",
                borderRadius: "8px",
                padding: "14px 16px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "13px",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}>
                <span style={{ color: "#71717A", marginRight: "8px" }}>$</span>
                {sdk.install}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* MCP SECTION */}
      <Section alt>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "64px", alignItems: "start" }}>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              Model Context Protocol
            </div>
            <h2 style={{
              fontSize: "clamp(24px, 6vw, 36px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.03em",
              margin: "0 0 24px",
            }}>
              Bring Harch data into the AI assistant you already use.
            </h2>
            <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "24px", maxWidth: "560px" }}>
              The Harch MCP server exposes 7 tools — reputation scoring, risk detection, sentiment, article search, comparison, and the Harch 100 ranking — to any MCP-compatible AI client. No glue code, no copy-paste, no API plumbing.
            </p>
            <div style={{
              padding: "20px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "10px",
              borderLeft: `4px solid ${C.accent}`,
            }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.text, marginBottom: "8px" }}>
                One config, four clients
              </div>
              <code style={{
                display: "block",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "12.5px",
                color: C.textSec,
                lineHeight: 1.6,
              }}>
                {`{
  "mcpServers": {
    "harch": {
      "command": "npx",
      "args": ["-y", "@harch/mcp-server"],
      "env": { "HARCH_KEY": "sk_..." }
    }
  }
}`}
              </code>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {MCP_CLIENTS.map(client => (
              <div key={client.name} style={{
                padding: "22px 24px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
                display: "grid",
                gridTemplateColumns: "44px 1fr",
                gap: "16px",
                alignItems: "center",
              }}>
                <div style={{
                  width: "44px", height: "44px",
                  borderRadius: "10px",
                  background: `${C.accent}15`,
                  color: C.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "16px", fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {client.icon}
                </div>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: C.text, marginBottom: "4px" }}>
                    {client.name}
                  </div>
                  <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                    {client.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* RATE LIMITS */}
      <Section>
        <SectionHeader label="Rate limits" title="Corporate vs Sovereign, side by side." />
        <div style={{
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
          background: C.surface,
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr",
            padding: "14px 24px",
            background: "#FAFAFA",
            borderBottom: `1px solid ${C.border}`,
            fontSize: "11px",
            fontFamily: "'JetBrains Mono', monospace",
            color: C.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}>
            <span>Resource</span>
            <span>Corporate</span>
            <span>Sovereign</span>
          </div>
          {[
            { res: "API calls / day", pro: "10,000", ent: "100,000" },
            { res: "Requests / minute", pro: "100", ent: "1,000" },
            { res: "Concurrent requests", pro: "5", ent: "50" },
            { res: "Webhook deliveries / month", pro: "10,000", ent: "Unlimited" },
            { res: "MCP tool calls / day", pro: "2,000", ent: "50,000" },
            { res: "Article search results / query", pro: "100", ent: "1,000" },
            { res: "Data retention", pro: "90 days", ent: "2 years" },
            { res: "SLA", pro: "Best effort", ent: "99.9% uptime" },
          ].map((row, i) => (
            <div key={row.res} style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr",
              padding: "16px 24px",
              borderBottom: i < 7 ? `1px solid ${C.borderLight}` : "none",
              alignItems: "center",
            }}>
              <span style={{ fontSize: "14px", color: C.text, fontWeight: 600 }}>{row.res}</span>
              <span style={{ fontSize: "14px", color: C.textSec, fontFamily: "'JetBrains Mono', monospace" }}>{row.pro}</span>
              <span style={{ fontSize: "14px", color: C.accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{row.ent}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* AUTHENTICATION */}
      <Section alt>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "48px", alignItems: "start" }}>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}>
              Authentication
            </div>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 38px)",
              fontWeight: 700,
              color: C.text,
              letterSpacing: "-0.03em",
              margin: "0 0 24px",
            }}>
              Two ways to authenticate. Both enterprise-grade.
            </h2>
            <p style={{ fontSize: "16px", color: C.textSec, lineHeight: 1.65, marginBottom: "28px", maxWidth: "560px" }}>
              Start with a static API key for personal scripts and proof-of-concept integrations. Move to OAuth 2.0 when you ship to production and need scoped tokens, refresh flows, and per-user audit logs.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{
                padding: "18px 20px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                borderLeft: `4px solid ${C.sage}`,
              }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                  API keys
                </div>
                <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                  Static bearer tokens. Scoped per environment (dev / staging / prod). Rotatable from the dashboard.
                </div>
              </div>
              <div style={{
                padding: "18px 20px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "10px",
                borderLeft: `4px solid ${C.accent}`,
              }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: C.text, marginBottom: "6px" }}>
                  OAuth 2.0
                </div>
                <div style={{ fontSize: "13px", color: C.textSec, lineHeight: 1.5 }}>
                  Authorization-code flow with PKCE. Refresh tokens, scoped permissions, per-user audit trail.
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Example · Bearer token header
            </div>
            <CodeBlock
              lang="http"
              code={`GET /v1/reputation/score?company=Bank+of+Africa HTTP/1.1
Host: api.harchcorp.com
Authorization: Bearer sk_live_a1b2c3d4e5f6...
Accept: application/json
X-Harch-Client: my-crm-integration/1.4.0`}
            />
          </div>
        </div>
      </Section>

      <CTABottom
        title="Get API access."
        subtitle="Corporate keys ship in 5 minutes from the dashboard. Sovereign plans include a dedicated integration engineer and a 99.9% uptime SLA."
        href="/atelier/audit"
        cta="Get API access →"
        color={C.accent}
      />
    </ApproachPage>
  );
}

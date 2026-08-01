"use client";

import { useState } from "react";
import Link from "next/link";
import { C } from "../components/tokens";

// ═══════════════════════════════════════════════════════════════
//  API DOCS PAGE
//  Task: signal-enterprise-platform
//
//  Static reference for the public REST API. Documents:
//    • Authentication (Bearer harch_<key>)
//    • Base URL + rate limits
//    • Endpoints (alerts, reputation, sentiment, screen)
//    • Webhooks (events, payloads, signing)
//    • Code examples (curl / JavaScript / Python)
//
//  The page is a client component because the language tabs need
//  local state. Content is hardcoded (no API calls) so it loads
//  instantly and stays crawlable.
// ═══════════════════════════════════════════════════════════════

const BASE_URL = "https://atelier.harchcorp.com";

interface Endpoint {
  id: string;
  method: "GET" | "POST";
  path: string;
  title: string;
  desc: string;
  params?: { name: string; type: string; required: boolean; desc: string }[];
  response: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "alerts",
    method: "GET",
    path: "/api/v1/alerts",
    title: "List alerts",
    desc: "Returns crisis alerts for the API key's company — negative-sentiment articles from the last 7 days plus high/critical risk assessments. Sorted by detectedAt descending.",
    params: [
      { name: "limit", type: "integer", required: false, desc: "Max alerts to return. Default 20, max 100." },
      { name: "since", type: "ISO date", required: false, desc: "Only alerts after this timestamp. Default: 7 days ago." },
    ],
    response: `{
  "company": { "id": "clk1abc..." },
  "alerts": [
    {
      "id": "clk2xyz...",
      "type": "negative_article",
      "title": "OCP Group under scrutiny over ...",
      "source": "Le Matin",
      "url": "https://lematin.ma/...",
      "severity": "critical",
      "sentimentScore": -0.72,
      "detectedAt": "2026-07-31T08:15:00.000Z"
    }
  ],
  "totalAlerts": 12,
  "criticalCount": 3,
  "window": {
    "since": "2026-07-24T09:00:00.000Z",
    "until": "2026-07-31T09:00:00.000Z"
  }
}`,
  },
  {
    id: "reputation",
    method: "GET",
    path: "/api/v1/reputation",
    title: "Get reputation score",
    desc: "Returns the latest reputation score + pillar breakdown (sentiment, AI visibility, volume, authority, innovation, performance, purpose, share of voice) plus a 30-day history.",
    response: `{
  "company": {
    "id": "clk1abc...",
    "name": "Attijariwafa Bank",
    "slug": "attijariwafa-bank",
    "sector": "Banking"
  },
  "overall": {
    "value": 84.2,
    "trend": "up",
    "calculatedAt": "2026-07-31T06:00:00.000Z"
  },
  "pillars": {
    "sentiment": 0.68,
    "aiVisibility": 71.0,
    "volume": 842,
    "authority": 79.5,
    "innovation": 82.0,
    "performance": 76.0,
    "purpose": 71.0,
    "shareOfVoice": 12.4
  },
  "history": [
    { "calculatedAt": "2026-07-01T06:00:00.000Z", "overall": 81.0, "sentiment": 0.61, "aiVisibility": 68.0 },
    { "calculatedAt": "2026-07-02T06:00:00.000Z", "overall": 82.5, "sentiment": 0.64, "aiVisibility": 70.0 }
  ]
}`,
  },
  {
    id: "sentiment",
    method: "GET",
    path: "/api/v1/sentiment",
    title: "Get sentiment trend",
    desc: "Daily sentiment time-series for the API key's company. Each day reports the average sentiment score, article count, and positive/neutral/negative breakdown.",
    params: [
      { name: "range", type: "string", required: false, desc: "Time window. One of 7d, 30d, 365d. Default 30d." },
    ],
    response: `{
  "company": { "id": "clk1abc...", "name": "Attijariwafa Bank", "slug": "attijariwafa-bank" },
  "range": "30d",
  "data": [
    {
      "date": "2026-07-01",
      "avgScore": 0.21,
      "count": 14,
      "positive": 8,
      "neutral": 5,
      "negative": 1
    },
    {
      "date": "2026-07-02",
      "avgScore": -0.08,
      "count": 9,
      "positive": 3,
      "neutral": 4,
      "negative": 2
    }
  ]
}`,
  },
  {
    id: "screen",
    method: "GET",
    path: "/api/v1/screen",
    title: "Sanctions screening",
    desc: "Screens a name (individual, entity, or vessel) against the consolidated OFAC + EU + UN sanctions lists. Uses fuzzy matching with a configurable similarity threshold (default 0.86). Returns matches ranked by similarity.",
    params: [
      { name: "name", type: "string", required: true, desc: "Entity / individual / vessel name to screen. 2-256 chars." },
      { name: "threshold", type: "float", required: false, desc: "Similarity threshold 0.5-0.99. Default 0.86." },
      { name: "type", type: "string", required: false, desc: "Pre-filter: individual | entity | vessel." },
    ],
    response: `{
  "query": "Saddam Hussein",
  "normalizedQuery": "saddam hussein",
  "matches": [
    {
      "list": "OFAC",
      "name": "SADDAM HUSSEIN AL-TIKRITI",
      "matchedField": "name",
      "type": "individual",
      "similarity": 0.94,
      "program": "Iraq",
      "remarks": "FORMER PRESIDENT OF IRAQ"
    }
  ],
  "clean": false,
  "threshold": 0.86,
  "screenedAt": "2026-07-31T09:00:00.000Z",
  "listsScreened": ["OFAC", "EU", "UN"],
  "totalEntriesScreened": 27431
}`,
  },
];

const CODE_LANGS = [
  { id: "curl", label: "cURL" },
  { id: "js", label: "JavaScript" },
  { id: "python", label: "Python" },
] as const;

type LangId = (typeof CODE_LANGS)[number]["id"];

function codeExample(endpoint: Endpoint, lang: LangId): string {
  const url = `${BASE_URL}${endpoint.path}${endpoint.params?.some((p) => p.required) ? "?name=Acme+Corp" : ""}`;
  switch (lang) {
    case "curl":
      return `curl -H "Authorization: Bearer harch_your_key_here" \\
     "${url}"`;
    case "js":
      return `const res = await fetch("${url}", {
  headers: { Authorization: \`Bearer \${process.env.HARCH_KEY}\` },
});
const data = await res.json();
console.log(data);`;
    case "python":
      return `import os
import requests

res = requests.get(
    "${url}",
    headers={"Authorization": f"Bearer {os.environ['HARCH_KEY']}"},
)
data = res.json()
print(data)`;
  }
}

const WEBHOOK_EVENTS = [
  {
    name: "alert.critical",
    desc: "Fires when a critical-severity article or risk assessment is detected for your company.",
    payload: `{
  "event": "alert.critical",
  "deliveredAt": "2026-07-31T09:00:00.000Z",
  "data": {
    "id": "clk2xyz...",
    "title": "OCP Group under scrutiny over ...",
    "severity": "critical",
    "source": "Le Matin",
    "url": "https://lematin.ma/...",
    "detectedAt": "2026-07-31T08:15:00.000Z",
    "sentimentScore": -0.72,
    "company": { "id": "clk1abc...", "name": "OCP Group", "slug": "ocp-group" }
  }
}`,
  },
  {
    name: "alert.high",
    desc: "Same as alert.critical but for high-severity alerts.",
    payload: `{
  "event": "alert.high",
  "deliveredAt": "2026-07-31T09:05:00.000Z",
  "data": { /* same shape as alert.critical */ }
}`,
  },
  {
    name: "report.ready",
    desc: "Fires when a new insight report PDF is generated for your company.",
    payload: `{
  "event": "report.ready",
  "deliveredAt": "2026-07-31T07:00:00.000Z",
  "data": {
    "reportId": "clk3rep...",
    "type": "risk",
    "period": "2026-07",
    "pdfUrl": "https://atelier.harchcorp.com/api/pdf/report/clk3rep.pdf"
  }
}`,
  },
  {
    name: "reputation.drop",
    desc: "Fires when the overall reputation score drops by 5+ points week-over-week.",
    payload: `{
  "event": "reputation.drop",
  "deliveredAt": "2026-07-31T06:00:00.000Z",
  "data": {
    "previousScore": 84.2,
    "currentScore": 78.1,
    "delta": -6.1,
    "company": { "id": "clk1abc...", "name": "Attijariwafa Bank", "slug": "attijariwafa-bank" }
  }
}`,
  },
  {
    name: "screening.match",
    desc: "Fires when a sanctions screening returns a match (similarity >= 0.86).",
    payload: `{
  "event": "screening.match",
  "deliveredAt": "2026-07-31T09:10:00.000Z",
  "data": {
    "query": "Acme Corp",
    "matches": [
      { "list": "OFAC", "name": "ACME CORPORATION", "similarity": 0.92 }
    ],
    "clean": false
  }
}`,
  },
];

export function ApiDocsPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        fontFamily: C.fontSans,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link
            href="/atelier/console"
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: C.text,
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            HarchIQ <span style={{ color: C.accent, marginLeft: "8px" }}>API</span>
          </Link>
          <span style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono }}>
            v1 · REST
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/atelier/console/enterprise-admin"
            style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}
          >
            Manage keys
          </Link>
          <Link
            href="/atelier/products/api-mcp"
            style={{ fontSize: "12px", color: C.textMuted, fontFamily: C.fontMono, textDecoration: "none" }}
          >
            Product page
          </Link>
        </div>
      </header>

      <main
        style={{
          padding: "48px 24px 64px",
          maxWidth: "1080px",
          width: "100%",
          margin: "0 auto",
          flex: 1,
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: C.fontMono,
              fontSize: "11px",
              color: C.accent,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Public API · v1
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: C.text,
              margin: "0 0 12px",
              letterSpacing: "-0.02em",
            }}
          >
            Harch Atelier REST API
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: C.textBody,
              lineHeight: 1.6,
              margin: 0,
              maxWidth: "720px",
            }}
          >
            Pull reputation intelligence, alerts, sentiment trends, and sanctions screening
            into your BI, CRM, and AI agents. Authenticate with a Bearer API key, get JSON back.
          </p>
        </div>

        {/* Authentication */}
        <Section id="auth" title="Authentication">
          <p style={bodyStyle}>
            All requests must include an <code style={codeInlineStyle}>Authorization</code> header
            with a Bearer token prefixed by <code style={codeInlineStyle}>harch_</code>:
          </p>
          <pre style={codeBlockStyle}>
            <code>{`Authorization: Bearer harch_<your-key>`}</code>
          </pre>
          <p style={bodyStyle}>
            API keys are scoped to the company of the user who created them. A key created by a
            user of Attijariwafa Bank can only read Attijariwafa Bank data — never another company&apos;s.
            Keys are hashed at rest (SHA-256); the plaintext is shown only once at creation time.
          </p>
          <Callout>
            Don&apos;t have a key yet?{" "}
            <Link href="/atelier/console/enterprise-admin" style={linkStyle}>
              Open the Enterprise Admin → API Keys tab
            </Link>{" "}
            to create one. Max 5 active keys per user.
          </Callout>
        </Section>

        {/* Base URL */}
        <Section id="base" title="Base URL & rate limits">
          <p style={bodyStyle}>
            All endpoints are relative to <code style={codeInlineStyle}>{BASE_URL}</code>. Example:
          </p>
          <pre style={codeBlockStyle}>
            <code>{`GET ${BASE_URL}/api/v1/alerts`}</code>
          </pre>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <Stat label="Rate limit" value="60 req / min / key" />
            <Stat label="Burst" value="120 req (10s)" />
            <Stat label="Quota" value="10,000 req / month (Pro)" />
            <Stat label="Timeout" value="30s per request" />
          </div>
          <p style={{ ...bodyStyle, marginTop: "16px" }}>
            Rate-limited responses return HTTP <code style={codeInlineStyle}>429</code> with
            a <code style={codeInlineStyle}>Retry-After</code> header. The{" "}
            <code style={codeInlineStyle}>X-Harch-Quota-Remaining</code> header is sent on
            every successful response.
          </p>
        </Section>

        {/* Endpoints */}
        <Section id="endpoints" title="Endpoints">
          {ENDPOINTS.map((ep) => (
            <EndpointBlock key={ep.id} endpoint={ep} />
          ))}
        </Section>

        {/* Errors */}
        <Section id="errors" title="Errors">
          <p style={bodyStyle}>
            The API uses standard HTTP status codes. Error responses use a consistent JSON shape:
          </p>
          <pre style={codeBlockStyle}>
            <code>{`{
  "error": "Unauthorized",
  "message": "Missing or invalid API key. Pass it as Authorization: Bearer harch_<your-key>."
}`}</code>
          </pre>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
            <ErrorRow code="200" desc="Success." />
            <ErrorRow code="400" desc="Bad request — missing or invalid query parameter." />
            <ErrorRow code="401" desc="Unauthorized — missing or invalid API key." />
            <ErrorRow code="403" desc="Forbidden — your key works but you don't have access to this resource." />
            <ErrorRow code="404" desc="Not found — the resource or company does not exist." />
            <ErrorRow code="429" desc="Too many requests — you hit the rate limit. Retry after the Retry-After header." />
            <ErrorRow code="503" desc="Service unavailable — sanctions lists are cold-starting. Retry in 30s." />
            <ErrorRow code="500" desc="Server error. If it persists, contact support with the request ID from X-Harch-Request-Id." />
          </div>
        </Section>

        {/* Webhooks */}
        <Section id="webhooks" title="Webhooks">
          <p style={bodyStyle}>
            Register outbound webhooks to receive POST callbacks when critical alerts fire,
            reports become ready, or sanctions match. Manage your webhooks in the{" "}
            <Link href="/atelier/console/enterprise-admin" style={linkStyle}>
              Enterprise Admin → Webhooks tab
            </Link>
            .
          </p>
          <p style={bodyStyle}>
            Every delivery is signed (if you set a secret) with{" "}
            <code style={codeInlineStyle}>X-Harch-Signature: hex(HMAC-SHA256(secret, body))</code>.
            Failed deliveries retry up to 3 times with exponential backoff (2s → 4s → 8s).
          </p>
          <p style={bodyStyle}>Your receiver should:</p>
          <ol style={{ ...bodyStyle, paddingLeft: "20px", margin: "8px 0 16px" }}>
            <li>Verify the signature (if you set a secret).</li>
            <li>Respond with HTTP 2xx within 10 seconds.</li>
            <li>Be idempotent — the same event may be delivered twice on retry.</li>
          </ol>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
            {WEBHOOK_EVENTS.map((ev) => (
              <div
                key={ev.name}
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: "6px",
                  padding: "16px",
                  background: C.bg,
                }}
              >
                <code
                  style={{
                    fontFamily: C.fontMono,
                    fontSize: "13px",
                    color: C.accent,
                    fontWeight: 700,
                  }}
                >
                  {ev.name}
                </code>
                <p style={{ ...bodyStyle, margin: "8px 0 12px" }}>{ev.desc}</p>
                <pre style={codeBlockStyle}>
                  <code>{ev.payload}</code>
                </pre>
              </div>
            ))}
          </div>
        </Section>

        {/* SDKs / libraries */}
        <Section id="sdks" title="SDKs & client libraries">
          <p style={bodyStyle}>
            No official SDK yet — the REST API is stable and simple enough to call with{" "}
            <code style={codeInlineStyle}>fetch</code> or{" "}
            <code style={codeInlineStyle}>requests</code>. Join the waitlist for an official
            TypeScript SDK at{" "}
            <a href="mailto:api@harchcorp.com" style={linkStyle}>
              api@harchcorp.com
            </a>
            .
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${C.border}`,
          padding: "24px",
          textAlign: "center",
          fontFamily: C.fontMono,
          fontSize: "11px",
          color: C.textMuted,
          letterSpacing: "0.1em",
          marginTop: "auto",
        }}
      >
        Harch Atelier · API v1 ·{" "}
        <a
          href="mailto:api@harchcorp.com"
          style={{ color: C.textMuted, textDecoration: "none" }}
        >
          api@harchcorp.com
        </a>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: "48px", scrollMarginTop: "80px" }}>
      <h2
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: C.text,
          margin: "0 0 16px",
          paddingBottom: "8px",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function EndpointBlock({ endpoint }: { endpoint: Endpoint }) {
  const [lang, setLang] = useState<LangId>("curl");
  const [showResponse, setShowResponse] = useState(false);

  const methodColor =
    endpoint.method === "GET" ? C.success : C.accent;

  return (
    <div
      id={endpoint.id}
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "20px",
        marginBottom: "16px",
        background: C.bg,
        scrollMarginTop: "80px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: C.fontMono,
            fontSize: "11px",
            fontWeight: 700,
            padding: "4px 8px",
            borderRadius: "3px",
            background: methodColor,
            color: "#fff",
            letterSpacing: "0.1em",
          }}
        >
          {endpoint.method}
        </span>
        <code
          style={{
            fontFamily: C.fontMono,
            fontSize: "14px",
            color: C.text,
            fontWeight: 600,
            wordBreak: "break-all",
          }}
        >
          {endpoint.path}
        </code>
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 600, color: C.text, margin: "0 0 8px" }}>
        {endpoint.title}
      </h3>
      <p style={{ ...bodyStyle, margin: "0 0 16px" }}>{endpoint.desc}</p>

      {endpoint.params && endpoint.params.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={labelStyle}>Parameters</div>
          <div
            style={{
              border: `1px solid ${C.border}`,
              borderRadius: "4px",
              overflow: "hidden",
            }}
          >
            {endpoint.params.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 100px 1fr",
                  gap: "12px",
                  padding: "10px 12px",
                  borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
                  fontSize: "13px",
                  background: i % 2 === 0 ? C.bg : C.bgSubtle,
                }}
              >
                <code style={{ fontFamily: C.fontMono, color: C.text, fontWeight: 600 }}>
                  {p.name}
                </code>
                <code style={{ fontFamily: C.fontMono, color: C.textMuted, fontSize: "12px" }}>
                  {p.type}
                  {p.required && <span style={{ color: C.danger }}> *</span>}
                </code>
                <span style={{ color: C.textBody, fontSize: "13px" }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "16px" }}>
        <div style={{ ...labelStyle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Example request</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {CODE_LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                style={{
                  padding: "2px 8px",
                  fontSize: "11px",
                  fontFamily: C.fontMono,
                  fontWeight: 600,
                  border: `1px solid ${lang === l.id ? C.accent : C.border}`,
                  borderRadius: "3px",
                  background: lang === l.id ? C.accent : "transparent",
                  color: lang === l.id ? "#fff" : C.textBody,
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <pre style={codeBlockStyle}>
          <code>{codeExample(endpoint, lang)}</code>
        </pre>
      </div>

      <div>
        <button
          onClick={() => setShowResponse(!showResponse)}
          style={{
            ...labelStyle,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span>{showResponse ? "▾" : "▸"}</span>
          Example response
        </button>
        {showResponse && (
          <pre style={{ ...codeBlockStyle, marginTop: "8px" }}>
            <code>{endpoint.response}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        padding: "12px",
        background: C.bgSubtle,
      }}
    >
      <div style={labelStyle}>{label}</div>
      <div
        style={{
          fontFamily: C.fontMono,
          fontSize: "14px",
          color: C.text,
          fontWeight: 600,
          marginTop: "2px",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ErrorRow({ code, desc }: { code: string; desc: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr",
        gap: "12px",
        padding: "8px 12px",
        fontSize: "13px",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <code
        style={{
          fontFamily: C.fontMono,
          fontWeight: 700,
          color: code.startsWith("2") ? C.success : code.startsWith("4") ? C.warningText : C.danger,
        }}
      >
        {code}
      </code>
      <span style={{ color: C.textBody }}>{desc}</span>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.bgSubtle,
        border: `1px solid ${C.border}`,
        borderLeft: `3px solid ${C.cta}`,
        padding: "12px 14px",
        borderRadius: "4px",
        fontSize: "13px",
        color: C.textBody,
        lineHeight: 1.5,
        marginTop: "16px",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════

const bodyStyle: React.CSSProperties = {
  fontSize: "14px",
  color: C.textBody,
  lineHeight: 1.6,
  margin: "0 0 12px",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: "10px",
  color: C.textMuted,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  fontWeight: 700,
  marginBottom: "6px",
};

const codeInlineStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: "12px",
  background: C.bgSubtle,
  border: `1px solid ${C.border}`,
  padding: "1px 5px",
  borderRadius: "3px",
  color: C.text,
};

const codeBlockStyle: React.CSSProperties = {
  background: "#0a0a0a",
  color: "#e5e5e5",
  padding: "14px 16px",
  borderRadius: "4px",
  fontFamily: "'Space Mono', monospace",
  fontSize: "12px",
  lineHeight: 1.6,
  overflowX: "auto",
  margin: "8px 0 0",
};

const linkStyle: React.CSSProperties = {
  color: C.cta,
  textDecoration: "none",
  fontWeight: 600,
};

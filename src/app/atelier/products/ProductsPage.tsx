"use client";

import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop, PhaseDisclaimer } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
//  HARCH ATELIER — PRODUCTS PAGE
//  Signal AI-style: 5 products for every need
//  Reputation Intelligence Platform · API & MCP Integrations
//  Insight Reports · Advanced Dashboards · Newsletters & Briefings
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  audience: string;
  cta: string;
}

const PRODUCTS: Product[] = [
  {
    id: "platform",
    name: "Reputation Intelligence Platform",
    tagline: "Your real-time intelligent view of the external environment",
    description: "Easily access Harch AI's real-time intelligent view of your organization's external environment — through AI-powered analyses, unlimited search queries, real-time alerts, and briefings. The platform is the brain of your reputation intelligence operation, powered by HarchIQ (our trainable AI that understands the context in which you make decisions).",
    icon: "◆",
    color: C.sage,
    features: [
      "Unlimited search queries across 30+ media sources",
      "Real-time alerts via WhatsApp + email when risk velocity spikes",
      "Trilingual sentiment analysis (FR · AR · EN)",
      "Entity-level sentiment tracking",
      "32-category risk detection (Signal AI methodology)",
      "Reputation pillars (Innovation / Performance / Purpose)",
      "9 key themes (Collaborations, Products, Technology, Governance, Growth, Operations, CSR, Culture, Sustainability)",
      "5 dominant narratives with strength scoring",
      "Competitor benchmarking (top 5 competitors)",
      "Quarterly trend tracking (4Q historical)",
      "Customizable dashboards per stakeholder",
      "Harch 100 ranking position",
    ],
    audience: "Comms directors · PR managers · CMOs",
    cta: "Request platform demo",
  },
  {
    id: "api-mcp",
    name: "API & MCP Integrations",
    tagline: "Integrate Harch AI's data into your BI tools and AI agents",
    description: "Integrate Harch AI's global data directly into BI applications and dashboards via API or AI agents (MCP — Model Context Protocol). Gain a truly 360-degree view of your business by combining reputation data with CRM, sales, and operational data. Build custom workflows that trigger when reputation events occur.",
    icon: "⌬",
    color: C.accent,
    features: [
      "REST API for all reputation data (articles, sentiment, risks, scores)",
      "MCP server for direct integration with Claude, ChatGPT, Cursor, Windsurf",
      "Webhooks for real-time alerts (sentiment shift, risk spike, narrative change)",
      "Bulk export endpoints (CSV, JSON, Parquet)",
      "Rate limit: 10,000 calls/day (Pro), 100,000 calls/day (Enterprise)",
      "OAuth 2.0 authentication",
      "Comprehensive API documentation + SDKs (Python, TypeScript, Go)",
      "Sandbox environment for testing",
      "Custom field mapping for enterprise BI (Tableau, PowerBI, Looker)",
    ],
    audience: "Data analysts · BI engineers · AI builders",
    cta: "View API docs",
  },
  {
    id: "insight-reports",
    name: "Insight Reports",
    tagline: "C-level analyses powered by AI + human curation",
    description: "Harness the best of AI and human curation to deliver C-level analyses of what's driving reputation, how big of a media impact your efforts are making. Our senior analysts — using Harch AI's technology — dive deeper into any competitive or topic-related insights relevant to your strategic priorities. Each report is bespoke, board-ready, and delivered in 7 days.",
    icon: "▲",
    color: C.sageBright,
    features: [
      "12-page institutional reputation audit (cover, exec summary, sentiment, AI visibility, top articles, topics, narratives, risks, competitors, recommendations, action plan, methodology)",
      "Competitor deep-dive reports (5 competitors × 10 metrics)",
      "Industry trend reports (quarterly)",
      "Crisis post-mortem reports (after any major incident)",
      "M&A reputation impact reports (pre-deal diligence)",
      "CEO transition reputation reports",
      "ESG perception reports",
      "Board-ready PDF + executive presentation deck",
      "Senior analyst consultation (2 hours included)",
      "Custom research questions answered",
    ],
    audience: "CEOs · Board members · CCOs",
    cta: "Request a report",
  },
  {
    id: "advanced-dashboards",
    name: "Advanced Dashboards",
    tagline: "Comprehensive visualizations built around your unique needs",
    description: "Unlock comprehensive insights with advanced data visualizations built around your unique comms and reputation needs. Measure your performance against your peers, for your reputation pillars, and answer complex, strategic questions with ease. Drag-and-drop builder, real-time refresh, shareable links, scheduled exports.",
    icon: "◐",
    color: C.amber,
    features: [
      "Drag-and-drop dashboard builder",
      "20+ visualization types (line, bar, stacked, heatmap, radar, gauge, network graph, Sankey, etc.)",
      "Real-time refresh (15-minute intervals)",
      "Custom KPI tiles (reputation score, sentiment %, AI visibility, risk score, share of voice)",
      "Peer comparison views (up to 10 competitors side-by-side)",
      "Industry benchmarking views",
      "Time-series comparison (YoY, QoQ, MoM)",
      "Shareable links (no login required for stakeholders)",
      "Scheduled PDF/Excel exports (daily, weekly, monthly)",
      "White-label theming (your brand colors, your logo)",
      "Mobile-responsive (works on phone, tablet, desktop)",
      "Role-based access control (admin, editor, viewer)",
    ],
    audience: "Comms teams · Strategy teams · Investor Relations",
    cta: "See dashboard examples",
  },
  {
    id: "newsletters-briefings",
    name: "Newsletters and Briefings",
    tagline: "Curated updates designed to be shared across your org",
    description: "Stay in the know with curated updates designed to be shared across your organization. Track crucial events impacting your company and keep a finger on the pulse of topics that matter most to you. Daily WhatsApp digest at 7am Casa time, weekly executive briefing every Monday, monthly board-ready PDF.",
    icon: "✉",
    color: C.red,
    features: [
      "Daily WhatsApp digest (7am Casa time, 30-second read)",
      "Weekly executive briefing (Monday 8am, 5-minute read)",
      "Monthly board-ready PDF (20 pages, delivered 1st of month)",
      "Real-time crisis alerts (when risk velocity > 50% in 24h)",
      "Custom topic alerts (define your own triggers)",
      "Competitor movement alerts (when competitor score changes >5pts)",
      "AI visibility alerts (when AI engine starts/stops citing you)",
      "Custom distribution lists (different briefings for different teams)",
      "Multi-language delivery (FR, AR, EN)",
      "Archived briefings searchable for 24 months",
      "Branded templates (your logo, your colors)",
      "Slack + Microsoft Teams integration",
    ],
    audience: "Entire organization · C-suite · Comms team",
    cta: "Start free trial",
  },
];

// Note: testimonials removed — Atelier is in pre-launch phase.
// Per MASTER_VISION.md "Interdictions absolues": never invent testimonials.
// Real customer quotes will be added here as we sign our first clients.

export default function ProductsPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <PhaseDisclaimer />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.sage, animation: "pulse 2s infinite",
            }} />
            Products · Built for every need
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px", maxWidth: "900px",
          }}>
            Solutions built for every need:<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.sage} 0%, ${C.sageBright} 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>from data analysts to C-suite.</span>
          </h1>

          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "760px", marginBottom: "40px",
          }}>
            Five integrated products that work standalone or together. Start with the platform,
            add dashboards when you need to share with stakeholders, plug into your BI via API,
            and let our analysts craft bespoke reports when the moment demands it.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
            gap: "1px", background: C.border, border: `1px solid ${C.border}`,
            borderRadius: "12px", overflow: "hidden", maxWidth: "900px",
          }}>
            {[
              { value: "5", label: "integrated products" },
              { value: "10K+", label: "API calls/day (Pro)" },
              { value: "7 days", label: "report delivery time" },
              { value: "24mo", label: "briefing archive" },
            ].map(s => (
              <div key={s.label} style={{ background: C.surface, padding: "20px 24px" }}>
                <div style={{
                  fontSize: "28px", fontWeight: 800, color: C.text,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1, marginBottom: "6px",
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID — Alternating layout */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 16px" }}>
        <div style={{
          fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
          color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          Our product suite
        </div>
        <h2 style={{
          fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700,
          color: C.text, letterSpacing: "-0.03em", margin: "0 0 60px",
        }}>
          Five products. One intelligence engine.
        </h2>

        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i + 1} />
        ))}
      </section>

      {/* BUILDING IN PUBLIC — Pre-launch phase */}
      <section style={{
        background: C.surface, padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto",  textAlign: "center", padding: "0 16px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.bg,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.amber, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "50%",
              background: C.amber, animation: "pulse 2s infinite",
            }} />
            Pre-launch · Building in Public
          </div>

          <h2 style={{
            fontSize: "clamp(24px, 6vw, 36px)", fontWeight: 700,
            color: C.text, letterSpacing: "-0.03em", margin: "0 0 28px",
          }}>
            No fake testimonials. Just a real product being built.
          </h2>

          <p style={{
            fontSize: "18px", color: C.textSec, lineHeight: 1.6,
            marginBottom: "32px",
          }}>
            Harch Atelier is in pre-launch phase. We're not going to show you fake
            client logos or invented quotes — that's not how we build trust.
            What we can show you: a working product, a real methodology, and an
            honest audit of your reputation across 30+ Moroccan and African media
            sources plus 8 AI engines.
          </p>

          <p style={{
            fontSize: "15px", color: C.textMuted, lineHeight: 1.6,
            marginBottom: "40px", fontFamily: "'JetBrains Mono', monospace",
          }}>
            Real customer case studies will be added here as we sign our first clients.
            <br />
            Until then — judge us on the product, not on marketing.
          </p>

          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Get a free audit →
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          <div style={{
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "16px",
          }}>
            Get started today
          </div>
          <h2 style={{
            fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700,
            letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF",
          }}>
            One platform. Every angle of your reputation.
          </h2>
          <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Request a personalized demo and discover which products fit your team's needs.
          </p>
          <a href="/atelier/audit" style={{
            display: "inline-block", padding: "16px 32px",
            background: C.sage, color: "#FFFFFF",
            fontSize: "15px", fontWeight: 600, textDecoration: "none",
            borderRadius: "8px", fontFamily: "'Inter', sans-serif",
          }}>
            Request a demo →
          </a>
        </div>
      </section>

      <AtelierFooter />
      <BackToTop />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: "16px", padding: "24px", marginBottom: "24px",
      boxShadow: C.shadow, position: "relative", overflow: "hidden",
    }}>
      {/* Accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: `linear-gradient(90deg, ${product.color}, ${product.color}80)`,
      }} />

      <div style={{
        display: "flex", flexWrap: "wrap",
        gap: "16px", alignItems: "flex-start", marginBottom: "24px",
      }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "12px",
          background: `${product.color}15`,
          color: product.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "26px", fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace", flexShrink: 0,
        }}>
          {product.icon}
        </div>
        <div style={{ flex: "1 1 240px", minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            flexWrap: "wrap", marginBottom: "6px",
          }}>
            <span style={{
              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
              color: product.color, letterSpacing: "0.14em",
              textTransform: "uppercase", fontWeight: 700,
            }}>
              Product {String(index).padStart(2, "0")}
            </span>
            <span style={{
              fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
              color: C.textMuted, padding: "2px 8px",
              background: C.surfaceAlt, borderRadius: "100px",
            }}>
              {product.audience}
            </span>
          </div>
          <h3 style={{
            fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 700, color: C.text,
            letterSpacing: "-0.02em", margin: "0 0 8px",
          }}>
            {product.name}
          </h3>
          <div style={{
            fontSize: "14px", color: product.color, fontWeight: 600,
            marginBottom: "12px",
          }}>
            {product.tagline}
          </div>
          <p style={{
            fontSize: "14px", color: C.textSec, lineHeight: 1.6, margin: 0,
          }}>
            {product.description}
          </p>
        </div>
        <a href="/atelier/audit" style={{
          padding: "12px 20px", background: product.color,
          color: "#FFFFFF", fontSize: "13px", fontWeight: 600,
          textDecoration: "none", borderRadius: "6px",
          fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
          flexShrink: 0, marginTop: "8px",
        }}>
          {product.cta} →
        </a>
      </div>

      {/* Features grid */}
      <div style={{
        paddingTop: "24px", borderTop: `1px solid ${C.borderLight}`,
        marginTop: "8px",
      }}>
        <div style={{
          fontSize: "10px", fontFamily: "'JetBrains Mono', monospace",
          color: C.textMuted, letterSpacing: "0.12em",
          textTransform: "uppercase", marginBottom: "16px", fontWeight: 600,
        }}>
          Features
        </div>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "8px 24px",
        }}>
          {product.features.map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: "10px",
              fontSize: "13px", color: C.textSec, lineHeight: 1.6,
            }}>
              <span style={{
                color: product.color, fontWeight: 700, flexShrink: 0,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                ✓
              </span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

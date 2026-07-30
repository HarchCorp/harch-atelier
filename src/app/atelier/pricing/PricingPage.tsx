"use client";

import React, { useState } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — PRICING PAGE
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — 3 tiers, transparent pricing.
// Starter 5K · Pro 15K · Enterprise 50K MAD / month
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero
//   02  3 pricing tiers
//   03  Feature comparison table
//   04  Deliverable previews (WhatsApp + dashboard + PDF)
//   05  Add-ons
//   06  FAQ mini
//   07  CTA
//   08  Footer
//
// ═══════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────
const C = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  borderLight: "#F0F0F0",
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#71717A",
  textFaint: "#A1A1AA",
  accent: "#8B9DAF",
  accentDark: "#4A5D6E",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
  neutral: "#71717A",
  neutralBg: "rgba(113,113,122,0.10)",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

const SHADOW = {
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  cardHover: "0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06)",
  hero: "0 4px 12px rgba(0,0,0,0.04), 0 24px 48px rgba(0,0,0,0.06)",
} as const;

// ─── DATA ──────────────────────────────────────────────────────────────

type Tier = {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  highlighted: boolean;
  features: string[];
  notIncluded: string[];
  stats: { label: string; value: string }[];
  deliverables: string[];
  cta: string;
};

const TIERS: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "5,000",
    period: "MAD / month",
    tagline: "For SMEs starting reputation monitoring",
    highlighted: false,
    features: [
      "10 media sources monitored",
      "3 AI engines tracked (ChatGPT, Perplexity, Gemini)",
      "Daily WhatsApp digest at 7:00 AM",
      "Real-time dashboard",
      "Monthly PDF report (8 pages)",
      "Crisis alert (sentiment < -0.5)",
      "1 marque suivie",
      "Support email (48h)",
    ],
    notIncluded: [
      "Board-ready PDF report (32 pages)",
      "Benchmark concurrents",
      "API access",
    ],
    stats: [
      { label: "Sources", value: "10" },
      { label: "AI engines", value: "3" },
      { label: "Brands", value: "1" },
    ],
    deliverables: [
      "Daily WhatsApp digest",
      "Live dashboard",
      "Monthly PDF (8 pages)",
    ],
    cta: "Start with Starter",
  },
  {
    id: "pro",
    name: "Pro",
    price: "15,000",
    period: "MAD / month",
    tagline: "For companies that want to manage their reputation",
    highlighted: true,
    features: [
      "30+ media sources monitored",
      "8 AI engines tracked",
      "Daily WhatsApp digest at 7:00 AM",
      "Real-time dashboard + historique 90j",
      "Monthly board-ready PDF report (32 pages)",
      "Crisis alert < 5min + custom alerts",
      "3 marques suivies (ou filiales)",
      "Competitor benchmark (up to 3)",
      "Support email + WhatsApp (24h)",
      "Personalized onboarding (2h)",
    ],
    notIncluded: [
      "API access",
      "Topic taxonomy custom",
      "Multi-pays",
    ],
    stats: [
      { label: "Sources", value: "30+" },
      { label: "AI engines", value: "8" },
      { label: "Brands", value: "3" },
    ],
    deliverables: [
      "Daily WhatsApp digest",
      "Live dashboard + 90j history",
      "Monthly PDF (32 pages, board-ready)",
      "Crisis alerts < 5min",
      "Competitor benchmark",
    ],
    cta: "Start with Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "50,000",
    period: "MAD / month",
    tagline: "Pour le groupe multi-filiales et multi-pays",
    highlighted: false,
    features: [
      "Toutes les sources media (MA + Afrique + FR)",
      "8 moteurs IA + crawl custom",
      "Daily digest WhatsApp multi-destinataires",
      "Dashboard + historique 365j + API",
      "Monthly + quarterly board-ready PDF report",
      "Crisis alert < 5min + comms playbook",
      "Unlimited brands (subsidiaries, products)",
      "Unlimited competitor benchmark",
      "Topic taxonomy custom",
      "Dedicated account manager",
      "SLA 99.9% + on-prem option",
      "Multi-country (up to 8 markets)",
    ],
    notIncluded: [],
    stats: [
      { label: "Sources", value: "∞" },
      { label: "AI engines", value: "8+" },
      { label: "Brands", value: "∞" },
    ],
    deliverables: [
      "Daily WhatsApp multi-destinataires",
      "Live dashboard + 365j + API",
      "Monthly + quarterly PDF",
      "Crisis alerts + comms playbook",
      "Custom topic taxonomy",
      "Dedicated account manager",
    ],
    cta: "Talk to sales",
  },
];

const COMPARISON_ROWS: { category: string; features: { name: string; starter: string | boolean; pro: string | boolean; enterprise: string | boolean }[] }[] = [
  {
    category: "Surveillance",
    features: [
      { name: "Sources media", starter: "10", pro: "30+", enterprise: "∞" },
      { name: "AI engines tracked", starter: "3", pro: "8", enterprise: "8+" },
      { name: "Marques suivies", starter: "1", pro: "3", enterprise: "∞" },
      { name: "Langues", starter: "FR", pro: "FR · AR · EN", enterprise: "FR · AR · EN + custom" },
      { name: "Crawl interval", starter: "5 min", pro: "60 sec", enterprise: "60 sec" },
    ],
  },
  {
    category: "Analyse",
    features: [
      { name: "NER (entities)", starter: true, pro: true, enterprise: true },
      { name: "Sentiment HarchIQ", starter: true, pro: true, enterprise: true },
      { name: "Topic modeling", starter: false, pro: true, enterprise: true },
      { name: "Topic taxonomy custom", starter: false, pro: false, enterprise: true },
      { name: "Benchmark concurrents", starter: false, pro: "3", enterprise: "∞" },
    ],
  },
  {
    category: "Livraison",
    features: [
      { name: "Daily digest WhatsApp", starter: "7h00", pro: "7h00", enterprise: "7h00 + custom" },
      { name: "Dashboard", starter: "live", pro: "live + 90j", enterprise: "live + 365j + API" },
      { name: "Monthly PDF report", starter: "8 pages", pro: "32 pages", enterprise: "32 + trimestriel" },
      { name: "Crisis alert", starter: "< 1h", pro: "< 5min", enterprise: "< 5min + playbook" },
      { name: "Multi-destinataires", starter: false, pro: "3", enterprise: "∞" },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Onboarding", starter: "self-serve", pro: "2h call", enterprise: "dedicated" },
      { name: "Support", starter: "email (48h)", pro: "email + WA (24h)", enterprise: "account manager" },
      { name: "SLA", starter: "—", pro: "99.5%", enterprise: "99.9%" },
      { name: "On-prem option", starter: false, pro: false, enterprise: true },
    ],
  },
];

const ADDONS = [
  { name: "Brand addition", price: "+2,000 MAD/month", desc: "Each additional brand or subsidiary tracked on top of your tier allowance." },
  { name: "Custom source", price: "+1,500 MAD/month", desc: "Add a niche or industry source we don't cover yet (forum, blog, trade press)." },
  { name: "Custom AI engine", price: "+3,000 MAD/month", desc: "Track a regional or vertical AI engine (e.g. regional chatbot, voice assistant)." },
  { name: "Extra report", price: "+1,000 MAD", desc: "Additional PDF report — quarterly, board prep, or one-off deep dive." },
  { name: "Onboarding call", price: "+2,000 MAD", desc: "2-hour onboarding with our analyst team to set up your taxonomy and alerts." },
  { name: "Workshop", price: "+8,000 MAD", desc: "Half-day workshop with your comms team on reputation strategy and tools." },
];

const FAQ_MINI = [
  {
    q: "Pourquoi pas de carte bancaire?",
    a: "We invoice by bank transfer, in MAD or EUR. No long-term commitment — you pay month by month, you cancel whenever you want.",
  },
  {
    q: "Is there a long-term commitment?",
    a: "No. Starter and Pro are monthly, no commitment. Enterprise is annual with an SLA, but cancellable with 90 days notice.",
  },
  {
    q: "Puis-je changer de tier en cours?",
    a: "Yes, at any time. Upgrades are immediate. Downgrades apply the following month. No change fees.",
  },
  {
    q: "What happens if I exceed my quota?",
    a: "We alert you at 80% and 100%. Beyond that, you switch to 'soft limit' mode (truncated digest) or upgrade. No surprise billing.",
  },
];

// ─── SHARED HELPERS ────────────────────────────────────────────────────

function Eyebrow({ children, color = C.textMuted }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: "12px",
        fontFamily: FONT.mono,
        color: color,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontWeight: 500,
      }}
    >
      {children}
      <span style={{ width: "48px", height: "1px", background: `linear-gradient(to right, ${color}, transparent)`, opacity: 0.6 }} aria-hidden />
    </div>
  );
}

function SectionTitle({ children, maxW = "820px" }: { children: React.ReactNode; maxW?: string }) {
  return (
    <h2
      style={{
        fontSize: "clamp(30px, 4vw, 46px)",
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        color: C.textPrimary,
        margin: "0 0 20px",
        maxWidth: maxW,
      }}
    >
      {children}
    </h2>
  );
}

function SectionSub({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: "18px",
        color: C.textSecondary,
        lineHeight: 1.6,
        maxWidth: "640px",
        margin: "0 0 56px",
      }}
    >
      {children}
    </p>
  );
}

function IconCheck({ size = 16, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconCross({ size = 14, color = C.textFaint }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrow({ size = 20, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconBell({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="6" r="3" fill={color} stroke={color} />
    </svg>
  );
}

function IconChart({ size = 22, color = C.accentDark }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" />
    </svg>
  );
}

function IconDoc({ size = 22, color = C.red }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function buildLinePath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  return data.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}

function buildAreaPath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  const line = data.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return `${line} L ${w.toFixed(1)} ${h.toFixed(1)} L 0 ${h.toFixed(1)} Z`;
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO
// ═══════════════════════════════════════════════════════════════════════

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        background: C.bg,
        padding: "48px 16px 40px",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: "-200px", right: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-150px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1, textAlign: "center" }}>
        <Eyebrow color={C.sage}>Tarifs · 3 tiers</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(40px, 5.5vw, 64px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.textPrimary,
            margin: "0 0 24px",
          }}
        >
          Transparent pricing.
          <br />
          <span style={{ color: C.sage }}>No surprises.</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: C.textSecondary,
            lineHeight: 1.5,
            maxWidth: "640px",
            margin: "0 auto 40px",
          }}
        >
          Three tiers, monthly, no commitment. Paid by bank transfer in MAD or
          EUR. No credit card, no auto-renewal trap, no hidden fees.
        </p>

        {/* Pricing anchors */}
        <div
          className="hero-anchors"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "16px",
            maxWidth: "760px",
            margin: "0 auto",
          }}
        >
          {TIERS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              style={{
                display: "block",
                padding: "20px 16px",
                background: C.surface,
                border: `1px solid ${t.highlighted ? C.sage : C.border}`,
                borderRadius: "6px",
                textDecoration: "none",
                boxShadow: t.highlighted ? SHADOW.cardHover : SHADOW.card,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: t.highlighted ? C.sage : C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                {t.name}
              </div>
              <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {t.price}
              </div>
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px" }}>
                {t.period}
              </div>
            </a>
          ))}
        </div>

        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
            fontSize: "13px",
            color: C.textMuted,
            fontFamily: FONT.mono,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IconCheck size={12} color={C.sage} /> No commitment
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IconCheck size={12} color={C.sage} /> Virement bancaire
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IconCheck size={12} color={C.sage} /> Free 7-day audit
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <IconCheck size={12} color={C.sage} /> Annulation 1 clic
          </span>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — 3 PRICING TIERS
// ═══════════════════════════════════════════════════════════════════════

function PricingTiers() {
  return (
    <section
      id="tiers"
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow>The three tiers</Eyebrow>
        <SectionTitle>Choose what fits — upgrade anytime.</SectionTitle>
        <SectionSub>
          Every tier includes daily WhatsApp digest, live dashboard, and
          monthly PDF. The difference is coverage, depth, and support.
        </SectionSub>

        <div
          className="tier-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {TIERS.map((t) => (
            <TierCard key={t.id} tier={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      id={tier.id}
      style={{
        background: C.surface,
        border: `1px solid ${tier.highlighted ? C.sage : C.border}`,
        borderRadius: "8px",
        padding: tier.highlighted ? "32px 28px 28px" : "32px 28px",
        boxShadow: tier.highlighted ? SHADOW.cardHover : SHADOW.card,
        position: "relative",
        transition: "all 0.25s",
        transform: tier.highlighted ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {tier.highlighted && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "11px",
            fontFamily: FONT.mono,
            fontWeight: 700,
            color: "#FFFFFF",
            background: C.sage,
            padding: "5px 14px",
            borderRadius: "2px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            boxShadow: SHADOW.card,
          }}
        >
          Most popular
        </div>
      )}

      {/* Tier name */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: tier.highlighted ? C.sage : C.textMuted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "8px" }}>
          {tier.name}
        </div>
        <p style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.5, margin: 0 }}>
          {tier.tagline}
        </p>
      </div>

      {/* Price */}
      <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: `1px solid ${C.borderLight}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "44px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1, letterSpacing: "-0.03em" }}>
            {tier.price}
          </span>
          <span style={{ fontSize: "14px", fontFamily: FONT.mono, color: C.textMuted }}>{tier.period}</span>
        </div>
        <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "8px", letterSpacing: "0.04em" }}>
          ≈ {tier.id === "starter" ? "€460" : tier.id === "pro" ? "€1,380" : "€4,600"} / month · bank transfer
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "8px", marginBottom: "24px" }}>
        {tier.stats.map((s, i) => (
          <div key={i} style={{ padding: "10px", background: C.surfaceAlt, borderRadius: "4px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
            <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: FONT.mono, color: tier.highlighted ? C.sage : C.textPrimary, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
          What's included
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tier.features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ flexShrink: 0, marginTop: "2px" }}>
                <IconCheck size={14} color={tier.highlighted ? C.sage : C.accentDark} />
              </span>
              <span style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Not included */}
      {tier.notIncluded.length > 0 && (
        <div style={{ marginBottom: "24px", paddingTop: "16px", borderTop: `1px solid ${C.borderLight}` }}>
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "10px" }}>
            Not included
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {tier.notIncluded.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <IconCross size={12} color={C.textFaint} />
                <span style={{ fontSize: "12px", color: C.textFaint }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <a
        href={tier.id === "enterprise" ? "/atelier/audit" : "/atelier/audit"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          width: "100%",
          padding: "14px 20px",
          background: tier.highlighted ? C.sage : "transparent",
          color: tier.highlighted ? "#FFFFFF" : C.accentDark,
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          borderRadius: "3px",
          border: `1px solid ${tier.highlighted ? C.sage : C.accentDark}`,
          cursor: "pointer",
          fontFamily: FONT.sans,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = C.sageDark;
          } else {
            e.currentTarget.style.background = "rgba(74,93,110,0.06)";
          }
        }}
        onMouseLeave={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = C.sage;
          } else {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {tier.cta}
        <IconArrow size={14} color={tier.highlighted ? "#FFFFFF" : C.accentDark} />
      </a>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — FEATURE COMPARISON TABLE
// ═══════════════════════════════════════════════════════════════════════

function ComparisonTable() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow color={C.sage}>Detailed comparison</Eyebrow>
        <SectionTitle>Compare every feature, side by side.</SectionTitle>
        <SectionSub>
          The full table — surveillance, analysis, delivery, support. If a
          feature isn't listed here, ask us. No hidden line items.
        </SectionSub>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr",
              gap: "0",
              padding: "20px 24px",
              background: C.surfaceAlt,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
              Feature
            </div>
            {TIERS.map((t) => (
              <div key={t.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: t.highlighted ? C.sage : C.textPrimary, letterSpacing: "-0.01em" }}>
                  {t.name}
                </div>
                <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "2px" }}>
                  {t.price} {t.period}
                </div>
              </div>
            ))}
          </div>

          {/* Categories */}
          {COMPARISON_ROWS.map((cat) => (
            <div key={cat.category}>
              <div
                style={{
                  padding: "12px 24px",
                  background: C.surfaceAlt,
                  borderBottom: `1px solid ${C.borderLight}`,
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  color: C.accentDark,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {cat.category}
              </div>
              {cat.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    alignItems: "center",
                    padding: "14px 24px",
                    borderBottom: `1px solid ${C.borderLight}`,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontSize: "13px", color: C.textPrimary }}>{f.name}</div>
                  <ComparisonCell value={f.starter} />
                  <ComparisonCell value={f.pro} highlight />
                  <ComparisonCell value={f.enterprise} />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* CTA below table */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: C.textMuted, fontFamily: FONT.mono, margin: "0 0 20px" }}>
            Need something not on this list? Talk to us.
          </p>
          <a
            href="/atelier/audit"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 28px",
              background: C.sage,
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
              borderRadius: "3px",
              border: `1px solid ${C.sage}`,
              cursor: "pointer",
              fontFamily: FONT.sans,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.sageDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.sage)}
          >
            Start your free audit
            <IconArrow size={14} color="#FFFFFF" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ComparisonCell({ value, highlight = false }: { value: string | boolean; highlight?: boolean }) {
  const cellStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "8px",
    background: highlight ? C.sageBg : "transparent",
  };
  if (typeof value === "boolean") {
    return (
      <div style={cellStyle}>
        {value ? <IconCheck size={16} color={C.sage} /> : <IconCross size={14} color={C.textFaint} />}
      </div>
    );
  }
  return (
    <div style={{ ...cellStyle, fontSize: "13px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600 }}>
      {value}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — DELIVERABLE PREVIEWS
// ═══════════════════════════════════════════════════════════════════════

function DeliverablePreviews() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow>What you actually get</Eyebrow>
        <SectionTitle>Three deliverables, every month.</SectionTitle>
        <SectionSub>
          Whatever tier you choose, these three things land in your inbox,
          on your phone, and in your dashboard. Here's what they look like.
        </SectionSub>

        <div
          className="deliverable-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
          }}
        >
          <DeliverableCard
            icon={<IconBell size={24} color={C.sage} />}
            accent={C.sage}
            label="WhatsApp digest"
            schedule="7h00 every morning"
            desc="Yesterday's mentions, sentiment score, top topics, and any crisis alerts — in one structured WhatsApp message."
            preview={<WhatsAppPreview />}
          />
          <DeliverableCard
            icon={<IconChart size={24} color={C.accentDark} />}
            accent={C.accentDark}
            label="Live dashboard"
            schedule="24/7 access"
            desc="Full historical view — 30 / 90 / 365 days. Drill into any article, any topic, any source. Export to CSV."
            preview={<DashboardPreview />}
          />
          <DeliverableCard
            icon={<IconDoc size={24} color={C.red} />}
            accent={C.red}
            label="Monthly PDF"
            schedule="1st of each month"
            desc="Board-ready 32-page report — reputation score, top risks, competitor benchmark, recommended actions."
            preview={<PDFPreview />}
          />
        </div>
      </div>
    </section>
  );
}

function DeliverableCard({
  icon,
  accent,
  label,
  schedule,
  desc,
  preview,
}: {
  icon: React.ReactNode;
  accent: string;
  label: string;
  schedule: string;
  desc: string;
  preview: React.ReactNode;
}) {
  const bg = accent === C.sage ? C.sageBg : accent === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg;
  const border = accent === C.sage ? "rgba(74,123,95,0.2)" : accent === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "28px",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accent;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "8px",
            background: bg,
            border: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: accent, background: bg, padding: "3px 8px", borderRadius: "2px", border: `1px solid ${border}`, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {schedule}
        </span>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>{label}</h3>
      <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: "0 0 20px" }}>{desc}</p>

      <div style={{ flex: 1 }}>{preview}</div>
    </div>
  );
}

function WhatsAppPreview() {
  return (
    <div
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "6px",
        padding: "14px",
        fontFamily: FONT.mono,
        fontSize: "11px",
        color: C.textSecondary,
        lineHeight: 1.7,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "8px", paddingBottom: "8px", borderBottom: `1px solid ${C.borderLight}` }}>
        <span style={{ color: C.sage, fontWeight: 700 }}>Harch Atelier</span>
        <span style={{ color: C.textMuted, fontSize: "10px" }}>7:00</span>
      </div>
      <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: "12px" }}>Bank of Africa · 13 mars</div>
      <div style={{ marginTop: "6px" }}>Score: <span style={{ color: C.sage, fontWeight: 700 }}>78/100</span> ↑ +4.2</div>
      <div>Mentions: 247 (+12%)</div>
      <div>AI citations: 14 (3 new)</div>
      <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: `1px solid ${C.borderLight}` }}>
        <div style={{ color: C.textMuted, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Top topics</div>
        <div>· Frais bancaires <span style={{ color: C.red }}>●</span></div>
        <div>· Service client <span style={{ color: C.sage }}>●</span></div>
        <div>· Application mobile <span style={{ color: C.sage }}>●</span></div>
      </div>
      <div style={{ marginTop: "8px", padding: "8px", background: C.redBg, border: `1px solid rgba(160,82,75,0.2)`, borderRadius: "4px", fontSize: "11px", color: C.red }}>
        ● 1 alerte crise (12:42)
      </div>
    </div>
  );
}

function DashboardPreview() {
  const data = [55, 58, 60, 62, 65, 68, 70, 72, 75, 78, 80, 82];
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "6px",
        padding: "12px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "10px" }}>
        <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>30-day trend</span>
        <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>+27 pts</span>
      </div>
      <svg width="100%" height="60" viewBox="0 0 200 60" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pricingDashGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.accentDark} stopOpacity="0.25" />
            <stop offset="100%" stopColor={C.accentDark} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={buildAreaPath(data, 200, 60, 100)} fill="url(#pricingDashGrad)" />
        <path d={buildLinePath(data, 200, 60, 100)} fill="none" stroke={C.accentDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "6px", marginTop: "10px" }}>
        <DashMini label="Articles" value="247" />
        <DashMini label="Mentions" value="1.2K" />
        <DashMini label="AI cites" value="14" />
      </div>
    </div>
  );
}

function DashMini({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "8px", background: C.surfaceAlt, borderRadius: "3px", textAlign: "center", border: `1px solid ${C.borderLight}` }}>
      <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "8px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
    </div>
  );
}

function PDFPreview() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Harch Atelier · Mars 2025
      </div>
      <div style={{ fontSize: "14px", fontWeight: 700, color: C.textPrimary }}>Reputation Report</div>
      <div style={{ fontSize: "11px", color: C.textSecondary }}>Bank of Africa · 32 pages</div>
      <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
        <div style={{ flex: 7, height: "5px", background: C.sage, borderRadius: "2px" }} />
        <div style={{ flex: 2, height: "5px", background: C.neutral, borderRadius: "2px" }} />
        <div style={{ flex: 1, height: "5px", background: C.red, borderRadius: "2px" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted }}>
        <span style={{ color: C.sage }}>68% pos</span>
        <span>22% neu</span>
        <span style={{ color: C.red }}>10% neg</span>
      </div>
      <div style={{ marginTop: "4px", paddingTop: "8px", borderTop: `1px solid ${C.borderLight}`, fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono }}>
        Pages: Cover · Exec summary · Score · Sentiment · Topics · Risks · Competitors · Actions
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 05 — ADD-ONS
// ═══════════════════════════════════════════════════════════════════════

function AddOns() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow color={C.sage}>Add-ons</Eyebrow>
        <SectionTitle>Need more? Add what you need.</SectionTitle>
        <SectionSub>
          All tiers can be extended with add-ons — extra brands, custom
          sources, additional reports. No bundle lock-in.
        </SectionSub>

        <div
          className="addon-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
        >
          {ADDONS.map((a, i) => (
            <div
              key={i}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                padding: "24px",
                boxShadow: SHADOW.card,
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.sage;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start", marginBottom: "12px", gap: "12px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>{a.name}</h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    color: C.sage,
                    background: C.sageBg,
                    padding: "3px 8px",
                    borderRadius: "2px",
                    border: "1px solid rgba(74,123,95,0.2)",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {a.price}
                </span>
              </div>
              <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 06 — FAQ MINI
// ═══════════════════════════════════════════════════════════════════════

function FAQMini() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow>Pricing FAQ</Eyebrow>
        <SectionTitle>Common questions about pricing.</SectionTitle>
        <SectionSub>
          The four questions we get asked the most. For the full FAQ, see our
          dedicated page.
        </SectionSub>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQ_MINI.map((item, i) => (
            <FAQMiniItem key={i} item={item} />
          ))}
        </div>

        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <a
            href="/atelier/faq"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              background: "transparent",
              color: C.accentDark,
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
              borderRadius: "3px",
              border: `1px solid ${C.accentDark}`,
              cursor: "pointer",
              fontFamily: FONT.sans,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,93,110,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            See full FAQ
            <IconArrow size={14} color={C.accentDark} />
          </a>
        </div>
      </div>
    </section>
  );
}

function FAQMiniItem({ item }: { item: { q: string; a: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        overflow: "hidden",
        transition: "all 0.2s",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "18px 24px",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          fontFamily: FONT.sans,
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 600, color: C.textPrimary }}>{item.q}</span>
        <span style={{ fontSize: "16px", color: C.textMuted, flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 20px", fontSize: "14px", color: C.textSecondary, lineHeight: 1.6 }}>
          {item.a}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 07 — CTA
// ═══════════════════════════════════════════════════════════════════════

function CTA() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          padding: "64px 48px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(74,123,95,0.06), transparent 70%)", borderRadius: "50%" }} />
        <div aria-hidden style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,157,175,0.06), transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow color={C.sage}>Try before you buy</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.textPrimary,
              margin: "0 0 20px",
            }}
          >
            7-day free audit. No credit card.
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "560px",
              margin: "0 auto 36px",
            }}
          >
            We run the full pipeline on your brand for 7 days. You get a
            sample WhatsApp digest, dashboard access, and a mini PDF. Then you
            decide.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/atelier/audit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 28px",
                background: C.sage,
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.sage}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.sageDark)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.sage)}
            >
              Start free audit
              <IconArrow size={16} color="#FFFFFF" />
            </a>
            <a
              href="mailto:atelier@harchcorp.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "15px 28px",
                background: "transparent",
                color: C.accentDark,
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.accentDark}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,93,110,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              Talk to sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// RESPONSIVE STYLES
// ═══════════════════════════════════════════════════════════════════════

function ResponsiveStyles() {
  return (
    <style>{`
      @media (max-width: 900px) {
        .hero-anchors { grid-template-columns: 1fr !important; }
        .tier-grid { grid-template-columns: 1fr !important; }
        .deliverable-grid { grid-template-columns: 1fr !important; }
        .addon-grid { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 640px) {
        .hero-anchors { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function PricingPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero />
        <PricingTiers />
        <ComparisonTable />
        <DeliverablePreviews />
        <AddOns />
        <FAQMini />
        <CTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

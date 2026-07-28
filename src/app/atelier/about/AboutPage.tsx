"use client";

import React from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — ABOUT PAGE
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — about Harch Intelligence.
// Founder, mission, tech stack diagram, building-in-public timeline.
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero
//   02  Mission
//   03  Founder card
//   04  Tech stack diagram
//   05  Timeline (building in public)
//   06  Numbers / stats
//   07  Values
//   08  CTA
//   09  Footer
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

const TECH_STACK = [
  {
    layer: "Collecte",
    color: C.accent,
    items: [
      { name: "Crawlers", tech: "Python + Scrapy", role: "Media RSS + scraping" },
      { name: "AI queries", tech: "OpenAI / Anthropic / Google APIs", role: "ChatGPT, Claude, Gemini" },
      { name: "Webhooks", tech: "Custom", role: "Social signals" },
    ],
  },
  {
    layer: "Ingestion",
    color: C.accentDark,
    items: [
      { name: "Queue", tech: "Redis + Bull", role: "Async job processing" },
      { name: "Storage", tech: "PostgreSQL + S3", role: "Articles + raw HTML" },
      { name: "Dedup", tech: "SimHash", role: "Near-duplicate detection" },
    ],
  },
  {
    layer: "Analyse",
    color: C.sage,
    items: [
      { name: "NER", tech: "spaCy + custom", role: "Entity extraction" },
      { name: "Sentiment", tech: "HarchIQ", role: "Multilingual classification" },
      { name: "Topics", tech: "BERTopic", role: "Theme clustering" },
      { name: "Language", tech: "fastText", role: "FR / AR / EN detection" },
    ],
  },
  {
    layer: "Livraison",
    color: C.red,
    items: [
      { name: "WhatsApp", tech: "WhatsApp Business API", role: "Daily digests + alerts" },
      { name: "Dashboard", tech: "Next.js + Prisma", role: "Real-time + history" },
      { name: "PDF", tech: "Puppeteer + LaTeX", role: "Monthly reports" },
    ],
  },
];

const TIMELINE = [
  {
    date: "Jan 2024",
    title: "The idea",
    desc: "Founder notices Moroccan companies have no way to track what AI engines say about them. Existing tools are English-only, US-focused.",
    color: C.accent,
    tag: "Origin",
  },
  {
    date: "Mar 2024",
    title: "First prototype",
    desc: "A Python script crawling 5 Moroccan media + querying ChatGPT. Runs on a single brand for 30 days. The data is striking.",
    color: C.accentDark,
    tag: "Prototype",
  },
  {
    date: "Jun 2024",
    title: "First paying client",
    desc: "A Casablanca bank signs up for monthly monitoring. The PDF report is 12 pages. They renew.",
    color: C.sage,
    tag: "Validation",
  },
  {
    date: "Sep 2024",
    title: "Harch Atelier launches",
    desc: "The product becomes a subsidiary of Harch Corp. Three tiers, transparent pricing, bank transfer only.",
    color: C.sage,
    tag: "Launch",
  },
  {
    date: "Dec 2024",
    title: "10 clients · 4 sectors",
    desc: "Banking, telecom, energy, hospitality. The HARCH 100 ranking is born — a public benchmark of Moroccan corporate reputation.",
    color: C.accentDark,
    tag: "Growth",
  },
  {
    date: "Mar 2025",
    title: "8 AI engines tracked",
    desc: "We add Gemini, Claude, Copilot, Mistral, and Grok to the original three (ChatGPT, Perplexity, Google AI Overviews).",
    color: C.red,
    tag: "Expansion",
  },
  {
    date: "Today",
    title: "Building in public",
    desc: "We publish our methodology, our pricing, our tech stack. We share what we learn about AI reputation in francophone markets.",
    color: C.sage,
    tag: "Now",
  },
];

const STATS = [
  { value: "2024", label: "Founded" },
  { value: "10+", label: "Paying clients" },
  { value: "4", label: "Sectors covered" },
  { value: "8", label: "AI engines tracked" },
  { value: "30+", label: "Media sources" },
  { value: "100", label: "HARCH ranking" },
];

const VALUES = [
  {
    title: "Building in public",
    desc: "We publish our methodology, our pricing, our tech stack. No black box, no magic score. You see exactly how we work.",
    icon: "eye",
  },
  {
    title: "Francophone first",
    desc: "Built for Morocco, Africa, and the francophone world. Arabic sources, French business press, Darija detection.",
    icon: "globe",
  },
  {
    title: "No lock-in",
    desc: "Monthly contracts. Bank transfer. Export your data anytime. If we're not delivering value, you should leave.",
    icon: "unlock",
  },
  {
    title: "Real humans",
    desc: "No chatbot-only support. You get a real analyst who knows your brand, your sector, and your reputation history.",
    icon: "users",
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

function IconArrow({ size = 20, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck({ size = 16, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconEye({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconGlobe({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconUnlock({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function IconUsers({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function getIcon(name: string) {
  if (name === "eye") return IconEye;
  if (name === "globe") return IconGlobe;
  if (name === "unlock") return IconUnlock;
  return IconUsers;
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
        padding: "80px 32px 100px",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: "-200px", right: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-150px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1280px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "64px", alignItems: "center" }}>
          <div>
            <Eyebrow color={C.sage}>About · Harch Intelligence</Eyebrow>
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
              We track what the world
              <br />
              <span style={{ color: C.sage }}>says about African business.</span>
            </h1>
            <p
              style={{
                fontSize: "20px",
                color: C.textSecondary,
                lineHeight: 1.5,
                maxWidth: "560px",
                margin: "0 0 36px",
              }}
            >
              Harch Atelier is the AI reputation intelligence division of Harch
              Corp. We monitor media and AI engines for Moroccan and African
              companies — and we build in public.
            </p>

            {/* Stats inline */}
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              <HeroStat value="2024" label="Founded" />
              <HeroStat value="Casablanca" label="HQ" />
              <HeroStat value="10+" label="Clients" />
              <HeroStat value="8" label="AI engines" />
            </div>
          </div>

          {/* Right: location card */}
          <LocationCard />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function LocationCard() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        padding: "28px",
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
        Headquarters
      </div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: C.textPrimary, marginBottom: "6px", letterSpacing: "-0.02em" }}>
        Casablanca
      </div>
      <div style={{ fontSize: "14px", color: C.textSecondary, marginBottom: "24px" }}>
        Maroc · UTC+1
      </div>

      {/* Coordinates */}
      <div
        style={{
          padding: "16px",
          background: C.surfaceAlt,
          border: `1px solid ${C.borderLight}`,
          borderRadius: "6px",
          marginBottom: "16px",
        }}
      >
        <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
          Coordinates
        </div>
        <div style={{ fontSize: "13px", fontFamily: FONT.mono, color: C.textPrimary }}>
          33.5731° N, 7.5898° W
        </div>
      </div>

      {/* Mini map SVG */}
      <div
        style={{
          background: C.surfaceAlt,
          border: `1px solid ${C.borderLight}`,
          borderRadius: "6px",
          padding: "16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg width="100%" height="120" viewBox="0 0 240 120">
          {/* Grid lines */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="120" stroke={C.borderLight} strokeWidth="0.5" />
          ))}
          {[0, 30, 60, 90, 120].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="240" y2={y} stroke={C.borderLight} strokeWidth="0.5" />
          ))}

          {/* Stylized Morocco / Africa shape (abstract) */}
          <path
            d="M 100 30 Q 120 25 140 35 L 150 50 Q 145 65 130 70 L 110 75 Q 95 70 90 55 Z"
            fill={C.sageBg}
            stroke={C.sage}
            strokeWidth="1"
            opacity="0.6"
          />
          <path
            d="M 110 75 Q 130 80 150 90 L 180 100 Q 200 95 210 85 L 200 70 Q 180 60 160 55 Z"
            fill="rgba(139,157,175,0.10)"
            stroke={C.accent}
            strokeWidth="1"
            opacity="0.6"
          />

          {/* Casa pin */}
          <circle cx="118" cy="48" r="6" fill={C.sage} opacity="0.2" />
          <circle cx="118" cy="48" r="3" fill={C.sage} />
          <line x1="118" y1="48" x2="118" y2="20" stroke={C.sage} strokeWidth="1" strokeDasharray="2 2" />

          <text x="118" y="16" textAnchor="middle" fontSize="9" fontFamily={FONT.mono} fill={C.sage} fontWeight="700">
            CASA
          </text>
        </svg>
      </div>

      <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted }}>
        <div>atelier@harchcorp.com</div>
        <div>+212 684 440 682</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — MISSION
// ═══════════════════════════════════════════════════════════════════════

function Mission() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>Our mission</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(28px, 4.5vw, 44px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
            color: C.textPrimary,
            margin: "0 0 32px",
          }}
        >
          African companies deserve to know what the world says about them —
          <span style={{ color: C.sage }}> in real time, in their language, on their phone.</span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginTop: "48px",
          }}
          className="mission-grid"
        >
          <MissionCard
            label="The problem"
            text="Moroccan and African companies are talked about daily in media and AI engines — but they have no way to know. Existing tools are English-only, US-focused, and built for Twitter."
          />
          <MissionCard
            label="Our answer"
            text="A reputation intelligence pipeline built for francophone and African reality. Arabic sources, French business press, the AI engines your customers actually use. Delivered on WhatsApp."
          />
        </div>

        {/* Manifesto line */}
        <div
          style={{
            marginTop: "48px",
            padding: "32px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderLeft: `3px solid ${C.sage}`,
            borderRadius: "6px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.sage, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>
            Manifesto
          </div>
          <p style={{ fontSize: "18px", color: C.textPrimary, lineHeight: 1.55, margin: 0, fontStyle: "italic" }}>
            "We believe reputation should not be a black box. Every score we
            deliver can be traced to a source article, an AI response, and a
            sentiment classification with its confidence. We build in public
            because that's how we'd want to be treated as a client."
          </p>
        </div>
      </div>
    </section>
  );
}

function MissionCard({ label, text }: { label: string; text: string }) {
  return (
    <div
      style={{
        background: C.surfaceAlt,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
        {label}
      </div>
      <p style={{ fontSize: "15px", color: C.textPrimary, lineHeight: 1.6, margin: 0 }}>{text}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — FOUNDER CARD
// ═══════════════════════════════════════════════════════════════════════

function Founder() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>The founder</Eyebrow>
        <SectionTitle>Built by one person, for now.</SectionTitle>
        <SectionSub>
          Harch Atelier is founded and operated by a single person — a
          software engineer and analyst based in Casablanca. No VC, no
          cofounder drama, no inflated team. Just one person obsessed with
          reputation data.
        </SectionSub>

        <div
          className="founder-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 1.2fr",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Left: Founder card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: SHADOW.hero,
              overflow: "hidden",
            }}
          >
            {/* Avatar block (monogram, no photo) */}
            <div
              style={{
                padding: "40px 32px",
                background: `linear-gradient(135deg, ${C.sageBg}, rgba(139,157,175,0.08))`,
                borderBottom: `1px solid ${C.border}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  borderRadius: "50%",
                  background: C.surface,
                  border: `2px solid ${C.sage}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontFamily: FONT.mono,
                  fontSize: "32px",
                  fontWeight: 700,
                  color: C.sage,
                  letterSpacing: "-0.02em",
                }}
              >
                H
              </div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: C.textPrimary, marginBottom: "4px" }}>
                The Founder
              </div>
              <div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>
                Casablanca, Maroc
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <FounderRow label="Role" value="Founder · Engineer · Analyst" />
                <FounderRow label="Based" value="Casablanca, Morocco" />
                <FounderRow label="Background" value="Software engineering · NLP · Media analysis" />
                <FounderRow label="Languages" value="FR · AR · EN · Darija" />
                <FounderRow label="Building" value="In public since Jan 2024" />
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop: `1px solid ${C.borderLight}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <a href="mailto:atelier@harchcorp.com" style={{ fontSize: "13px", color: C.accentDark, textDecoration: "none", fontFamily: FONT.mono }}>
                  → atelier@harchcorp.com
                </a>
                <a href="https://wa.me/212684440682" style={{ fontSize: "13px", color: C.accentDark, textDecoration: "none", fontFamily: FONT.mono }}>
                  → +212 684 440 682 (WhatsApp)
                </a>
                <a href="https://harchcorp.com" style={{ fontSize: "13px", color: C.accentDark, textDecoration: "none", fontFamily: FONT.mono }}>
                  → harchcorp.com
                </a>
              </div>
            </div>
          </div>

          {/* Right: Founder story */}
          <div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: C.textPrimary,
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
              }}
            >
              Why I started Harch Atelier
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <StoryParagraph>
                In late 2023, I was helping a Moroccan bank understand why
                their customer satisfaction scores were dropping. The answer
                wasn't in their internal data — it was in what Hespress and
                L'Économiste were saying about a new fee policy. But nobody
                at the bank had noticed for three weeks.
              </StoryParagraph>
              <StoryParagraph>
                I looked for a tool that could have warned them. The
                francophone options were press clipping services from the
                1990s. The modern options (Meltwater, Brandwatch) were
                English-only, priced for Fortune 500s, and didn't track what
                ChatGPT says about you.
              </StoryParagraph>
              <StoryParagraph>
                So I built one. The first version was a Python script
                crawling five media sources and querying ChatGPT every hour.
                It ran on a single brand for 30 days. The data was so
                striking that the brand became our first paying client.
              </StoryParagraph>
              <StoryParagraph>
                Today we track 30+ media sources, 8 AI engines, and 3
                languages. We have paying clients in banking, telecom,
                energy, and hospitality. We're still small, still
                founder-operated, and still building in public.
              </StoryParagraph>
            </div>

            {/* Principles */}
            <div
              style={{
                marginTop: "32px",
                padding: "24px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
              }}
            >
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                Three principles I won't compromise on
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <PrincipleRow n="01" text="No black box — every score is traceable to a source" />
                <PrincipleRow n="02" text="No lock-in — monthly, bank transfer, export anytime" />
                <PrincipleRow n="03" text="No AI-only support — real humans who know your brand" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
      <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: "13px", color: C.textPrimary, fontWeight: 600, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function StoryParagraph({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: "15px", color: C.textSecondary, lineHeight: 1.65, margin: 0 }}>
      {children}
    </p>
  );
}

function PrincipleRow({ n, text }: { n: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
      <span style={{ fontSize: "12px", fontFamily: FONT.mono, fontWeight: 700, color: C.sage, minWidth: "24px" }}>{n}</span>
      <span style={{ fontSize: "13px", color: C.textPrimary, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — TECH STACK DIAGRAM
// ═══════════════════════════════════════════════════════════════════════

function TechStack() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>Tech stack</Eyebrow>
        <SectionTitle>What's under the hood.</SectionTitle>
        <SectionSub>
          We publish our full tech stack because we believe in building in
          public. Four layers — collecte, ingestion, analyse, livraison —
          each with battle-tested open-source and frontier LLM components.
        </SectionSub>

        <div
          className="tech-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {TECH_STACK.map((layer) => (
            <TechLayer key={layer.layer} layer={layer} />
          ))}
        </div>

        {/* Flow arrow row */}
        <div
          style={{
            marginTop: "24px",
            padding: "20px 24px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Data flow
          </span>
          {TECH_STACK.map((layer, i) => (
            <React.Fragment key={layer.layer}>
              <span style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: layer.color }}>{layer.layer}</span>
              {i < TECH_STACK.length - 1 && <IconArrow size={14} color={C.textFaint} />}
            </React.Fragment>
          ))}
          <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>
            → Your phone / dashboard / inbox
          </span>
        </div>
      </div>
    </section>
  );
}

function TechLayer({ layer }: { layer: typeof TECH_STACK[number] }) {
  const bg = layer.color === C.sage ? C.sageBg : layer.color === C.accentDark ? "rgba(74,93,110,0.08)" : layer.color === C.red ? C.redBg : "rgba(139,157,175,0.10)";
  const border = layer.color === C.sage ? "rgba(74,123,95,0.2)" : layer.color === C.accentDark ? "rgba(74,93,110,0.2)" : layer.color === C.red ? "rgba(160,82,75,0.2)" : "rgba(139,157,175,0.3)";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = layer.color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Layer header */}
      <div
        style={{
          padding: "16px 20px",
          background: bg,
          borderBottom: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: "14px", fontWeight: 700, color: layer.color, letterSpacing: "-0.01em" }}>{layer.layer}</span>
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: layer.color }} aria-hidden />
      </div>

      {/* Items */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {layer.items.map((item) => (
          <div key={item.name}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: C.textPrimary, marginBottom: "3px" }}>{item.name}</div>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: layer.color, marginBottom: "4px" }}>{item.tech}</div>
            <div style={{ fontSize: "11px", color: C.textMuted, lineHeight: 1.4 }}>{item.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 05 — TIMELINE (BUILDING IN PUBLIC)
// ═══════════════════════════════════════════════════════════════════════

function TimelineSection() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>Building in public</Eyebrow>
        <SectionTitle>The story so far.</SectionTitle>
        <SectionSub>
          We publish our milestones — the wins and the pivots. Here is the
          full timeline from idea to today.
        </SectionSub>

        <div style={{ position: "relative", paddingLeft: "32px" }}>
          {/* Vertical line */}
          <div
            style={{
              position: "absolute",
              left: "10px",
              top: "8px",
              bottom: "8px",
              width: "1px",
              background: C.border,
            }}
            aria-hidden
          />

          {TIMELINE.map((event, i) => (
            <div
              key={i}
              style={{
                paddingBottom: i < TIMELINE.length - 1 ? "36px" : "0",
                position: "relative",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  position: "absolute",
                  left: "-30px",
                  top: "4px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: C.surface,
                  border: `2px solid ${event.color}`,
                }}
                aria-hidden
              />

              {/* Card */}
              <div
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "20px 24px",
                  boxShadow: SHADOW.card,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = event.color)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ fontSize: "12px", fontFamily: FONT.mono, fontWeight: 700, color: event.color, letterSpacing: "0.04em" }}>
                    {event.date}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      color: event.color,
                      background: event.color === C.sage ? C.sageBg : event.color === C.accentDark ? "rgba(74,93,110,0.08)" : event.color === C.red ? C.redBg : "rgba(139,157,175,0.10)",
                      padding: "3px 8px",
                      borderRadius: "2px",
                      border: `1px solid ${event.color === C.sage ? "rgba(74,123,95,0.2)" : event.color === C.accentDark ? "rgba(74,93,110,0.2)" : event.color === C.red ? "rgba(160,82,75,0.2)" : "rgba(139,157,175,0.3)"}`,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {event.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px", letterSpacing: "-0.01em" }}>
                  {event.title}
                </h3>
                <p style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 06 — NUMBERS / STATS
// ═══════════════════════════════════════════════════════════════════════

function Numbers() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow>By the numbers</Eyebrow>
        <SectionTitle>Harch Atelier in 2025.</SectionTitle>
        <SectionSub>
          Real numbers, updated quarterly. No vanity metrics, no inflated
          figures.
        </SectionSub>

        <div
          className="numbers-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "16px",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                padding: "24px 20px",
                textAlign: "center",
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
              <div style={{ fontSize: "36px", fontWeight: 700, fontFamily: FONT.mono, color: C.sage, lineHeight: 1, letterSpacing: "-0.03em", marginBottom: "8px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 07 — VALUES
// ═══════════════════════════════════════════════════════════════════════

function Values() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <Eyebrow color={C.sage}>Our values</Eyebrow>
        <SectionTitle>Four things we won't compromise on.</SectionTitle>
        <SectionSub>
          These aren't marketing copy. They're the principles we use to make
          product decisions, pricing decisions, and hiring decisions.
        </SectionSub>

        <div
          className="values-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          {VALUES.map((v, i) => {
            const Icon = getIcon(v.icon);
            return (
              <div
                key={i}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: "8px",
                  padding: "28px",
                  boxShadow: SHADOW.card,
                  transition: "all 0.25s",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
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
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "8px",
                    background: C.sageBg,
                    border: "1px solid rgba(74,123,95,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <Icon size={24} color={C.sage} />
                </div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                  {v.title}
                </h3>
                <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: 0, flex: 1 }}>
                  {v.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 08 — CTA
// ═══════════════════════════════════════════════════════════════════════

function CTA() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "100px 32px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
          padding: "64px 48px",
          background: C.surfaceAlt,
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
          <Eyebrow color={C.sage}>Want to work with us?</Eyebrow>
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
            See what the world says about your brand.
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
            Start with a free 7-day audit. No credit card, no commitment.
            Just real data on your reputation.
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
              Get in touch
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
        .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        .mission-grid { grid-template-columns: 1fr !important; }
        .founder-grid { grid-template-columns: 1fr !important; }
        .tech-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .numbers-grid { grid-template-columns: repeat(3, 1fr) !important; }
        .values-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 640px) {
        .tech-grid { grid-template-columns: 1fr !important; }
        .numbers-grid { grid-template-columns: repeat(2, 1fr) !important; }
        .values-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function AboutPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero />
        <Mission />
        <Founder />
        <TechStack />
        <TimelineSection />
        <Numbers />
        <Values />
        <CTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

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
// HARCH ATELIER — METHOD PAGE
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — how the monitoring works.
// Three steps: Monitor → Analyze → Deliver.
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero + pipeline headline
//   02  Three-step overview (Monitor / Analyze / Deliver)
//   03  Flow diagram (SVG pipeline)
//   04  Step 1 — Monitor (sources + intake mockup)
//   05  Step 2 — Analyze (sentiment pipeline mockup)
//   06  Step 3 — Deliver (WhatsApp + dashboard + PDF previews)
//   07  Data pipeline visualization
//   08  Sample analysis output (report excerpt)
//   09  Coverage stats
//   10  CTA
//   11  Footer
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

const MEDIA_SOURCES = [
  { name: "Le Matin", type: "Quotidien", lang: "FR" },
  { name: "L'Économiste", type: "Quotidien éco", lang: "FR" },
  { name: "Hespress", type: "Pure player", lang: "AR/FR" },
  { name: "TelQuel", type: "Hebdo", lang: "FR" },
  { name: "Médias24", type: "Pure player", lang: "FR" },
  { name: "Aujourd'hui Le Maroc", type: "Quotidien", lang: "FR" },
  { name: "Le Desk", type: "Pure player", lang: "FR" },
  { name: "ChallengeMA", type: "Pure player", lang: "FR" },
  { name: "L'Opinion", type: "Quotidien", lang: "FR" },
  { name: "Assabah", type: "Quotidien", lang: "AR" },
  { name: "Yabiladi", type: "Communauté", lang: "FR" },
  { name: "Bladi.net", type: "Communauté", lang: "FR" },
];

const AI_ENGINES = [
  { name: "ChatGPT", share: 68, lang: "FR/AR/EN" },
  { name: "Perplexity", share: 14, lang: "FR/EN" },
  { name: "Google AI Overviews", share: 9, lang: "FR" },
  { name: "Gemini", share: 5, lang: "FR/EN" },
  { name: "Claude", share: 2, lang: "FR/EN" },
  { name: "Copilot", share: 1, lang: "FR/EN" },
  { name: "Claude", share: 1, lang: "FR/EN" },
  { name: "Grok", share: 0, lang: "FR/EN" },
];

const SAMPLE_MENTIONS = [
  {
    source: "L'Économiste",
    date: "12 mars 2025",
    title: "Bank of Africa accélère son expansion en Afrique de l'Ouest",
    sentiment: "positive",
    score: 0.82,
    excerpt:
      "Le groupe bancaire marocain annonce l'ouverture de 12 agences au Sénégal et en Côte d'Ivoire...",
  },
  {
    source: "Hespress",
    date: "11 mars 2025",
    title: "Frais bancaires: les clients dénoncent une hausse",
    sentiment: "negative",
    score: -0.61,
    excerpt:
      "Sur les réseaux sociaux, de nombreux clients se plaignent d'une augmentation des frais de tenue de compte...",
  },
  {
    source: "Médias24",
    date: "10 mars 2025",
    title: "Bank of Africa publie ses résultats semestriels",
    sentiment: "neutral",
    score: 0.08,
    excerpt:
      "Le bénéfice net s'établit à 1,2 milliard de dirhams, en hausse de 3% par rapport à 2024...",
  },
  {
    source: "TelQuel",
    date: "09 mars 2025",
    title: "L'application mobile de Bank of Africa élue meilleure du secteur",
    sentiment: "positive",
    score: 0.71,
    excerpt:
      "Lors de la cérémonie des Maroc Tech Awards, l'application BOA Mobile a remporté le prix...",
  },
];

const PIPELINE_STAGES = [
  {
    n: "01",
    title: "Monitor",
    sub: "Collecte 24/7",
    desc: "30+ sources media, 8 moteurs IA, 3 langues. Crawl continu, RSS, APIs, scraping éthique.",
    color: C.sage,
    icon: "radar",
  },
  {
    n: "02",
    title: "Analyze",
    sub: "NLP + LLM",
    desc: "Détection d'entités, sentiment, sujets, langue. Classification multi-axes par HarchIQ.",
    color: C.accentDark,
    icon: "ai",
  },
  {
    n: "03",
    title: "Deliver",
    sub: "WhatsApp + PDF",
    desc: "Daily digest 7h, alertes crise <5min, dashboard live, rapport mensuel PDF.",
    color: C.red,
    icon: "bell",
  },
];

const TIMELINE_EVENTS = [
  { t: "T+0min", label: "Article publié sur hespress.com", color: C.accent },
  { t: "T+2min", label: "Crawler détecte le nouvel article", color: C.accentDark },
  { t: "T+3min", label: "NLP extrait entités + langue", color: C.accentDark },
  { t: "T+4min", label: "HarchIQ classe sentiment: négatif (-0.61)", color: C.red },
  { t: "T+5min", label: "Alerte WhatsApp envoyée au comms team", color: C.sage },
  { t: "T+7h00", label: "Inclus dans le daily digest", color: C.sage },
  { t: "T+30j", label: "Inclus dans le rapport mensuel PDF", color: C.sage },
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
      <span
        style={{
          width: "48px",
          height: "1px",
          background: `linear-gradient(to right, ${color}, transparent)`,
          opacity: 0.6,
        }}
        aria-hidden
      />
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

function buildLinePath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  return data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildAreaPath(data: number[], w: number, h: number, max = 100): string {
  const step = w / (data.length - 1);
  const line = data
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return `${line} L ${w.toFixed(1)} ${h.toFixed(1)} L 0 ${h.toFixed(1)} Z`;
}

// ─── SVG ICONS ─────────────────────────────────────────────────────────

function IconRadar({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="12" x2="20" y2="6" />
      <circle cx="20" cy="6" r="1.5" fill={color} />
    </svg>
  );
}

function IconAI({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6v6H9z" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function IconBell({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="6" r="3" fill={color} stroke={color} />
    </svg>
  );
}

function IconArrow({ dir = "right", size = 20, color = C.textMuted }: { dir?: "right" | "up" | "down"; size?: number; color?: string }) {
  if (dir === "up") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    );
  }
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

function IconGlobe({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconDatabase({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </svg>
  );
}

function IconFlow({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="6" height="6" rx="1" />
      <rect x="16" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M5 9v3a2 2 0 0 0 2 2h3" />
      <path d="M19 9v3a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

function IconClock({ size = 16, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconDoc({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
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
      {/* Subtle background accents */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-100px",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "64px", alignItems: "center" }}>
          <div>
            <Eyebrow color={C.sage}>Méthode · 3 étapes</Eyebrow>
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
              Monitor. Analyze. Deliver.
              <br />
              <span style={{ color: C.sage }}>Three steps, every day.</span>
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: C.textSecondary,
                lineHeight: 1.55,
                maxWidth: "540px",
                margin: "0 0 32px",
              }}
            >
              No magic. No black box. Just a clear pipeline: we collect every
              mention of your brand across media and AI engines, classify it
              with NLP + LLM, and deliver insights to your WhatsApp, dashboard,
              and monthly PDF.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
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
                Start with a free audit
                <IconArrow dir="right" size={16} color="#FFFFFF" />
              </a>
              <a
                href="/atelier/pricing"
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
                See pricing
              </a>
            </div>

            {/* Trust indicators */}
            <div
              style={{
                marginTop: "48px",
                display: "flex",
                gap: "32px",
                flexWrap: "wrap",
              }}
            >
              <HeroStat value="30+" label="Media sources" />
              <HeroStat value="8" label="AI engines" />
              <HeroStat value="3" label="Languages" />
              <HeroStat value="< 5min" label="Alert latency" />
            </div>
          </div>

          {/* Right: pipeline mini diagram */}
          <PipelineMiniDiagram />
        </div>
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "24px",
          fontWeight: 700,
          fontFamily: FONT.mono,
          color: C.textPrimary,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: C.textMuted,
          fontFamily: FONT.mono,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginTop: "4px",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function PipelineMiniDiagram() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        padding: "32px 28px",
        position: "relative",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <IconFlow size={14} color={C.sage} />
        Pipeline overview
      </div>

      {/* Stages */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.n}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px 0",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "6px",
                  background: stage.color === C.sage ? C.sageBg : stage.color === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg,
                  border: `1px solid ${stage.color === C.sage ? "rgba(74,123,95,0.2)" : stage.color === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: "14px", fontFamily: FONT.mono, fontWeight: 700, color: stage.color }}>
                  {stage.n}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.01em" }}>
                  {stage.title}
                </div>
                <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "2px" }}>
                  {stage.sub}
                </div>
              </div>
              <IconArrow dir="right" size={16} color={C.textFaint} />
            </div>
            {i < PIPELINE_STAGES.length - 1 && (
              <div style={{ paddingLeft: "22px", height: "20px" }}>
                <div style={{ width: "1px", height: "100%", background: C.border }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Output line */}
      <div
        style={{
          marginTop: "20px",
          paddingTop: "20px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Daily output
        </span>
        <span style={{ fontSize: "13px", fontFamily: FONT.mono, color: C.sage, fontWeight: 600 }}>
          ~247 mentions / day
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — THREE-STEP OVERVIEW
// ═══════════════════════════════════════════════════════════════════════

function OverviewSteps() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow>How it works</Eyebrow>
        <SectionTitle>Three steps. No black box.</SectionTitle>
        <SectionSub>
          Most reputation tools sell you a magic score. We show you the
          pipeline. Every insight we deliver can be traced back to a source
          article, an AI response, and a sentiment score with its confidence
          interval.
        </SectionSub>

        <div
          className="overview-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
          }}
        >
          {PIPELINE_STAGES.map((stage) => (
            <OverviewStepCard key={stage.n} stage={stage} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OverviewStepCard({ stage }: { stage: typeof PIPELINE_STAGES[number] }) {
  const Icon = stage.icon === "radar" ? IconRadar : stage.icon === "ai" ? IconAI : IconBell;
  const bg = stage.color === C.sage ? C.sageBg : stage.color === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg;
  const border = stage.color === C.sage ? "rgba(74,123,95,0.2)" : stage.color === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "32px 28px",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = stage.color;
        e.currentTarget.style.boxShadow = SHADOW.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = SHADOW.card;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "8px",
            background: bg,
            border: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={28} color={stage.color} />
        </div>
        <span
          style={{
            fontSize: "13px",
            fontFamily: FONT.mono,
            fontWeight: 700,
            color: stage.color,
            letterSpacing: "0.08em",
          }}
        >
          {stage.n}
        </span>
      </div>

      <h3
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 4px",
          letterSpacing: "-0.02em",
        }}
      >
        {stage.title}
      </h3>
      <div
        style={{
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        {stage.sub}
      </div>
      <p
        style={{
          fontSize: "15px",
          color: C.textSecondary,
          lineHeight: 1.6,
          margin: "0 0 24px",
          flex: 1,
        }}
      >
        {stage.desc}
      </p>

      {/* Mini stats */}
      <div
        style={{
          paddingTop: "20px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          gap: "20px",
        }}
      >
        {stage.n === "01" && (
          <>
            <MiniStat value="30+" unit="sources" />
            <MiniStat value="24/7" unit="crawl" />
          </>
        )}
        {stage.n === "02" && (
          <>
            <MiniStat value="3" unit="langues" />
            <MiniStat value="HarchIQ" unit="IA trainable" />
          </>
        )}
        {stage.n === "03" && (
          <>
            <MiniStat value="< 5min" unit="alerte" />
            <MiniStat value="7h00" unit="digest" />
          </>
        )}
      </div>
    </div>
  );
}

function MiniStat({ value, unit }: { value: string; unit: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 700,
          fontFamily: FONT.mono,
          color: C.textPrimary,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          marginTop: "4px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {unit}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — FLOW DIAGRAM (SVG)
// ═══════════════════════════════════════════════════════════════════════

function FlowDiagram() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow color={C.sage}>Pipeline diagram</Eyebrow>
        <SectionTitle>From raw article to WhatsApp alert.</SectionTitle>
        <SectionSub>
          The full data pipeline. Every box is a process, every arrow is a
          data flow. Latency targets are shown on each transition.
        </SectionSub>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            padding: "32px",
            overflowX: "auto",
          }}
        >
          <FlowDiagramSVG />
        </div>
      </div>
    </section>
  );
}

function FlowDiagramSVG() {
  // Boxes coordinates (in a 1200x520 viewBox)
  const boxes = [
    { x: 30, y: 60, w: 180, h: 80, label: "Media sources", sub: "30+ sites", color: C.accent, icon: "globe" },
    { x: 30, y: 220, w: 180, h: 80, label: "AI engines", sub: "8 LLMs", color: C.accent, icon: "ai" },
    { x: 30, y: 380, w: 180, h: 80, label: "Social signals", sub: "RSS + APIs", color: C.accent, icon: "bell" },

    { x: 320, y: 200, w: 200, h: 100, label: "Ingestion", sub: "Crawl · Parse · Dedup", color: C.accentDark, icon: "db" },

    { x: 620, y: 120, w: 200, h: 80, label: "NER", sub: "Entity extraction", color: C.accentDark, icon: "ai" },
    { x: 620, y: 220, w: 200, h: 80, label: "Sentiment", sub: "HarchIQ classify", color: C.accentDark, icon: "ai" },
    { x: 620, y: 320, w: 200, h: 80, label: "Topic model", sub: "BERTopic", color: C.accentDark, icon: "ai" },

    { x: 920, y: 60, w: 220, h: 80, label: "WhatsApp digest", sub: "7h00 daily", color: C.sage, icon: "bell" },
    { x: 920, y: 180, w: 220, h: 80, label: "Crisis alerts", sub: "<5min latency", color: C.red, icon: "bell" },
    { x: 920, y: 300, w: 220, h: 80, label: "Dashboard", sub: "live", color: C.sage, icon: "chart" },
    { x: 920, y: 420, w: 220, h: 80, label: "Monthly PDF", sub: "board-ready", color: C.sage, icon: "doc" },
  ];

  // Arrows
  const arrows = [
    { x1: 210, y1: 100, x2: 320, y2: 230, label: "RSS" },
    { x1: 210, y1: 260, x2: 320, y2: 250, label: "API" },
    { x1: 210, y1: 420, x2: 320, y2: 270, label: "webhook" },
    { x1: 520, y1: 230, x2: 620, y2: 160, label: "" },
    { x1: 520, y1: 250, x2: 620, y2: 260, label: "" },
    { x1: 520, y1: 270, x2: 620, y2: 360, label: "" },
    { x1: 820, y1: 160, x2: 920, y2: 100, label: "" },
    { x1: 820, y1: 240, x2: 920, y2: 220, label: "" },
    { x1: 820, y1: 320, x2: 920, y2: 340, label: "" },
    { x1: 820, y1: 380, x2: 920, y2: 460, label: "" },
  ];

  return (
    <svg viewBox="0 0 1180 540" width="100%" style={{ display: "block", minWidth: "900px" }}>
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={C.textFaint} />
        </marker>
        <marker id="arrowheadSage" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={C.sage} />
        </marker>
        <marker id="arrowheadRed" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={C.red} />
        </marker>
      </defs>

      {/* Column labels */}
      <text x="120" y="30" textAnchor="middle" fontSize="11" fontFamily={FONT.mono} fill={C.textMuted} letterSpacing="2">COLLECTE</text>
      <text x="420" y="30" textAnchor="middle" fontSize="11" fontFamily={FONT.mono} fill={C.textMuted} letterSpacing="2">INGESTION</text>
      <text x="720" y="30" textAnchor="middle" fontSize="11" fontFamily={FONT.mono} fill={C.textMuted} letterSpacing="2">ANALYSE</text>
      <text x="1030" y="30" textAnchor="middle" fontSize="11" fontFamily={FONT.mono} fill={C.textMuted} letterSpacing="2">LIVRAISON</text>

      {/* Column dividers */}
      <line x1="265" y1="50" x2="265" y2="520" stroke={C.borderLight} strokeDasharray="4 4" />
      <line x1="570" y1="50" x2="570" y2="520" stroke={C.borderLight} strokeDasharray="4 4" />
      <line x1="870" y1="50" x2="870" y2="520" stroke={C.borderLight} strokeDasharray="4 4" />

      {/* Arrows */}
      {arrows.map((a, i) => {
        const targetBox = boxes.find((b) => b.x === a.x2 && b.y === a.y2);
        const markerId = targetBox?.color === C.sage ? "arrowheadSage" : targetBox?.color === C.red ? "arrowheadRed" : "arrowhead";
        const strokeColor = targetBox?.color === C.sage ? C.sage : targetBox?.color === C.red ? C.red : C.textFaint;
        return (
          <g key={i}>
            <path
              d={`M ${a.x1} ${a.y1} C ${(a.x1 + a.x2) / 2} ${a.y1}, ${(a.x1 + a.x2) / 2} ${a.y2}, ${a.x2} ${a.y2}`}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              markerEnd={`url(#${markerId})`}
              opacity="0.6"
            />
            {a.label && (
              <text
                x={(a.x1 + a.x2) / 2}
                y={(a.y1 + a.y2) / 2 - 4}
                textAnchor="middle"
                fontSize="9"
                fontFamily={FONT.mono}
                fill={C.textMuted}
              >
                {a.label}
              </text>
            )}
          </g>
        );
      })}

      {/* Boxes */}
      {boxes.map((b, i) => {
        const isRed = b.color === C.red;
        const isSage = b.color === C.sage;
        const isAccent = b.color === C.accent;
        const bg = isRed ? C.redBg : isSage ? C.sageBg : isAccent ? "rgba(139,157,175,0.10)" : "rgba(74,93,110,0.08)";
        const border = isRed ? "rgba(160,82,75,0.25)" : isSage ? "rgba(74,123,95,0.25)" : isAccent ? "rgba(139,157,175,0.30)" : "rgba(74,93,110,0.25)";
        return (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="6"
              fill={C.surface}
              stroke={border}
              strokeWidth="1.5"
            />
            <rect
              x={b.x}
              y={b.y}
              width="4"
              height={b.h}
              rx="2"
              fill={b.color}
            />
            <text
              x={b.x + 20}
              y={b.y + 30}
              fontSize="13"
              fontFamily={FONT.sans}
              fontWeight="700"
              fill={C.textPrimary}
            >
              {b.label}
            </text>
            <text
              x={b.x + 20}
              y={b.y + 50}
              fontSize="11"
              fontFamily={FONT.mono}
              fill={C.textMuted}
            >
              {b.sub}
            </text>
            <circle
              cx={b.x + b.w - 20}
              cy={b.y + b.h - 20}
              r="4"
              fill={b.color}
              opacity="0.6"
            />
          </g>
        );
      })}

      {/* Latency badges */}
      <g>
        <rect x="240" y="180" width="60" height="20" rx="3" fill={C.surfaceAlt} stroke={C.border} />
        <text x="270" y="194" textAnchor="middle" fontSize="10" fontFamily={FONT.mono} fill={C.textMuted}>~2min</text>

        <rect x="540" y="180" width="60" height="20" rx="3" fill={C.surfaceAlt} stroke={C.border} />
        <text x="570" y="194" textAnchor="middle" fontSize="10" fontFamily={FONT.mono} fill={C.textMuted}>~1min</text>

        <rect x="840" y="180" width="60" height="20" rx="3" fill={C.surfaceAlt} stroke={C.border} />
        <text x="870" y="194" textAnchor="middle" fontSize="10" fontFamily={FONT.mono} fill={C.textMuted}>~2min</text>
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — STEP 1: MONITOR
// ═══════════════════════════════════════════════════════════════════════

function StepMonitor() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div className="step-split" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "64px", alignItems: "start" }}>
          {/* Left: copy */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  color: C.sage,
                  background: C.sageBg,
                  border: "1px solid rgba(74,123,95,0.2)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                }}
              >
                STEP 01
              </span>
              <span style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>~2min latency</span>
            </div>
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
              Monitor — we never miss a mention.
            </h2>
            <p
              style={{
                fontSize: "17px",
                color: C.textSecondary,
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              We crawl 30+ Moroccan and African media sources every 60 seconds.
              RSS, APIs, and ethical scraping. We also query 8 AI engines every
              hour to see what they say about you on the prompts that matter.
            </p>

            {/* Source list */}
            <div
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <IconGlobe size={12} color={C.sage} />
                12 of 30+ media sources
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                  gap: "10px",
                }}
              >
                {MEDIA_SOURCES.map((s) => (
                  <div
                    key={s.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      background: C.surface,
                      border: `1px solid ${C.borderLight}`,
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>{s.name}</span>
                    <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>{s.lang}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage stats */}
            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <CoverageStat value="30+" label="Media sources" color={C.sage} />
              <CoverageStat value="8" label="AI engines" color={C.accentDark} />
              <CoverageStat value="60s" label="Crawl interval" color={C.sage} />
              <CoverageStat value="3" label="Languages" color={C.accentDark} />
            </div>
          </div>

          {/* Right: intake mockup */}
          <MonitorIntakeMockup />
        </div>
      </div>
    </section>
  );
}

function CoverageStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          fontFamily: FONT.mono,
          color: color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: C.textMuted,
          fontFamily: FONT.mono,
          marginTop: "6px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function MonitorIntakeMockup() {
  const [tick, setTick] = useState(0);
  // Static display, no animation needed for light theme
  const feed = [
    { src: "Hespress", t: "12:42", title: "Bank of Africa: nouveau partenariat", lang: "AR" },
    { src: "L'Économiste", t: "12:31", title: "Marché monétaire: la BAM injecte 8 Mds", lang: "FR" },
    { src: "Médias24", t: "12:18", title: "Telecom: Inwi dépasse 15M d'abonnés", lang: "FR" },
    { src: "TelQuel", t: "11:59", title: "OCP Group annonce un investissement", lang: "FR" },
    { src: "Le Matin", t: "11:47", title: "RAM: nouveaux vols vers l'Asie", lang: "FR" },
    { src: "Aujourd'hui", t: "11:32", title: "CIH Bank lance offre premium", lang: "FR" },
  ];
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        overflow: "hidden",
      }}
    >
      {/* Window top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surfaceAlt,
        }}
      >
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
          atelier.harchcorp.com / monitor / live
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: C.sage,
            background: C.sageBg,
            padding: "3px 8px",
            borderRadius: "2px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "1px solid rgba(74,123,95,0.2)",
          }}
        >
          ● Live
        </span>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "0",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {[
          { label: "Crawled today", value: "2,847", color: C.sage },
          { label: "New (1h)", value: "47", color: C.textPrimary },
          { label: "Dedup'd", value: "312", color: C.textMuted },
          { label: "Queued", value: "8", color: C.red },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: "16px",
              borderRight: i < 3 ? `1px solid ${C.borderLight}` : "none",
            }}
          >
            <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: FONT.mono, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ padding: "16px" }}>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
          Recent intake · last 60 minutes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {feed.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                background: C.surfaceAlt,
                border: `1px solid ${C.borderLight}`,
                borderRadius: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  minWidth: "38px",
                }}
              >
                {item.t}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  color: C.accentDark,
                  background: "rgba(74,93,110,0.08)",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  minWidth: "70px",
                  textAlign: "center",
                }}
              >
                {item.src}
              </span>
              <span style={{ fontSize: "13px", color: C.textPrimary, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.title}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.sage,
                  border: `1px solid rgba(74,123,95,0.3)`,
                  padding: "1px 5px",
                  borderRadius: "2px",
                }}
              >
                {item.lang}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          <span>Last crawl: 12:47:03</span>
          <span style={{ color: C.sage }}>● All sources operational</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 05 — STEP 2: ANALYZE
// ═══════════════════════════════════════════════════════════════════════

function StepAnalyze() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div className="step-split" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "64px", alignItems: "start" }}>
          {/* Left: analysis mockup */}
          <AnalysisPipelineMockup />

          {/* Right: copy */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "13px",
                  fontFamily: FONT.mono,
                  fontWeight: 700,
                  color: C.accentDark,
                  background: "rgba(74,93,110,0.08)",
                  border: "1px solid rgba(74,93,110,0.2)",
                  padding: "4px 10px",
                  borderRadius: "2px",
                  letterSpacing: "0.08em",
                }}
              >
                STEP 02
              </span>
              <span style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>~1min per article</span>
            </div>
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
              Analyze — every word, every mention, classified.
            </h2>
            <p
              style={{
                fontSize: "17px",
                color: C.textSecondary,
                lineHeight: 1.6,
                margin: "0 0 32px",
              }}
            >
              Each article goes through three NLP stages: entity extraction
              (NER) to detect which company / person / product is mentioned,
              sentiment classification via HarchIQ in French, Arabic, and
              English, and topic modeling (BERTopic) to cluster themes over
              time.
            </p>

            {/* Analysis stages */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <AnalysisStageRow n="2.1" title="NER — Named Entity Recognition" desc="Detects companies, people, products, locations. Multi-language." tag="spaCy + custom" />
              <AnalysisStageRow n="2.2" title="Sentiment classification" desc="HarchIQ assigns a score from -1 (negative) to +1 (positive) with confidence." tag="HarchIQ" />
              <AnalysisStageRow n="2.3" title="Topic modeling" desc="BERTopic clusters articles into themes: 'frais bancaires', 'résultats', 'service client'." tag="BERTopic" />
              <AnalysisStageRow n="2.4" title="Language detection" desc="FR / AR / EN / Darija — handles code-switching common in Moroccan media." tag="fastText" />
            </div>

            {/* Output format */}
            <div
              style={{
                marginTop: "32px",
                padding: "20px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
              }}
            >
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
                Output record (JSON)
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 0,
                  fontFamily: FONT.mono,
                  fontSize: "11px",
                  lineHeight: 1.6,
                  color: C.textSecondary,
                  background: "transparent",
                  overflowX: "auto",
                }}
              >
{`{
  "article_id": "hes_3489",
  "source": "hespress.com",
  "entities": ["Bank of Africa", "BMCE"],
  "sentiment": -0.61,
  "sentiment_label": "negative",
  "confidence": 0.92,
  "topic": "frais_bancaires",
  "language": "fr",
  "alert": true
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalysisStageRow({ n, title, desc, tag }: { n: string; title: string; desc: string; tag: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.accent)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
    >
      <span
        style={{
          fontSize: "13px",
          fontFamily: FONT.mono,
          fontWeight: 700,
          color: C.accentDark,
          minWidth: "32px",
        }}
      >
        {n}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: 700, color: C.textPrimary }}>{title}</span>
          <span
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.sage,
              background: C.sageBg,
              padding: "2px 6px",
              borderRadius: "2px",
              border: "1px solid rgba(74,123,95,0.2)",
            }}
          >
            {tag}
          </span>
        </div>
        <div style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function AnalysisPipelineMockup() {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surfaceAlt,
        }}
      >
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
        <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
          atelier.harchcorp.com / analyze / hes_3489
        </span>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Article preview */}
        <div
          style={{
            padding: "16px",
            background: C.surfaceAlt,
            border: `1px solid ${C.borderLight}`,
            borderRadius: "6px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>Source: hespress.com · 12 mars 2025</span>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.sage }}>FR</span>
          </div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: C.textPrimary, marginBottom: "8px" }}>
            Frais bancaires: les clients dénoncent une hausse
          </div>
          <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>
            Sur les réseaux sociaux, de nombreux clients se plaignent d'une
            augmentation des frais de tenue de compte. Bank of Africa n'a pas
            encore réagi officiellement...
          </p>
        </div>

        {/* Analysis stages */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* NER */}
          <AnalysisStageRowMini
            label="NER — Entities"
            status="done"
            chips={[
              { text: "Bank of Africa", color: C.sage },
              { text: "BMCE", color: C.sage },
              { text: "Maroc", color: C.accentDark },
            ]}
          />
          {/* Language */}
          <AnalysisStageRowMini
            label="Language"
            status="done"
            chips={[
              { text: "FR (0.94)", color: C.sage },
              { text: "AR (0.04)", color: C.textMuted },
              { text: "Darija (0.02)", color: C.textMuted },
            ]}
          />
          {/* Sentiment */}
          <AnalysisStageRowMini
            label="Sentiment (HarchIQ)"
            status="done"
            custom={
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flex: 1, height: "8px", background: C.border, borderRadius: "4px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "30.5%", background: C.red }} />
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: C.textPrimary }} />
                </div>
                <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.red, fontWeight: 700, minWidth: "60px", textAlign: "right" }}>
                  -0.61
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    color: C.red,
                    background: C.redBg,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    border: "1px solid rgba(160,82,75,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Negative
                </span>
              </div>
            }
          />
          {/* Topic */}
          <AnalysisStageRowMini
            label="Topic (BERTopic)"
            status="done"
            chips={[{ text: "frais_bancaires", color: C.accentDark }, { text: "service_client", color: C.textMuted }]}
          />
          {/* Alert trigger */}
          <AnalysisStageRowMini
            label="Crisis alert"
            status="triggered"
            custom={
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "12px", color: C.textSecondary }}>
                  Sentiment &lt; -0.5 on tracked entity
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    color: C.red,
                    background: C.redBg,
                    padding: "3px 8px",
                    borderRadius: "2px",
                    border: "1px solid rgba(160,82,75,0.3)",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  ● Triggered
                </span>
              </div>
            }
          />
        </div>

        {/* Final score */}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Final score
            </div>
            <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT.mono, color: C.red, marginTop: "4px" }}>
              -0.61 <span style={{ fontSize: "12px", color: C.textMuted, fontWeight: 500 }}>/ -1.0</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>Confidence</span>
            <span style={{ fontSize: "14px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>92%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisStageRowMini({
  label,
  status,
  chips,
  custom,
}: {
  label: string;
  status: "done" | "triggered";
  chips?: { text: string; color: string }[];
  custom?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        background: C.surfaceAlt,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "4px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", fontFamily: FONT.mono, color: C.sage }}>
          {status === "triggered" ? (
            <span style={{ color: C.red }}>● triggered</span>
          ) : (
            <>
              <IconCheck size={10} color={C.sage} /> done
            </>
          )}
        </span>
      </div>
      {chips && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {chips.map((c, i) => (
            <span
              key={i}
              style={{
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: c.color,
                background: c.color === C.sage ? C.sageBg : c.color === C.red ? C.redBg : "rgba(74,93,110,0.08)",
                padding: "3px 8px",
                borderRadius: "2px",
                border: `1px solid ${c.color === C.sage ? "rgba(74,123,95,0.2)" : c.color === C.red ? "rgba(160,82,75,0.2)" : "rgba(74,93,110,0.2)"}`,
              }}
            >
              {c.text}
            </span>
          ))}
        </div>
      )}
      {custom && <div>{custom}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 06 — STEP 3: DELIVER
// ═══════════════════════════════════════════════════════════════════════

function StepDeliver() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontFamily: FONT.mono,
                fontWeight: 700,
                color: C.red,
                background: C.redBg,
                border: "1px solid rgba(160,82,75,0.2)",
                padding: "4px 10px",
                borderRadius: "2px",
                letterSpacing: "0.08em",
              }}
            >
              STEP 03
            </span>
            <span style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>3 delivery channels</span>
          </div>
          <h2
            style={{
              fontSize: "clamp(30px, 4vw, 46px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.textPrimary,
              margin: "0 0 20px",
              maxWidth: "820px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Deliver — insights where you already are.
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            No new app to install, no dashboard you have to remember to check.
            Insights land in WhatsApp, in your dashboard, and in your inbox as
            a monthly PDF.
          </p>
        </div>

        {/* Three channels */}
        <div
          className="deliver-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
          }}
        >
          {/* WhatsApp */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              boxShadow: SHADOW.card,
              padding: "24px",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  background: C.sageBg,
                  border: "1px solid rgba(74,123,95,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconBell size={22} color={C.sage} />
              </div>
              <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.sage, background: C.sageBg, padding: "3px 8px", borderRadius: "2px", border: "1px solid rgba(74,123,95,0.2)" }}>
                7h00 daily
              </span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>WhatsApp digest</h3>
            <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: "0 0 20px" }}>
              Every morning at 7:00 — yesterday's mentions, sentiment score,
              top topics, and any crisis alerts.
            </p>

            {/* Mini WhatsApp preview */}
            <div
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.borderLight}`,
                borderRadius: "6px",
                padding: "12px",
                fontFamily: FONT.mono,
                fontSize: "11px",
                color: C.textSecondary,
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: C.sage, fontWeight: 700, marginBottom: "6px" }}>Harch Atelier · 7:00</div>
              <div>Bank of Africa · 13 mars</div>
              <div>Score: 78/100 ↑ +4.2</div>
              <div>Articles: 12 · AI: 3 citations</div>
              <div style={{ color: C.red, marginTop: "6px" }}>● 1 alerte (frais bancaires)</div>
            </div>
          </div>

          {/* Dashboard */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              boxShadow: SHADOW.card,
              padding: "24px",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.accentDark;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  background: "rgba(74,93,110,0.08)",
                  border: "1px solid rgba(74,93,110,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconFlow size={22} color={C.accentDark} />
              </div>
              <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.accentDark, background: "rgba(74,93,110,0.08)", padding: "3px 8px", borderRadius: "2px", border: "1px solid rgba(74,93,110,0.2)" }}>
                live 24/7
              </span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>Live dashboard</h3>
            <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: "0 0 20px" }}>
              Full historical view — 30 / 90 / 365 days. Drill into any
              article, any topic, any source. Export to CSV.
            </p>

            {/* Mini dashboard preview */}
            <div
              style={{
                background: C.surfaceAlt,
                border: `1px solid ${C.borderLight}`,
                borderRadius: "6px",
                padding: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>30-day trend</span>
                <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>+20 pts</span>
              </div>
              <svg width="100%" height="40" viewBox="0 0 200 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="methodDashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.sage} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={buildAreaPath([55, 58, 56, 62, 60, 65, 63, 68, 66, 70, 72, 75], 200, 40, 100)} fill="url(#methodDashGrad)" />
                <path d={buildLinePath([55, 58, 56, 62, 60, 65, 63, 68, 66, 70, 72, 75], 200, 40, 100)} fill="none" stroke={C.sage} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* PDF */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              boxShadow: SHADOW.card,
              padding: "24px",
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.red;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "8px",
                  background: C.redBg,
                  border: "1px solid rgba(160,82,75,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconDoc size={22} color={C.red} />
              </div>
              <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.red, background: C.redBg, padding: "3px 8px", borderRadius: "2px", border: "1px solid rgba(160,82,75,0.2)" }}>
                monthly
              </span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>Monthly PDF report</h3>
            <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: "0 0 20px" }}>
              12-page board-ready report — reputation score, top risks,
              competitor benchmark, recommended actions.
            </p>

            {/* Mini PDF preview */}
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                Harch Atelier · Mars 2025
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: C.textPrimary }}>Reputation Report</div>
              <div style={{ fontSize: "11px", color: C.textSecondary }}>Bank of Africa · 32 pages</div>
              <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                <div style={{ flex: 2, height: "4px", background: C.sage, borderRadius: "2px" }} />
                <div style={{ flex: 1, height: "4px", background: C.neutral, borderRadius: "2px" }} />
                <div style={{ flex: 0.5, height: "4px", background: C.red, borderRadius: "2px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted }}>
                <span style={{ color: C.sage }}>68% pos</span>
                <span>22% neu</span>
                <span style={{ color: C.red }}>10% neg</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 07 — DATA PIPELINE VISUALIZATION (TIMELINE)
// ═══════════════════════════════════════════════════════════════════════

function DataTimeline() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow color={C.sage}>End-to-end timeline</Eyebrow>
        <SectionTitle>From publication to your inbox — in 5 minutes.</SectionTitle>
        <SectionSub>
          Here is what happens when a negative article about your brand is
          published on Hespress at 12:42. Every stage is timestamped and
          logged. You can audit the full trail.
        </SectionSub>

        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            padding: "32px",
          }}
        >
          <div style={{ position: "relative", paddingLeft: "24px" }}>
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: "8px",
                bottom: "8px",
                width: "1px",
                background: C.border,
              }}
              aria-hidden
            />
            {TIMELINE_EVENTS.map((ev, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "20px",
                  paddingBottom: i < TIMELINE_EVENTS.length - 1 ? "28px" : "0",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-22px",
                    top: "4px",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: C.surface,
                    border: `2px solid ${ev.color}`,
                  }}
                  aria-hidden
                />
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: "13px",
                    fontWeight: 700,
                    color: ev.color,
                    minWidth: "80px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {ev.t}
                </div>
                <div style={{ fontSize: "14px", color: C.textPrimary, lineHeight: 1.5 }}>
                  {ev.label}
                </div>
              </div>
            ))}
          </div>

          {/* Stats footer */}
          <div
            style={{
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: `1px solid ${C.borderLight}`,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            <TimelineStat value="5min" label="Detection → alert" color={C.red} />
            <TimelineStat value="7h00" label="Daily digest" color={C.sage} />
            <TimelineStat value="24h" label="Dashboard update" color={C.accentDark} />
            <TimelineStat value="30j" label="Monthly PDF" color={C.red} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "24px", fontWeight: 700, fontFamily: FONT.mono, color: color, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 08 — SAMPLE ANALYSIS OUTPUT
// ═══════════════════════════════════════════════════════════════════════

function SampleOutput() {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow>Sample output</Eyebrow>
        <SectionTitle>What a real analysis record looks like.</SectionTitle>
        <SectionSub>
          Four real mentions of Bank of Africa, classified by our pipeline.
          This is what you see in your dashboard every morning.
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
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              borderBottom: `1px solid ${C.border}`,
              background: C.surfaceAlt,
            }}
          >
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#E5E5E5" }} />
            <span style={{ marginLeft: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.04em" }}>
              atelier.harchcorp.com / mentions / bank-of-africa
            </span>
          </div>

          {/* Filter row */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              padding: "12px 16px",
              borderBottom: `1px solid ${C.borderLight}`,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "All", active: true },
              { label: "Positive (1)", active: false },
              { label: "Neutral (1)", active: false },
              { label: "Negative (1)", active: false },
            ].map((f, i) => (
              <span
                key={i}
                style={{
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  padding: "4px 10px",
                  borderRadius: "2px",
                  background: f.active ? C.sage : C.surfaceAlt,
                  color: f.active ? "#FFFFFF" : C.textMuted,
                  border: `1px solid ${f.active ? C.sage : C.border}`,
                  letterSpacing: "0.04em",
                }}
              >
                {f.label}
              </span>
            ))}
          </div>

          {/* Mentions */}
          <div style={{ padding: "8px 16px 16px" }}>
            {SAMPLE_MENTIONS.map((m, i) => (
              <SampleMentionRow key={i} m={m} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SampleMentionRow({ m }: { m: typeof SAMPLE_MENTIONS[number] }) {
  const isPos = m.sentiment === "positive";
  const isNeg = m.sentiment === "negative";
  const color = isPos ? C.sage : isNeg ? C.red : C.neutral;
  const bg = isPos ? C.sageBg : isNeg ? C.redBg : C.neutralBg;
  const border = isPos ? "rgba(74,123,95,0.2)" : isNeg ? "rgba(160,82,75,0.2)" : "rgba(113,113,122,0.2)";
  return (
    <div
      style={{
        padding: "16px",
        borderBottom: `1px solid ${C.borderLight}`,
        display: "grid",
        gridTemplateColumns: "120px 1fr 160px",
        gap: "20px",
        alignItems: "center",
      }}
    >
      {/* Source */}
      <div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: C.textPrimary }}>{m.source}</div>
        <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px" }}>{m.date}</div>
      </div>

      {/* Title + excerpt */}
      <div>
        <div style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary, marginBottom: "6px", lineHeight: 1.4 }}>
          {m.title}
        </div>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.5 }}>
          {m.excerpt}
        </div>
      </div>

      {/* Sentiment */}
      <div style={{ textAlign: "right" }}>
        <span
          style={{
            display: "inline-block",
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: color,
            background: bg,
            padding: "3px 8px",
            borderRadius: "2px",
            border: `1px solid ${border}`,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          {m.sentiment}
        </span>
        <div style={{ fontSize: "16px", fontFamily: FONT.mono, fontWeight: 700, color: color }}>
          {m.score > 0 ? "+" : ""}{m.score.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 09 — COVERAGE STATS
// ═══════════════════════════════════════════════════════════════════════

function Coverage() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Eyebrow color={C.sage}>Coverage</Eyebrow>
        <SectionTitle>What we monitor, in numbers.</SectionTitle>
        <SectionSub>
          A complete picture requires complete coverage. Here is the full
          list of what our pipeline touches every day.
        </SectionSub>

        <div
          className="coverage-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <CoverageCard
            icon={<IconGlobe size={24} color={C.sage} />}
            value="30+"
            label="Media sources"
            sub="Moroccan + African"
            color={C.sage}
          />
          <CoverageCard
            icon={<IconAI size={24} color={C.accentDark} />}
            value="8"
            label="AI engines"
            sub="ChatGPT, Perplexity, Gemini..."
            color={C.accentDark}
          />
          <CoverageCard
            icon={<IconDatabase size={24} color={C.red} />}
            value="3"
            label="Languages"
            sub="FR · AR · EN"
            color={C.red}
          />
          <CoverageCard
            icon={<IconClock size={24} color={C.sage} />}
            value="60s"
            label="Crawl interval"
            sub="continuous, 24/7"
            color={C.sage}
          />
        </div>

        {/* AI engine share */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            padding: "28px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <IconAI size={14} color={C.accentDark} />
            AI engine share — what your customers actually use
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {AI_ENGINES.map((e) => (
              <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ minWidth: "160px", fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>
                  {e.name}
                </div>
                <div style={{ flex: 1, height: "8px", background: C.surfaceAlt, borderRadius: "4px", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${e.share}%`,
                      height: "100%",
                      background: e.share >= 10 ? C.sage : e.share >= 5 ? C.accentDark : C.neutral,
                    }}
                  />
                </div>
                <div style={{ minWidth: "80px", textAlign: "right", fontFamily: FONT.mono, fontSize: "13px", color: C.textPrimary, fontWeight: 600 }}>
                  {e.share}%
                </div>
                <div style={{ minWidth: "80px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>
                  {e.lang}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CoverageCard({
  icon,
  value,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
  color: string;
}) {
  const bg = color === C.sage ? C.sageBg : color === C.accentDark ? "rgba(74,93,110,0.08)" : C.redBg;
  const border = color === C.sage ? "rgba(74,123,95,0.2)" : color === C.accentDark ? "rgba(74,93,110,0.2)" : "rgba(160,82,75,0.2)";
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "24px",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "6px",
          background: bg,
          border: `1px solid ${border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: "32px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1, letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary, marginTop: "8px" }}>{label}</div>
      <div style={{ fontSize: "12px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "4px" }}>{sub}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 10 — CTA
// ═══════════════════════════════════════════════════════════════════════

function CTA() {
  return (
    <section
      style={{
        background: C.surface,
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
          background: C.surfaceAlt,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(74,123,95,0.06), transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(139,157,175,0.06), transparent 70%)",
            borderRadius: "50%",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow color={C.sage}>Ready to start?</Eyebrow>
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
            See what the world says about you — for free.
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
            We will run our full pipeline on your brand for 7 days and send
            you a sample report. No commitment, no credit card.
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
              Get your free audit
              <IconArrow dir="right" size={16} color="#FFFFFF" />
            </a>
            <a
              href="/atelier/pricing"
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
              See pricing
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
        .overview-grid { grid-template-columns: 1fr !important; }
        .step-split { grid-template-columns: 1fr !important; gap: 40px !important; }
        .deliver-grid { grid-template-columns: 1fr !important; }
        .coverage-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 640px) {
        .coverage-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function MethodPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero />
        <OverviewSteps />
        <FlowDiagram />
        <StepMonitor />
        <StepAnalyze />
        <StepDeliver />
        <DataTimeline />
        <SampleOutput />
        <Coverage />
        <CTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

"use client";

import React, { useState } from "react";
import BrandBadge from "@/components/BrandBadge";
import { AtelierNav } from "./components/AtelierNav";
import { AtelierFooter } from "./components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
  ForgeSparks,
  TeslaTabs,
  PhaseDisclaimer,
} from "./components/shared";
import { C as TOKENS } from "./components/tokens";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — AI REPUTATION INTELLIGENCE
// Design System V2 · Inter + Space Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence for Moroccan & African companies.
// We monitor 30+ media sources, powered by HarchIQ, our trainable AI, track AI
// visibility (ChatGPT / Perplexity / Gemini), and deliver insights via
// WhatsApp + dashboard + monthly PDF.
//
// Design System V2 (HARCH_DESIGN_SYSTEM_V2.md):
//   • Backgrounds  → neutral-50 / white / neutral-900 / neutral-950
//   • Text         → neutral-950 / neutral-600 / neutral-500 / white / neutral-400
//   • Borders      → neutral-200 (light) / neutral-800 (dark)
//   • CTA primary  → bg-emerald-500 hover:bg-emerald-400 text-white (TOUJOURS)
//   • Atelier accent → stone-500 (#78716c) — labels/stats/icônes UNIQUEMENT
//   • Fonts        → Inter (body) + Space Mono (data) — JAMAIS JetBrains Mono
//   • Détail visuel signature → Forge sparks (ForgeSparks component)
//   • Interaction obligatoire → TeslaTabs (Discovery / Build / Vault)
//
// All colors come from `./components/tokens.ts` (source unique de vérité).
// Legacy key aliases (sage, surface, textPrimary, …) below route to DS V2
// tokens so existing JSX renders with stone-500 accent, neutral-500 muted,
// emerald-500 CTA, etc. — no hex literals redefined locally.
//
// Sections:
//   01  Hero + dashboard mockup (ForgeSparks bg + TeslaTabs-ready)
//   02  Logo wall (8 Moroccan companies)
//   03  What we do (4 features)
//   04  WhatsApp preview mockup
//   05  Dashboard preview mockup
//   06  HARCH 100 ranking table
//   07  How it works (3 steps + TeslaTabs Discovery/Build/Vault)
//   08  Pricing (3 tiers — CTA emerald-500)
//   09  Report preview (PDF mockup)
//   10  Final CTA (form — emerald-500 submit)
//   11  Footer (AtelierFooter component)
//
// ═══════════════════════════════════════════════════════════════════════

// ─── DESIGN TOKENS (DS V2 — source: ./components/tokens.ts) ────────────
// `C` is the imported DS V2 token object, extended with backward-compat
// aliases so the existing 400+ color references resolve to DS V2 values.
// NO hex literal is redefined here — every value comes from TOKENS.
const C = {
  ...TOKENS,
  // Legacy key aliases → DS V2 token values (DO NOT add new hex here)
  surface: TOKENS.bg,             // was #FFFFFF → bg-white
  surfaceAlt: TOKENS.bgHover,     // was #F4F4F5 → bg-neutral-100
  borderLight: TOKENS.border,     // was #F0F0F0 → border-neutral-200
  textPrimary: TOKENS.text,       // was #0A0A0A → text-neutral-950
  textSecondary: TOKENS.textBody, // was #525252 → text-neutral-600
  textFaint: TOKENS.textOnDarkBody, // was #A1A1AA → neutral-400
  accentDark: TOKENS.accentHover,  // was #4A5D6E → stone-600
  // sage → stone-500 (DS V2 §4 — Atelier accent is stone-500, not green)
  sage: TOKENS.accent,            // stone-500 (#78716c)
  sageBright: TOKENS.accentBright,// stone-400
  sageDark: TOKENS.accentHover,   // stone-600
  sageBg: "rgba(120,113,108,0.08)", // stone-500 @ 8% (replaces green tint)
  red: TOKENS.danger,             // red-500
  redBg: TOKENS.dangerBg,         // red-50
  neutral: TOKENS.textMuted,      // neutral-500
  neutralBg: "rgba(115,115,115,0.10)", // neutral-500 @ 10%
  // WhatsApp brand colors — NOT part of DS V2, kept for mockup fidelity
  // (the WhatsApp preview simulates the actual WhatsApp UI).
  whatsappGreen: "#25D366",
  whatsappTeal: "#075E54",
  whatsappBubble: "#DCF8C6",
  whatsappBg: "#E5DDD5",
  checkBlue: "#34B7F1",
};

// Font aliases — DS V2 mandates Inter (sans) + Space Mono (mono).
// JAMAIS de JetBrains Mono. Was: 'JetBrains Mono', 'SF Mono', monospace.
const FONT = {
  sans: C.fontSans, // Inter — DS V2
  mono: C.fontMono, // Space Mono — DS V2 (was JetBrains Mono)
};

// Shadow aliases — route to DS V2 shadow tokens (no custom rgba).
const SHADOW = {
  card: C.shadowSm,
  cardHover: C.shadowMd,
  hero: C.shadowMd,
  deep: C.shadowMd,
};

// ─── DATA ──────────────────────────────────────────────────────────────

const MOROCCAN_COMPANIES = [
  "OCP Group",
  "Attijariwafa Bank",
  "Maroc Telecom",
  "Inwi",
  "Royal Air Maroc",
  "Bank of Africa",
  "CIH Bank",
  "Managem",
];

const HARCH_100_DATA: {
  rank: number;
  name: string;
  score: number;
  trend: number;
  up: boolean;
  positive: number;
}[] = [
  { rank: 1, name: "OCP Group", score: 91, trend: 6.0, up: true, positive: 81 },
  { rank: 2, name: "Attijariwafa Bank", score: 84, trend: 2.0, up: true, positive: 76 },
  { rank: 3, name: "Maroc Telecom", score: 79, trend: 4.0, up: true, positive: 72 },
  { rank: 4, name: "Royal Air Maroc", score: 76, trend: -4.0, up: false, positive: 65 },
  { rank: 5, name: "Inwi", score: 74, trend: 6.0, up: true, positive: 78 },
  { rank: 6, name: "Bank of Africa", score: 72, trend: 3.0, up: true, positive: 68 },
  { rank: 7, name: "CIH Bank", score: 68, trend: -3.0, up: false, positive: 71 },
  { rank: 8, name: "Managem", score: 66, trend: 6.0, up: true, positive: 58 },
  { rank: 9, name: "LesieurCristal", score: 64, trend: 0.6, up: true, positive: 63 },
  { rank: 10, name: "Cosumar", score: 62, trend: 2.8, up: true, positive: 66 },
];

// 30-day sentiment series (positive + neutral + negative = 100 each day)
const SENTIMENT_30D = {
  positive: [62, 64, 63, 66, 65, 68, 67, 69, 71, 70, 68, 66, 67, 69, 71, 73, 72, 70, 68, 66, 65, 67, 69, 71, 73, 74, 72, 70, 68, 68],
  neutral: [25, 24, 23, 22, 24, 22, 23, 21, 20, 22, 23, 24, 22, 21, 20, 19, 20, 22, 24, 25, 24, 23, 21, 20, 19, 18, 20, 22, 23, 22],
  negative: [13, 12, 14, 12, 11, 10, 10, 10, 9, 8, 9, 10, 11, 10, 9, 8, 8, 8, 8, 9, 11, 10, 10, 9, 8, 8, 8, 8, 9, 10],
};

// Hero sparkline (30-day reputation trend)
const HERO_SPARK = [58, 60, 59, 62, 61, 63, 65, 64, 66, 68, 67, 65, 63, 64, 66, 68, 70, 69, 67, 65, 66, 68, 70, 72, 74, 73, 75, 77, 76, 78];

// Top topics for dashboard right panel
const TOPICS = [
  { name: "Frais bancaires", positive: 42, negative: 48, mentions: 89, risk: true },
  { name: "Service client", positive: 71, negative: 18, mentions: 67, risk: false },
  { name: "Application mobile", positive: 65, negative: 22, mentions: 54, risk: false },
  { name: "Taux de crédit", positive: 55, negative: 30, mentions: 41, risk: false },
  { name: "Réseau d'agences", positive: 73, negative: 15, mentions: 38, risk: false },
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

// Build an SVG line path from a data array
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

// Build an SVG area path (line + close to bottom)
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

// ─── SVG ICONS (inline, no libraries) ──────────────────────────────────

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
      <line x1="2" y1="2" x2="4" y2="4" />
      <line x1="20" y1="20" x2="22" y2="22" />
    </svg>
  );
}

function IconSentiment({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" stroke={C.sage} />
      <circle cx="10" cy="11" r="1" fill={color} />
      <circle cx="13" cy="14" r="1" fill={color} />
      <circle cx="18" cy="9" r="1" fill={C.red} />
    </svg>
  );
}

function IconBell({ size = 28, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <circle cx="18" cy="6" r="3" fill={C.red} stroke={C.red} />
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
  if (dir === "down") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
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

function IconMonitor({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function IconChart({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" />
    </svg>
  );
}

function IconUsers({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconReport({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function IconSearch({ size = 16, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconWhatsapp({ size = 20, color = C.textOnDark }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
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
        padding: "60px 20px",
        overflow: "hidden",
      }}
    >
      {/* DS V2 §6 — Forge sparks : détail visuel signature Atelier.
          28 particules stone-500, opacité 0.10-0.30, animation pulse subtile.
          pointer-events-none pour ne pas interférer avec les CTAs. */}
      <ForgeSparks
        color={C.accent}
        count={32}
        style={{ opacity: 0.6, zIndex: 0 }}
      />

      {/* Subtle background accents — stone-500 tints (DS V2 Atelier accent) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-200px",
          right: "-100px",
          width: "600px",
          height: "600px",
          background:
            "radial-gradient(circle, rgba(120,113,108,0.05), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
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
            "radial-gradient(circle, rgba(120,113,108,0.04), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="atelier-container"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div className="hero-grid">
          {/* ─── Left: copy + CTAs ─── */}
          <div>
            <Eyebrow color={C.accent}>
              AI Reputation Intelligence · Decision Augmentation
            </Eyebrow>
            <h1
              style={{
                fontSize: "clamp(40px, 5.5vw, 68px)",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.02,
                color: C.text,
                margin: "0 0 24px",
              }}
            >
              Promote. Protect.{" "}
              {/* DS V2 §5 + Benchmark Pattern 2 — H1 split-color.
                  Mot accent en stone-500 (C.accent). */}
              <span style={{ color: C.accent }}>Shape.</span>
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: C.textBody,
                lineHeight: 1.5,
                maxWidth: "560px",
                margin: "0 0 36px",
              }}
            >
              Cut through the noise and focus on what matters. Harch AI turns
              the world's media and AI engines into actionable reputation
              intelligence — so Comms leaders can make confident, reputation-based
              decisions and stay one step ahead.
            </p>

            {/* CTAs — DS V2 §3 : primary = bg-emerald-500, secondary = border-neutral-300 */}
            <div
              className="hero-cta-row"
              style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
            >
              <a
                href="/atelier/audit"
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "15px 28px",
                  background: C.cta, // emerald-500 — DS V2 primary CTA
                  color: C.textOnDark, // white
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderRadius: "3px",
                  border: `1px solid ${C.cta}`,
                  cursor: "pointer",
                  fontFamily: FONT.sans,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.ctaHover; // emerald-400
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.cta;
                }}
              >
                Request a demo
                <IconArrow dir="right" size={16} color={C.textOnDark} />
              </a>
              <a
                href="/atelier/dashboard"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "15px 28px",
                  background: "transparent",
                  color: C.text, // neutral-950 — DS V2 secondary CTA on light
                  fontSize: "15px",
                  fontWeight: 500,
                  textDecoration: "none",
                  borderRadius: "3px",
                  border: `1px solid ${C.borderStrong}`, // neutral-300
                  cursor: "pointer",
                  fontFamily: FONT.sans,
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.bgHover; // neutral-100
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                See live dashboard
              </a>
            </div>

            {/* Trust indicators — Signal AI style */}
            <div
              className="hero-trust"
              style={{
                marginTop: "48px",
                display: "flex",
                gap: "32px",
                flexWrap: "wrap",
              }}
            >
              <TrustStat value="5M+" label="Articles ingested/day" />
              <TrustStat value="100M+" label="Entities labeled/day" />
              <TrustStat value="120+" label="Languages translated" />
              <TrustStat value="32" label="Risk categories" />
            </div>
          </div>

          {/* ─── Right: dashboard mockup ─── */}
          <HeroDashboardMockup />
        </div>
      </div>
    </section>
  );
}

function TrustStat({ value, label }: { value: string; label: string }) {
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

function HeroDashboardMockup() {
  // Reputation score ring — 78/100
  const score = 78;
  const ringR = 42;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc - (score / 100) * ringCirc;

  return (
    <div
      className="hero-mockup"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.hero,
        overflow: "hidden",
        position: "relative",
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
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.border }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.border }} />
        <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: C.border }} />
        <span
          style={{
            marginLeft: "8px",
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.04em",
          }}
        >
          atelier.harchcorp.com / dashboard
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
            border: `1px solid rgba(74,123,95,0.2)`,
          }}
        >
          ● Live
        </span>
      </div>

      {/* Card body */}
      <div style={{ padding: "24px" }}>
        {/* Company header + score ring */}
        <div
          className="hero-mockup-top"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              Reputation Score
            </div>
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: C.textPrimary,
                marginBottom: "4px",
              }}
            >
              Bank of Africa
            </div>
            <div
              style={{
                fontSize: "12px",
                fontFamily: FONT.mono,
                color: C.sage,
              }}
            >
              ↑ +4.2 pts vs last month
            </div>
          </div>

          {/* Score ring SVG */}
          <div style={{ position: "relative", width: "96px", height: "96px", flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r={ringR}
                fill="none"
                stroke={C.border}
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r={ringR}
                fill="none"
                stroke={C.sage}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCirc}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 48 48)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  fontFamily: FONT.mono,
                  color: C.textPrimary,
                  lineHeight: 1,
                }}
              >
                78
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  marginTop: "2px",
                }}
              >
                / 100
              </span>
            </div>
          </div>
        </div>

        {/* Sentiment breakdown bars */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Sentiment breakdown — 30 days
          </div>
          {/* Stacked bar */}
          <div
            style={{
              display: "flex",
              height: "10px",
              borderRadius: "5px",
              overflow: "hidden",
              marginBottom: "12px",
              background: C.borderLight,
            }}
          >
            <div style={{ width: "68%", background: C.sage }} />
            <div style={{ width: "22%", background: C.neutral }} />
            <div style={{ width: "10%", background: C.red }} />
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <SentimentLegendItem color={C.sage} label="Positive" pct="68%" />
            <SentimentLegendItem color={C.neutral} label="Neutral" pct="22%" />
            <SentimentLegendItem color={C.red} label="Negative" pct="10%" />
          </div>
        </div>

        {/* KPI cards */}
        <div
          className="hero-kpi-row"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <KpiMini label="Articles" value="247" />
          <KpiMini label="Mentions" value="1.2K" />
          <KpiMini label="AI Citations" value="12" />
        </div>

        {/* Sparkline */}
        <div
          style={{
            padding: "16px",
            background: C.surfaceAlt,
            borderRadius: "6px",
            border: `1px solid ${C.borderLight}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              30-day trend
            </span>
            <span
              style={{
                fontSize: "12px",
                fontFamily: FONT.mono,
                color: C.sage,
                fontWeight: 600,
              }}
            >
              ↑ +20 pts
            </span>
          </div>
          <svg width="100%" height="48" viewBox="0 0 300 48" preserveAspectRatio="none">
            <defs>
              <linearGradient id="heroSparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.sage} stopOpacity="0.2" />
                <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={buildAreaPath(HERO_SPARK, 300, 48, 100)} fill="url(#heroSparkGrad)" />
            <path
              d={buildLinePath(HERO_SPARK, 300, 48, 100)}
              fill="none"
              stroke={C.sage}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function SentimentLegendItem({ color, label, pct }: { color: string; label: string; pct: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: color }} />
      <span style={{ fontSize: "12px", color: C.textSecondary }}>{label}</span>
      <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600 }}>
        {pct}
      </span>
    </div>
  );
}

function KpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "12px",
        background: C.surfaceAlt,
        borderRadius: "6px",
        border: `1px solid ${C.borderLight}`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: 700,
          fontFamily: FONT.mono,
          color: C.textPrimary,
          lineHeight: 1,
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
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — LOGO WALL
// ═══════════════════════════════════════════════════════════════════════

function LogoWall() {
  return (
    <section
      style={{
        background: C.surface,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: "36px",
          }}
        >
          Trusted by Moroccan &amp; African leaders
        </div>
        <div
          className="logo-wall-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "16px",
          }}
        >
          {MOROCCAN_COMPANIES.map((company) => (
            <div
              key={company}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 16px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                transition: "all 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.sage;
                e.currentTarget.style.background = C.surfaceAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.background = C.surface;
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: C.textSecondary,
                  fontFamily: FONT.sans,
                  letterSpacing: "-0.01em",
                  textAlign: "center",
                }}
              >
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — WHAT WE DO (4 features)
// ═══════════════════════════════════════════════════════════════════════

function WhatWeDo() {
  const features = [
    {
      icon: <IconRadar size={32} color={C.sage} />,
      title: "Media Monitoring",
      desc: "We track 30+ Moroccan & African media sources — Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui Le Maroc and more — 24/7.",
      stat: "30+",
      statLabel: "sources",
    },
    {
      icon: <IconAI size={32} color={C.sage} />,
      title: "AI Visibility",
      desc: "See what ChatGPT, Perplexity, Gemini, and Claude say about your brand. Track your rank on the prompts that matter to your customers.",
      stat: "8",
      statLabel: "AI engines",
    },
    {
      icon: <IconSentiment size={32} color={C.sage} />,
      title: "Sentiment Analysis",
      desc: "HarchIQ analyzes every mention in French, Arabic & English. Get positive / neutral / negative breakdowns per entity, topic, and source.",
      stat: "3",
      statLabel: "languages",
    },
    {
      icon: <IconBell size={32} color={C.sage} />,
      title: "Crisis Alerts",
      desc: "When negative sentiment spikes on a topic, you get a WhatsApp alert within 5 minutes — before it becomes a crisis.",
      stat: "< 5min",
      statLabel: "alert latency",
    },
  ];

  return (
    <section
      id="features"
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <Eyebrow>What we do</Eyebrow>
        <SectionTitle>
          Four pillars of reputation intelligence.
        </SectionTitle>
        <SectionSub>
          Most reputation tools were built for American brands on English media.
          We built Harch Atelier for the francophone and African reality — Arabic
          sources, French business press, and AI engines your customers actually use.
        </SectionSub>

        <div
          className="feature-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  stat,
  statLabel,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  stat: string;
  statLabel: string;
}) {
  return (
    <div
      className="feature-card"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "28px 24px",
        boxShadow: SHADOW.card,
        transition: "all 0.25s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.sage;
        e.currentTarget.style.boxShadow = SHADOW.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = SHADOW.card;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "6px",
          background: C.sageBg,
          border: `1px solid rgba(74,123,95,0.15)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: "18px",
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 12px",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: C.textSecondary,
          lineHeight: 1.55,
          margin: "0 0 24px",
          flex: 1,
        }}
      >
        {desc}
      </p>
      <div
        style={{
          paddingTop: "20px",
          borderTop: `1px solid ${C.borderLight}`,
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.sage,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {stat}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {statLabel}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — WHATSAPP PREVIEW
// ═══════════════════════════════════════════════════════════════════════

function WhatsAppPreview() {
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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div className="whatsapp-split">
          {/* Left: copy */}
          <div>
            <Eyebrow color={C.sage}>WhatsApp delivery</Eyebrow>
            <SectionTitle>
              Your morning briefing, on WhatsApp.
            </SectionTitle>
            <SectionSub>
              Every morning at 7:00, you receive a structured digest of what
              was said about your brand in the last 24 hours — media, social,
              and AI engines. No app to open. No dashboard to check. Just
              open WhatsApp.
            </SectionSub>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <WhatsAppFeature
                title="Daily digest at 7:00"
                desc="Media articles, social mentions, AI citations — all in one message."
              />
              <WhatsAppFeature
                title="Real-time crisis alerts"
                desc="When negative sentiment spikes on a topic, you get an alert within 5 minutes."
              />
              <WhatsAppFeature
                title="Reply to ask questions"
                desc="Text “Quel est mon score cette semaine?” and get an instant answer from our AI."
              />
              <WhatsAppFeature
                title="Share with your team"
                desc="Forward the digest to your comms team, CEO, or board in one tap."
              />
            </div>
          </div>

          {/* Right: WhatsApp mockup */}
          <WhatsAppMockup />
        </div>
      </div>
    </section>
  );
}

function WhatsAppFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: C.sageBg,
          border: `1px solid rgba(74,123,95,0.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <IconCheck size={14} color={C.sage} />
      </div>
      <div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: C.textPrimary,
            marginBottom: "3px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function WhatsAppMockup() {
  return (
    <div
      className="whatsapp-mockup-wrap"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.hero,
          overflow: "hidden",
        }}
      >
        {/* WhatsApp header */}
        <div
          style={{
            background: C.whatsappTeal,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: C.sage,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconWhatsapp size={20} color={C.textOnDark} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: C.textOnDark,
                lineHeight: 1.2,
              }}
            >
              Harch Intelligence
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.7)",
                marginTop: "2px",
              }}
            >
              online
            </div>
          </div>
          {/* Header icons */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textOnDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textOnDark} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" style={{ marginLeft: "12px" }}>
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </div>

        {/* Chat area */}
        <div
          style={{
            background: C.whatsappBg,
            padding: "20px 16px",
            minHeight: "420px",
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%)",
          }}
        >
          {/* Date pill */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: C.textOnDark,
                background: "rgba(255,255,255,0.2)",
                padding: "4px 12px",
                borderRadius: "10px",
                fontFamily: FONT.mono,
              }}
            >
              Today
            </span>
          </div>

          {/* Bot message — green WhatsApp bubble */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: C.whatsappBubble,
                borderRadius: "8px 8px 8px 0",
                padding: "10px 14px",
                maxWidth: "88%",
                position: "relative",
                boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: C.text,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                  fontFamily: FONT.sans,
                }}
              >
                <strong>📊 Bank of Africa — Veille du 18/07</strong>
                {"\n\n"}
                <strong>Médias:</strong> 12 articles (8 positifs, 3 neutres, 1 négatif){"\n"}
                <strong>Social:</strong> 340 mentions (78% positif){"\n"}
                <strong>IA:</strong> ChatGPT vous cite #2 sur &lsquo;meilleure banque Maroc&rsquo;
                {"\n\n"}
                <span style={{ color: C.red, fontWeight: 600 }}>
                  ⚠️ Alerte: Sujet &lsquo;frais bancaires&rsquo; en hausse (+47% en 24h)
                </span>
              </div>
              {/* Timestamp + checks */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                  marginTop: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    color: C.textMuted,
                    fontFamily: FONT.mono,
                  }}
                >
                  07:00
                </span>
                {/* Double check marks */}
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                  <path d="M1 4.5L3.5 7L8 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 4.5L7.5 7L12 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Second smaller message */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: C.whatsappBubble,
                borderRadius: "8px 8px 8px 0",
                padding: "8px 12px",
                maxWidth: "70%",
                boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: C.text,
                  lineHeight: 1.4,
                }}
              >
                Répondez &laquo; détails &raquo; pour le rapport complet.
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                  marginTop: "2px",
                }}
              >
                <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono }}>
                  07:00
                </span>
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                  <path d="M1 4.5L3.5 7L8 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 4.5L7.5 7L12 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* User reply (outgoing) */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                background: "#E1FFC7",
                borderRadius: "8px 8px 0 8px",
                padding: "8px 12px",
                maxWidth: "60%",
                boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.4 }}>
                détails
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                  marginTop: "2px",
                }}
              >
                <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono }}>
                  07:02
                </span>
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                  <path d="M1 4.5L3.5 7L8 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 4.5L7.5 7L12 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* Bot reply with link */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
            }}
          >
            <div
              style={{
                background: C.whatsappBubble,
                borderRadius: "8px 8px 8px 0",
                padding: "10px 14px",
                maxWidth: "80%",
                boxShadow: "0 1px 1px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.5 }}>
                📄 Rapport complet — Juillet 2026
                {"\n"}
                <span style={{ color: C.whatsappTeal, textDecoration: "underline" }}>
                  atelier.harchcorp.com/r/boa-07-2026
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                  marginTop: "4px",
                }}
              >
                <span style={{ fontSize: "10px", color: C.textMuted, fontFamily: FONT.mono }}>
                  07:02
                </span>
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                  <path d="M1 4.5L3.5 7L8 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 4.5L7.5 7L12 2" stroke={C.checkBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div
          style={{
            background: C.surface,
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <div
            style={{
              flex: 1,
              height: "36px",
              background: C.surfaceAlt,
              borderRadius: "18px",
              border: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
            }}
          >
            <span style={{ fontSize: "13px", color: C.textFaint }}>Type a message</span>
          </div>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: C.whatsappTeal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={C.textOnDark}>
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 05 — DASHBOARD PREVIEW
// ═══════════════════════════════════════════════════════════════════════

function DashboardPreview() {
  return (
    <section
      id="dashboard"
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <Eyebrow>The dashboard</Eyebrow>
        <SectionTitle>
          One dashboard. Every signal that matters.
        </SectionTitle>
        <SectionSub>
          Media monitoring, sentiment trends, competitor benchmarking, AI
          visibility, and crisis alerts — all in one place. Built for comms
          directors and CEOs who need the full picture in 60 seconds.
        </SectionSub>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const navItems = [
    { icon: <IconMonitor size={16} color={C.sage} />, label: "Monitoring", active: true },
    { icon: <IconChart size={16} color={C.textMuted} />, label: "Sentiment", active: false },
    { icon: <IconUsers size={16} color={C.textMuted} />, label: "Competitors", active: false },
    { icon: <IconBell size={16} color={C.textMuted} />, label: "Alerts", active: false, badge: "3" },
    { icon: <IconReport size={16} color={C.textMuted} />, label: "Reports", active: false },
  ];

  return (
    <div
      className="dashboard-mockup"
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        boxShadow: SHADOW.deep,
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "12px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.surface,
        }}
      >
        <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
        <div
          style={{
            flex: 1,
            maxWidth: "320px",
            height: "32px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "0 12px",
          }}
        >
          <IconSearch size={14} color={C.textMuted} />
          <span style={{ fontSize: "12px", color: C.textFaint, fontFamily: FONT.sans }}>
            Search mentions, topics, competitors…
          </span>
        </div>
        <div style={{ flex: 1 }} />
        {/* Notification bell */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: C.red,
              color: C.textOnDark,
              fontSize: "9px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT.mono,
            }}
          >
            3
          </span>
        </div>
        {/* User avatar */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: C.accentDark,
            color: C.textOnDark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            fontFamily: FONT.sans,
          }}
        >
          AB
        </div>
      </div>

      {/* 3-column layout */}
      <div
        className="dash-layout"
        style={{
          display: "grid",
          minHeight: "560px",
        }}
      >
        {/* ─── Sidebar ─── */}
        <div
          className="dash-sidebar"
          style={{
            background: C.surfaceAlt,
            borderRight: `1px solid ${C.border}`,
            padding: "20px 0",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "0 20px",
              marginBottom: "12px",
            }}
          >
            Navigation
          </div>
          {navItems.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 20px",
                fontSize: "13px",
                fontWeight: item.active ? 600 : 500,
                color: item.active ? C.sage : C.textSecondary,
                background: item.active ? C.sageBg : "transparent",
                borderLeft: item.active ? `2px solid ${C.sage}` : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "rgba(0,0,0,0.03)";
                  e.currentTarget.style.color = C.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!item.active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = C.textSecondary;
                }
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "10px",
                    fontWeight: 700,
                    fontFamily: FONT.mono,
                    color: C.textOnDark,
                    background: C.red,
                    padding: "2px 6px",
                    borderRadius: "8px",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          {/* Sidebar footer */}
          <div
            style={{
              marginTop: "32px",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                padding: "14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "6px",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "6px",
                }}
              >
                Plan
              </div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary }}>
                Pro
              </div>
              <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "4px" }}>
                28 days remaining
              </div>
              <a
                href="/atelier/pricing"
                style={{
                  display: "block",
                  marginTop: "10px",
                  fontSize: "12px",
                  color: C.sage,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Upgrade →
              </a>
            </div>
          </div>
        </div>

        {/* ─── Main area ─── */}
        <div
          className="dash-main"
          style={{
            padding: "24px",
            background: C.surface,
          }}
        >
          {/* Page title + filters */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: FONT.mono,
                  color: C.textMuted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "4px",
                }}
              >
                Bank of Africa
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: C.textPrimary,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Sentiment Analysis
              </h3>
            </div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["7 days", "30 days", "90 days"].map((range, i) => (
                <span
                  key={range}
                  style={{
                    fontSize: "12px",
                    fontFamily: FONT.mono,
                    padding: "6px 12px",
                    borderRadius: "3px",
                    border: `1px solid ${i === 1 ? C.sage : C.border}`,
                    background: i === 1 ? C.sageBg : C.surface,
                    color: i === 1 ? C.sage : C.textSecondary,
                    cursor: "pointer",
                    fontWeight: i === 1 ? 600 : 500,
                  }}
                >
                  {range}
                </span>
              ))}
            </div>
          </div>

          {/* Chart card */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              padding: "20px",
              boxShadow: SHADOW.card,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: C.textPrimary,
                }}
              >
                Sentiment over time
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px" }}>
                <ChartLegend color={C.sage} label="Positive" />
                <ChartLegend color={C.neutral} label="Neutral" />
                <ChartLegend color={C.red} label="Negative" />
              </div>
            </div>

            {/* The SVG chart */}
            <SentimentLineChart />

            {/* X-axis labels */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "8px",
                padding: "0 4px",
              }}
            >
              {["Jul 1", "Jul 8", "Jul 15", "Jul 22", "Jul 29"].map((d) => (
                <span
                  key={d}
                  style={{
                    fontSize: "10px",
                    fontFamily: FONT.mono,
                    color: C.textMuted,
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom row: 3 mini stats */}
          <div
            className="dash-mini-stats"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <DashMiniStat
              label="Avg sentiment"
              value="68%"
              change="+4.2"
              positive
            />
            <DashMiniStat
              label="Mentions / day"
              value="47"
              change="+12"
              positive
            />
            <DashMiniStat
              label="AI citations"
              value="12"
              change="+3"
              positive
            />
          </div>
        </div>

        {/* ─── Right panel ─── */}
        <div
          className="dash-right"
          style={{
            background: C.surfaceAlt,
            borderLeft: `1px solid ${C.border}`,
            padding: "24px 20px",
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
            }}
          >
            Top 5 Topics
          </div>

          {TOPICS.map((topic, i) => (
            <TopicRow key={i} topic={topic} />
          ))}

          {/* AI visibility mini card */}
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              AI Visibility
            </div>
            <div style={{ fontSize: "13px", color: C.textSecondary, marginBottom: "12px" }}>
              <strong style={{ color: C.textPrimary }}>&laquo; meilleure banque Maroc &raquo;</strong>
            </div>
            {[
              { engine: "ChatGPT", rank: "#2", change: "↑ 1" },
              { engine: "Perplexity", rank: "#3", change: "—" },
              { engine: "Gemini", rank: "#4", change: "↓ 1" },
            ].map((ai) => (
              <div
                key={ai.engine}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: `1px solid ${C.borderLight}`,
                  fontSize: "12px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <span style={{ color: C.textSecondary, fontFamily: FONT.sans }}>
                  {ai.engine}
                </span>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span
                    style={{
                      fontFamily: FONT.mono,
                      fontWeight: 700,
                      color: C.textPrimary,
                    }}
                  >
                    {ai.rank}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: FONT.mono,
                      color: ai.change.startsWith("↑")
                        ? C.sage
                        : ai.change.startsWith("↓")
                        ? C.red
                        : C.textMuted,
                    }}
                  >
                    {ai.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartLegend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "2px",
          background: color,
        }}
      />
      <span style={{ fontSize: "11px", color: C.textSecondary, fontFamily: FONT.sans }}>
        {label}
      </span>
    </div>
  );
}

function SentimentLineChart() {
  const w = 600;
  const h = 220;
  const padding = { top: 10, right: 10, bottom: 10, left: 30 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  return (
    <svg
      width="100%"
      height="220"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.sage} stopOpacity="0.15" />
          <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((y) => {
        const yPos = padding.top + chartH - (y / 100) * chartH;
        return (
          <g key={y}>
            <line
              x1={padding.left}
              y1={yPos}
              x2={w - padding.right}
              y2={yPos}
              stroke={C.borderLight}
              strokeWidth="1"
              strokeDasharray={y === 0 ? "0" : "2,3"}
            />
            <text
              x={padding.left - 8}
              y={yPos + 3}
              fontSize="9"
              fontFamily={FONT.mono}
              fill={C.textMuted}
              textAnchor="end"
            >
              {y}
            </text>
          </g>
        );
      })}

      {/* Positive area */}
      <path
        d={buildAreaPath(SENTIMENT_30D.positive, chartW, chartH, 100)}
        fill="url(#posGrad)"
        transform={`translate(${padding.left}, ${padding.top})`}
      />

      {/* Lines */}
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Positive line */}
        <path
          d={buildLinePath(SENTIMENT_30D.positive, chartW, chartH, 100)}
          fill="none"
          stroke={C.sage}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Neutral line */}
        <path
          d={buildLinePath(SENTIMENT_30D.neutral, chartW, chartH, 100)}
          fill="none"
          stroke={C.neutral}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
          opacity="0.7"
        />
        {/* Negative line */}
        <path
          d={buildLinePath(SENTIMENT_30D.negative, chartW, chartH, 100)}
          fill="none"
          stroke={C.red}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.8"
        />

        {/* End dots */}
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.positive[SENTIMENT_30D.positive.length - 1] / 100) * chartH}
          r="3"
          fill={C.sage}
        />
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.neutral[SENTIMENT_30D.neutral.length - 1] / 100) * chartH}
          r="2.5"
          fill={C.neutral}
        />
        <circle
          cx={chartW}
          cy={chartH - (SENTIMENT_30D.negative[SENTIMENT_30D.negative.length - 1] / 100) * chartH}
          r="2.5"
          fill={C.red}
        />
      </g>
    </svg>
  );
}

function DashMiniStat({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        boxShadow: SHADOW.card,
      }}
    >
      <div
        style={{
          fontSize: "10px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: positive ? C.sage : C.red,
            fontWeight: 600,
          }}
        >
          {positive ? "↑" : "↓"} {change}
        </span>
      </div>
    </div>
  );
}

function TopicRow({
  topic,
}: {
  topic: { name: string; positive: number; negative: number; mentions: number; risk: boolean };
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
        paddingBottom: "16px",
        borderBottom: `1px solid ${C.borderLight}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {topic.risk && (
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: C.red,
                display: "inline-block",
              }}
            />
          )}
          <span
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: C.textPrimary,
            }}
          >
            {topic.name}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          {topic.mentions} mentions
        </span>
      </div>
      {/* Sentiment bar */}
      <div
        style={{
          display: "flex",
          height: "6px",
          borderRadius: "3px",
          overflow: "hidden",
          background: C.borderLight,
        }}
      >
        <div style={{ width: `${topic.positive}%`, background: C.sage }} />
        <div
          style={{
            width: `${100 - topic.positive - topic.negative}%`,
            background: C.neutral,
          }}
        />
        <div style={{ width: `${topic.negative}%`, background: C.red }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "4px",
          fontSize: "10px",
          fontFamily: FONT.mono,
        }}
      >
        <span style={{ color: C.sage }}>{topic.positive}% pos</span>
        <span style={{ color: C.red }}>{topic.negative}% neg</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 06 — HARCH 100 RANKING
// ═══════════════════════════════════════════════════════════════════════

function Harch100() {
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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <Eyebrow color={C.sage}>The HARCH 100</Eyebrow>
        <SectionTitle>
          Morocco&rsquo;s most reputable companies.
        </SectionTitle>
        <SectionSub>
          Updated monthly. The HARCH 100 ranks Moroccan companies by reputation
          score — a composite of media sentiment, social mention volume, AI
          visibility, and share of voice. Here are the top 10 for July 2026.
        </SectionSub>

        {/* Table card */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              padding: "14px 24px",
              background: C.surfaceAlt,
              borderBottom: `1px solid ${C.border}`,
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              alignItems: "center",
              gap: "16px",
            }}
            className="harch-table-head"
          >
            <span>Rank</span>
            <span>Company</span>
            <span>Score</span>
            <span>30d Trend</span>
            <span>Sentiment</span>
          </div>

          {/* Table rows */}
          {HARCH_100_DATA.map((row) => (
            <Harch100Row key={row.rank} row={row} />
          ))}
        </div>

        {/* Footer note */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontFamily: FONT.mono,
              color: C.textMuted,
            }}
          >
            Updated 01/07/2026 · Methodology: weighted sentiment (40%) + volume
            (25%) + AI visibility (20%) + share of voice (15%)
          </div>
          <a
            href="/atelier/harch-100"
            style={{
              fontSize: "13px",
              color: C.sage,
              textDecoration: "none",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            View full HARCH 100
            <IconArrow dir="right" size={14} color={C.sage} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Harch100Row({
  row,
}: {
  row: {
    rank: number;
    name: string;
    score: number;
    trend: number;
    up: boolean;
    positive: number;
  };
}) {
  const isTop3 = row.rank <= 3;
  return (
    <div
      className="harch-table-row"
      style={{
        display: "grid",
        padding: "18px 24px",
        borderBottom: `1px solid ${C.borderLight}`,
        alignItems: "center",
        gap: "16px",
        transition: "background 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.surfaceAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Rank */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: isTop3 ? "32px" : "28px",
            height: isTop3 ? "32px" : "28px",
            borderRadius: "4px",
            background: isTop3 ? C.sageBg : C.surfaceAlt,
            border: isTop3 ? `1px solid rgba(74,123,95,0.3)` : `1px solid ${C.border}`,
            fontSize: isTop3 ? "14px" : "12px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: isTop3 ? C.sage : C.textSecondary,
          }}
        >
          {String(row.rank).padStart(2, "0")}
        </span>
      </div>

      {/* Company */}
      <div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: C.textPrimary,
            letterSpacing: "-0.01em",
          }}
        >
          {row.name}
        </div>
        <div
          style={{
            fontSize: "11px",
            color: C.textMuted,
            fontFamily: FONT.mono,
            marginTop: "2px",
          }}
        >
          Casablanca · MA
        </div>
      </div>

      {/* Score */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {row.score}
        </span>
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          /100
        </span>
      </div>

      {/* Trend */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 10px",
          borderRadius: "3px",
          background: row.up ? C.sageBg : C.redBg,
          border: `1px solid ${row.up ? "rgba(74,123,95,0.2)" : "rgba(160,82,75,0.2)"}`,
          width: "fit-content",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontFamily: FONT.mono,
            fontWeight: 600,
            color: row.up ? C.sage : C.red,
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
          }}
        >
          {row.up ? "↑" : "↓"} {row.trend}%
        </span>
      </div>

      {/* Sentiment bar */}
      <div>
        <div
          style={{
            display: "flex",
            height: "6px",
            borderRadius: "3px",
            overflow: "hidden",
            background: C.borderLight,
            marginBottom: "4px",
          }}
        >
          <div style={{ width: `${row.positive}%`, background: C.sage }} />
          <div
            style={{
              width: `${100 - row.positive - (100 - row.positive - 12)}%`,
              background: C.neutral,
            }}
          />
          <div style={{ width: "12%", background: C.red }} />
        </div>
        <div
          style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: C.textMuted,
          }}
        >
          {row.positive}% positive
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 07 — HOW IT WORKS (3 steps)
// ═══════════════════════════════════════════════════════════════════════

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "We monitor",
      desc: "30+ Moroccan & African media sources, social platforms, and 8 AI engines — scanned 24/7 in French, Arabic & English.",
      detail: "Sources: Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui Le Maroc, Le360, Yabiladi, Bladi, MâadBarid…",
      icon: <IconRadar size={36} color={C.sage} />,
    },
    {
      num: "02",
      title: "AI analyzes",
      desc: "HarchIQ processes every mention — sentiment classification, topic extraction, trend detection, and crisis scoring. All in real-time.",
      detail: "Engine: HarchIQ · Languages: FR / AR / EN · Latency: < 30 sec per article",
      icon: <IconAI size={36} color={C.sage} />,
    },
    {
      num: "03",
      title: "You receive",
      desc: "Daily WhatsApp digest at 7:00. Live dashboard with full drill-down. Monthly PDF report. Real-time alerts when sentiment shifts.",
      detail: "Channels: WhatsApp · Web dashboard · Email PDF · API (Enterprise)",
      icon: <IconBell size={36} color={C.sage} />,
    },
  ];

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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <Eyebrow>How it works</Eyebrow>
        <SectionTitle>
          Three steps. Zero noise.
        </SectionTitle>
        <SectionSub>
          From a media mention to your WhatsApp in under 5 minutes. Here&rsquo;s
          the pipeline that powers Harch Atelier.
        </SectionSub>

        <div
          className="how-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "24px",
            position: "relative",
          }}
        >
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <HowStepCard step={step} />
              {i < steps.length - 1 && (
                <div
                  className="how-arrow"
                  style={{
                    position: "absolute",
                    top: "60px",
                    left: `${((i + 1) * 100) / 3}%`,
                    transform: "translateX(-50%)",
                    zIndex: 2,
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: SHADOW.card,
                  }}
                >
                  <IconArrow dir="right" size={18} color={C.sage} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Timeline strip */}
        <div
          style={{
            marginTop: "56px",
            padding: "24px 28px",
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Total latency
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 700,
                fontFamily: FONT.mono,
                color: C.sage,
                letterSpacing: "-0.02em",
              }}
            >
              &lt; 5 min
            </span>
            <span
              style={{
                fontSize: "13px",
                color: C.textSecondary,
              }}
            >
              from mention to WhatsApp
            </span>
          </div>
          <div
            style={{
              height: "32px",
              width: "1px",
              background: C.border,
            }}
          />
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <TimelineDot label="Scan" time="~30s" />
            <TimelineDot label="Analyze" time="~60s" />
            <TimelineDot label="Score" time="~10s" />
            <TimelineDot label="Deliver" time="~120s" />
          </div>
        </div>

        {/* DS V2 §7 — Interaction Tesla-style obligatoire.
            3 tabs Discovery / Build / Vault — clic change le mockup au-dessus. */}
        <HowItWorksInteractive />
      </div>
    </section>
  );
}

function HowStepCard({
  step,
}: {
  step: {
    num: string;
    title: string;
    desc: string;
    detail: string;
    icon: React.ReactNode;
  };
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "6px",
        padding: "32px 28px",
        boxShadow: SHADOW.card,
        position: "relative",
        transition: "all 0.25s",
        height: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = C.sage;
        e.currentTarget.style.boxShadow = SHADOW.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow = SHADOW.card;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Step number */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          right: "28px",
          fontSize: "48px",
          fontWeight: 700,
          fontFamily: FONT.mono,
          color: C.border,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {step.num}
      </div>

      {/* Icon */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "8px",
          background: C.sageBg,
          border: `1px solid rgba(74,123,95,0.15)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}
      >
        {step.icon}
      </div>

      <h3
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: C.textPrimary,
          margin: "0 0 12px",
          letterSpacing: "-0.02em",
        }}
      >
        {step.title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: C.textSecondary,
          lineHeight: 1.6,
          margin: "0 0 20px",
        }}
      >
        {step.desc}
      </p>
      <div
        style={{
          paddingTop: "16px",
          borderTop: `1px solid ${C.borderLight}`,
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          lineHeight: 1.6,
        }}
      >
        {step.detail}
      </div>
    </div>
  );
}

function TimelineDot({ label, time }: { label: string; time: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: C.accent, // stone-500 (was C.sage)
        }}
      />
      <span style={{ fontSize: "12px", color: C.textBody, fontFamily: FONT.sans }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
        }}
      >
        {time}
      </span>
    </div>
  );
}

// ─── HOW IT WORKS — Interactive TeslaTabs (DS V2 §7) ────────────────
// 3 tabs Discovery / Build / Vault — clic change le mockup au-dessus.
// Recommandation benchmark Pattern 3 (Real Product Preview) adaptée en
// mockup interactif (le vrai screenshot WhatsApp est en Section 04).
function HowItWorksInteractive() {
  return (
    <div style={{ marginTop: "80px" }}>
      <Eyebrow color={C.accent}>See it in action</Eyebrow>
      <SectionTitle maxW="720px">Three phases. One pipeline.</SectionTitle>
      <SectionSub>
        Click a tab to see what happens at each phase — from raw media
        scrape to your WhatsApp inbox.
      </SectionSub>
      <TeslaTabs
        ariaLabel="Harch Atelier pipeline phases"
        tabs={[
          { label: "Discovery", content: <DiscoveryView /> },
          { label: "Build", content: <BuildView /> },
          { label: "Vault", content: <VaultView /> },
        ]}
      />
    </div>
  );
}

function DiscoveryView() {
  const mediaSources = [
    "Le Matin",
    "L'Économiste",
    "Hespress",
    "TelQuel",
    "Médias24",
    "Aujourd'hui Le Maroc",
    "Le360",
    "Yabiladi",
    "Bladi",
    "MâadBarid",
  ];
  const aiEngines = [
    "ChatGPT",
    "Perplexity",
    "Google AI Overviews",
    "Gemini",
    "Claude",
    "Copilot",
    "Mistral",
    "Grok",
  ];
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.accent,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Phase 01 · Discovery
      </div>
      <h3
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: C.text,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        We scrape 30+ Moroccan and African media + 8 AI engines.
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "32px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            Moroccan &amp; African media · 30+
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {mediaSources.map((s) => (
              <span
                key={s}
                style={{
                  padding: "6px 10px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: FONT.mono,
                  color: C.textBody,
                  background: C.bgSubtle,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            AI engines · 8
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {aiEngines.map((s) => (
              <span
                key={s}
                style={{
                  padding: "6px 10px",
                  border: `1px solid ${C.border}`,
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontFamily: FONT.mono,
                  color: C.textBody,
                  background: C.bgSubtle,
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          gap: "32px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              fontFamily: FONT.mono,
              color: C.accent,
            }}
          >
            5M+
          </div>
          <div
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            articles ingested/day
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              fontFamily: FONT.mono,
              color: C.accent,
            }}
          >
            120+
          </div>
          <div
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            languages translated
          </div>
        </div>
        <div>
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              fontFamily: FONT.mono,
              color: C.accent,
            }}
          >
            24/7
          </div>
          <div
            style={{
              fontSize: "12px",
              color: C.textMuted,
              fontFamily: FONT.mono,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            scanning frequency
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildView() {
  const pipeline = [
    { step: "Ingest", desc: "Raw article + metadata captured", time: "~5s" },
    { step: "NLP", desc: "Language detection + entity extraction", time: "~10s" },
    { step: "Score", desc: "Sentiment + risk + topic classification", time: "~8s" },
    { step: "Alert", desc: "Threshold check → WhatsApp if crisis", time: "~2s" },
  ];
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.accent,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Phase 02 · Build
      </div>
      <h3
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: C.text,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        HarchIQ analyzes sentiment, risk, AI visibility per entity.
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pipeline.map((p, i) => (
          <div
            key={p.step}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "14px 18px",
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              background: C.bgSubtle,
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                minWidth: "32px",
              }}
            >
              0{i + 1}
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: C.text,
                minWidth: "80px",
              }}
            >
              {p.step}
            </div>
            <div style={{ fontSize: "13px", color: C.textBody, flex: 1 }}>
              {p.desc}
            </div>
            <div
              style={{
                fontSize: "12px",
                fontFamily: FONT.mono,
                color: C.accent,
                padding: "4px 10px",
                border: `1px solid ${C.border}`,
                borderRadius: "4px",
                background: C.bg,
              }}
            >
              {p.time}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: "20px",
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          textAlign: "center",
        }}
      >
        Engine: HarchIQ · Languages: FR / AR / EN · Latency: &lt; 30 sec per
        article
      </div>
    </div>
  );
}

function VaultView() {
  const channels = [
    {
      name: "WhatsApp Daily Digest",
      desc: "7:00 every morning — your reputation in 60-second read",
      icon: "✆",
      detail: "Real-time crisis alerts when sentiment shifts",
    },
    {
      name: "Web Dashboard",
      desc: "Full drill-down — articles, entities, trends, competitors",
      icon: "▦",
      detail: "Drag-and-drop visualization builder (Pro+)",
    },
    {
      name: "Monthly PDF Report",
      desc: "Board-ready, 12 pages, branded with your logo",
      icon: "▤",
      detail: "Executive summary + risk matrix + recommendations",
    },
  ];
  return (
    <div>
      <div
        style={{
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.accent,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Phase 03 · Vault
      </div>
      <h3
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: C.text,
          margin: "0 0 24px",
          letterSpacing: "-0.02em",
        }}
      >
        You get WhatsApp Daily Digest + dashboard + monthly PDF.
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {channels.map((c) => (
          <div
            key={c.name}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              padding: "16px 18px",
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              background: C.bgSubtle,
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "6px",
                background: "rgba(120,113,108,0.10)",
                border: `1px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                color: C.accent,
                fontFamily: FONT.mono,
                flexShrink: 0,
              }}
            >
              {c.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: "4px",
                }}
              >
                {c.name}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: C.textBody,
                  lineHeight: 1.5,
                  marginBottom: "6px",
                }}
              >
                {c.desc}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: C.textMuted,
                  fontFamily: FONT.mono,
                }}
              >
                {c.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 08 — PRICING (3 tiers)
// ═══════════════════════════════════════════════════════════════════════

function Pricing() {
  const tiers = [
    {
      name: "Starter",
      price: "5K",
      period: "MAD / mois",
      tagline: "For solo comms directors who need the essentials.",
      features: [
        "Daily WhatsApp digest (7:00)",
        "20 media sources",
        "1 competitor tracked",
        "Sentiment breakdown (pos/neu/neg)",
        "Monthly PDF report",
        "Email support",
      ],
      cta: "Start free trial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "15K",
      period: "MAD / mois",
      tagline: "For comms teams who need the full picture, daily.",
      features: [
        "Everything in Starter, plus:",
        "Full web dashboard",
        "50 media sources",
        "3 competitors tracked",
        "Real-time crisis alerts (WhatsApp)",
        "AI visibility (ChatGPT, Perplexity, Gemini)",
        "HarchIQ sentiment + topic analysis",
        "Monthly PDF + executive summary",
        "Priority WhatsApp support",
      ],
      cta: "Start free trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "50K",
      period: "MAD / mois",
      tagline: "For groups & institutions with analyst needs.",
      features: [
        "Everything in Pro, plus:",
        "200 media sources (incl. Africa)",
        "5 competitors tracked",
        "Dedicated reputation analyst",
        "API access (REST + webhook)",
        "Custom AI engine tracking",
        "Quarterly strategic review",
        "SLA 99.9% + 24/7 support",
        "On-site training (Casablanca / Rabat)",
      ],
      cta: "Talk to us",
      highlighted: false,
    },
  ];

  return (
    <section
      id="pricing"
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <Eyebrow color={C.sage}>Pricing</Eyebrow>
        <SectionTitle>
          Pricing that scales with your reputation.
        </SectionTitle>
        <SectionSub>
          All plans include a 14-day free trial. No credit card required. Prices
          in MAD (Moroccan Dirham). Cancel anytime.
        </SectionSub>

        <div
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
        >
          {tiers.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        {/* Below pricing: comparison strip */}
        <div
          style={{
            marginTop: "40px",
            padding: "20px 24px",
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "6px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            boxShadow: SHADOW.card,
          }}
        >
          <PricingNote icon="✓" text="14-day free trial" />
          <PricingNote icon="✓" text="No credit card required" />
          <PricingNote icon="✓" text="Cancel anytime" />
          <PricingNote icon="✓" text="MAD & EUR invoicing" />
          <PricingNote icon="✓" text="Data hosted in EU" />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  tier,
}: {
  tier: {
    name: string;
    price: string;
    period: string;
    tagline: string;
    features: string[];
    cta: string;
    highlighted: boolean;
  };
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: tier.highlighted
          ? `2px solid ${C.sage}`
          : `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "32px 28px",
        boxShadow: tier.highlighted ? SHADOW.cardHover : SHADOW.card,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.25s",
      }}
      onMouseEnter={(e) => {
        if (!tier.highlighted) {
          e.currentTarget.style.borderColor = C.accentDark;
          e.currentTarget.style.transform = "translateY(-2px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!tier.highlighted) {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {tier.highlighted && (
        <div
          style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            background: C.cta, // emerald-500 — DS V2 CTA primary
            color: C.textOnDark, // white
            fontSize: "11px",
            fontWeight: 600,
            fontFamily: FONT.mono,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "5px 14px",
            borderRadius: "3px",
            whiteSpace: "nowrap",
          }}
        >
          Most Popular
        </div>
      )}

      {/* Tier name */}
      <div
        style={{
          fontSize: "13px",
          fontFamily: FONT.mono,
          color: tier.highlighted ? C.cta : C.textMuted, // emerald for highlighted tier label
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "12px",
          fontWeight: 600,
        }}
      >
        {tier.name}
      </div>

      {/* Price */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "44px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.textPrimary,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          {tier.price}
        </span>
        <span
          style={{
            fontSize: "13px",
            color: C.textMuted,
            fontFamily: FONT.mono,
          }}
        >
          {tier.period}
        </span>
      </div>

      {/* Tagline */}
      <p
        style={{
          fontSize: "13px",
          color: C.textSecondary,
          lineHeight: 1.5,
          margin: "0 0 24px",
          minHeight: "40px",
        }}
      >
        {tier.tagline}
      </p>

      {/* CTA — DS V2 §3 : highlighted tier = bg-emerald-500, others = secondary */}
      <a
        href="/atelier/audit"
        style={{
          display: "block",
          textAlign: "center",
          padding: "12px 20px",
          background: tier.highlighted ? C.cta : "transparent", // emerald-500 for highlighted
          color: tier.highlighted ? C.textOnDark : C.text, // white / neutral-950
          fontSize: "14px",
          fontWeight: 600,
          textDecoration: "none",
          borderRadius: "3px",
          border: tier.highlighted
            ? `1px solid ${C.cta}`
            : `1px solid ${C.borderStrong}`, // neutral-300 for secondary
          cursor: "pointer",
          fontFamily: FONT.sans,
          transition: "background-color 0.2s",
          marginBottom: "28px",
        }}
        onMouseEnter={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = C.ctaHover; // emerald-400
          } else {
            e.currentTarget.style.background = C.bgHover; // neutral-100
          }
        }}
        onMouseLeave={(e) => {
          if (tier.highlighted) {
            e.currentTarget.style.background = C.cta;
          } else {
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {tier.cta}
      </a>

      {/* Features */}
      <div
        style={{
          paddingTop: "24px",
          borderTop: `1px solid ${C.borderLight}`,
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          What&rsquo;s included
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {tier.features.map((f, i) => {
            const isHeader = f.endsWith("plus:");
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                {!isHeader && (
                  <span
                    style={{
                      flexShrink: 0,
                      marginTop: "2px",
                      color: C.sage,
                    }}
                  >
                    <IconCheck size={14} color={C.sage} />
                  </span>
                )}
                <span
                  style={{
                    fontSize: "13px",
                    color: isHeader ? C.textPrimary : C.textSecondary,
                    fontWeight: isHeader ? 600 : 400,
                    fontFamily: FONT.sans,
                    lineHeight: 1.45,
                  }}
                >
                  {f}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PricingNote({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          color: C.sage,
          fontWeight: 700,
          fontSize: "14px",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: "13px", color: C.textSecondary }}>{text}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 09 — REPORT PREVIEW (PDF mockup)
// ═══════════════════════════════════════════════════════════════════════

function ReportPreview() {
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
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div className="report-split">
          {/* Left: copy */}
          <div>
            <Eyebrow>Monthly report</Eyebrow>
            <SectionTitle>
              A board-ready PDF, every month.
            </SectionTitle>
            <SectionSub>
              On the 1st of every month, you receive a 12-page reputation report
              in your inbox. Executive summary, sentiment trends, competitor
              benchmark, top topics, AI visibility — formatted for your CEO and
              your board.
            </SectionSub>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <ReportFeature
                title="Executive summary"
                desc="One page your CEO will actually read."
              />
              <ReportFeature
                title="Sentiment trends"
                desc="30-day charts by source, topic, and entity."
              />
              <ReportFeature
                title="Competitor benchmark"
                desc="How you rank vs. your top 3 competitors."
              />
              <ReportFeature
                title="AI visibility report"
                desc="What ChatGPT & Perplexity said about you this month."
              />
              <ReportFeature
                title="Crisis watchlist"
                desc="Topics trending negative — before they become news."
              />
            </div>

            <a
              href="/atelier/harch-100"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "32px",
                fontSize: "14px",
                fontWeight: 600,
                color: C.sage,
                textDecoration: "none",
              }}
            >
              <IconReport size={18} color={C.sage} />
              Download sample report (PDF, 2.4 MB)
            </a>
          </div>

          {/* Right: PDF mockup */}
          <PdfMockup />
        </div>
      </div>
    </section>
  );
}

function ReportFeature({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "4px",
          background: C.sageBg,
          border: `1px solid rgba(74,123,95,0.2)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <IconReport size={14} color={C.sage} />
      </div>
      <div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: C.textPrimary,
            marginBottom: "3px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: "14px", color: C.textSecondary, lineHeight: 1.5 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function PdfMockup() {
  return (
    <div
      className="pdf-mockup-wrap"
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "4px",
          boxShadow: SHADOW.deep,
          overflow: "hidden",
          aspectRatio: "1 / 1.414",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* PDF header */}
        <div
          style={{
            padding: "24px 32px",
            borderBottom: `2px solid ${C.sage}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <BrandBadge subsidiary="Atelier" size="sm" theme="light" />
            <div
              style={{
                marginTop: "12px",
                fontSize: "10px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Rapport Mensuel
            </div>
          </div>
          <div
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              textAlign: "right",
              lineHeight: 1.6,
            }}
          >
            Confidentiel
            <br />
            Juillet 2026
          </div>
        </div>

        {/* PDF body */}
        <div style={{ padding: "24px 32px", flex: 1 }}>
          {/* Title */}
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: C.textPrimary,
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Rapport de Réputation
          </h3>
          <div
            style={{
              fontSize: "13px",
              color: C.textSecondary,
              marginBottom: "4px",
            }}
          >
            Bank of Africa — Juin 2026
          </div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              marginBottom: "20px",
            }}
          >
            Période: 01/06/2026 — 30/06/2026 · 30 jours
          </div>

          {/* Executive summary */}
          <div
            style={{
              padding: "16px",
              background: C.surfaceAlt,
              border: `1px solid ${C.borderLight}`,
              borderRadius: "4px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                fontFamily: FONT.mono,
                color: C.textMuted,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Executive Summary
            </div>
            <p
              style={{
                fontSize: "11px",
                color: C.textSecondary,
                lineHeight: 1.6,
                margin: 0,
                fontFamily: FONT.sans,
              }}
            >
              Bank of Africa maintient une position de réputation solide
              (<strong style={{ color: C.textPrimary }}>78/100</strong>), au rang
              <strong style={{ color: C.textPrimary }}> #6 </strong>
              national. Le sentiment positif progresse de{" "}
              <strong style={{ color: C.sage }}>+4,2 pts</strong>, porté par la
              couverture de la transformation digitale. Cependant, le sujet{" "}
              <strong style={{ color: C.red }}>&laquo; frais bancaires &raquo;</strong>{" "}
              présente un risque émergent (+47% en 24h).
            </p>
          </div>

          {/* Key metrics grid */}
          <div
            style={{
              fontSize: "9px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Key Metrics
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: "8px",
              marginBottom: "20px",
            }}
          >
            <PdfMetric label="Articles" value="247" change="+18" />
            <PdfMetric label="Avg sentiment" value="68%" change="+4.2" />
            <PdfMetric label="AI citations" value="12" change="+3" />
            <PdfMetric label="Reach" value="2.4M" change="+12%" />
          </div>

          {/* Mini sentiment chart */}
          <div
            style={{
              fontSize: "9px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Sentiment Trend — 30 jours
          </div>
          <div
            style={{
              padding: "12px",
              background: C.surface,
              border: `1px solid ${C.borderLight}`,
              borderRadius: "4px",
            }}
          >
            <svg width="100%" height="100" viewBox="0 0 400 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pdfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.sage} stopOpacity="0.15" />
                  <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid */}
              {[25, 50, 75].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={100 - y}
                  x2="400"
                  y2={100 - y}
                  stroke={C.borderLight}
                  strokeWidth="1"
                  strokeDasharray="2,3"
                />
              ))}
              {/* Positive area */}
              <path d={buildAreaPath(SENTIMENT_30D.positive, 400, 100, 100)} fill="url(#pdfGrad)" />
              {/* Lines */}
              <path
                d={buildLinePath(SENTIMENT_30D.positive, 400, 100, 100)}
                fill="none"
                stroke={C.sage}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={buildLinePath(SENTIMENT_30D.negative, 400, 100, 100)}
                fill="none"
                stroke={C.red}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            </svg>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "6px",
              }}
            >
              {["01/06", "08/06", "15/06", "22/06", "30/06"].map((d) => (
                <span
                  key={d}
                  style={{
                    fontSize: "8px",
                    fontFamily: FONT.mono,
                    color: C.textMuted,
                  }}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* PDF footer */}
        <div
          style={{
            padding: "12px 32px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "9px",
            fontFamily: FONT.mono,
            color: C.textMuted,
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <span>Harch Atelier · Confidential</span>
          <span>Page 1 / 12</span>
        </div>
      </div>
    </div>
  );
}

function PdfMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: C.surface,
        border: `1px solid ${C.borderLight}`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          fontSize: "8px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "4px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            fontFamily: FONT.mono,
            color: C.textPrimary,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </span>
        <span
          style={{
            fontSize: "9px",
            fontFamily: FONT.mono,
            color: C.sage,
            fontWeight: 600,
          }}
        >
          ↑ {change}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 10 — FINAL CTA (form)
// ═══════════════════════════════════════════════════════════════════════

function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email && form.company) {
      setSubmitted(true);
    }
  };

  return (
    <section
      id="audit"
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle sage glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "800px",
          height: "800px",
          background:
            "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Eyebrow color={C.sage}>
          <span style={{ display: "inline-flex", justifyContent: "center", width: "100%" }}>
            Free reputation audit
          </span>
        </Eyebrow>
        <h2
          style={{
            fontSize: "clamp(32px, 4.5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: C.textPrimary,
            margin: "0 0 20px",
          }}
        >
          Get your free reputation audit.
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: C.textSecondary,
            lineHeight: 1.6,
            margin: "0 0 40px",
          }}
        >
          We&rsquo;ll scan 30+ media sources and 8 AI engines for your brand,
          then send you a one-page reputation snapshot within 48 hours. No
          commitment, no credit card.
        </p>

        {/* Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
              padding: "32px",
              boxShadow: SHADOW.card,
              textAlign: "left",
            }}
          >
            <div
              className="cta-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <FormField
                label="Full name"
                type="text"
                placeholder="Aicha Bennani"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <FormField
                label="Work email"
                type="email"
                placeholder="aicha@boa.ma"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <FormField
                label="Company"
                type="text"
                placeholder="Bank of Africa"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
              />
            </div>
            <button
              type="submit"
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "15px 28px",
                background: C.cta, // emerald-500 — DS V2 primary CTA
                color: C.textOnDark, // white
                fontSize: "15px",
                fontWeight: 600,
                border: `1px solid ${C.cta}`,
                borderRadius: "3px",
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.ctaHover; // emerald-400
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = C.cta;
              }}
            >
              Get my free audit
              <IconArrow dir="right" size={16} color={C.textOnDark} />
            </button>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "center",
                gap: "20px",
                flexWrap: "wrap",
                fontSize: "12px",
                color: C.textMuted,
                fontFamily: FONT.mono,
              }}
            >
              <span>✓ 48h response</span>
              <span>✓ No credit card</span>
              <span>✓ Cancel anytime</span>
            </div>
          </form>
        ) : (
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.cta}`, // emerald-500 — success confirmation
              borderRadius: "8px",
              padding: "40px 32px",
              boxShadow: SHADOW.card,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: C.successBg, // emerald-50 — success state
                border: `1px solid rgba(16,185,129,0.3)`, // emerald-500 @ 30%
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <IconCheck size={28} color={C.cta} />
            </div>
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: C.textPrimary,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Thank you, {form.name.split(" ")[0]}.
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: C.textSecondary,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              We&rsquo;ve received your request for{" "}
              <strong style={{ color: C.textPrimary }}>{form.company}</strong>.
              You&rsquo;ll receive your one-page reputation snapshot at{" "}
              <strong style={{ color: C.textPrimary }}>{form.email}</strong> within
              48 hours.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "11px",
          fontFamily: FONT.mono,
          color: C.textMuted,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: "8px",
          fontWeight: 500,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: "14px",
          fontFamily: FONT.sans,
          color: C.textPrimary,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "3px",
          transition: "border-color 0.2s, box-shadow 0.2s",
          outline: "none",
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE STYLES (responsive)
// ═══════════════════════════════════════════════════════════════════════

const pageStyles = `
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .hero-cta-row { flex-wrap: wrap; }
  .hero-trust { gap: 24px; }

  .logo-wall-grid { grid-template-columns: repeat(4, 1fr); }

  .feature-grid { grid-template-columns: repeat(4, 1fr); }

  .whatsapp-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  .dash-layout {
    grid-template-columns: 200px 1fr 280px;
  }

  .harch-table-head,
  .harch-table-row {
    grid-template-columns: 60px 1fr 120px 120px 180px;
  }

  .how-grid { grid-template-columns: repeat(3, 1fr); }

  .pricing-grid { grid-template-columns: repeat(3, 1fr); }

  .report-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }

  .cta-form-grid { grid-template-columns: 1fr 1fr; }

  /* ─── Responsive: 1024px ─── */
  @media (max-width: 1024px) {
    .feature-grid { grid-template-columns: repeat(2, 1fr); }
    .dash-layout { grid-template-columns: 180px 1fr; }
    .dash-right { display: none; }
    .logo-wall-grid { grid-template-columns: repeat(3, 1fr); }
  }

  /* ─── Responsive: 900px ─── */
  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .hero-mockup { max-width: 480px; margin: 0 auto; width: 100%; }
    .whatsapp-split {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .whatsapp-mockup-wrap { order: -1; }
    .how-grid { grid-template-columns: 1fr; }
    .how-arrow { display: none; }
    .pricing-grid { grid-template-columns: 1fr; max-width: 480px; margin: 0 auto; }
    .report-split {
      grid-template-columns: 1fr;
      gap: 48px;
    }
    .pdf-mockup-wrap { order: -1; }
    .dash-layout { grid-template-columns: 1fr; }
    .dash-sidebar { display: none; }
    .logo-wall-grid { grid-template-columns: repeat(2, 1fr); }
  }

  /* ─── Responsive: 640px ─── */
  @media (max-width: 640px) {
    .feature-grid { grid-template-columns: 1fr; }
    .hero-kpi-row { grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .hero-trust { gap: 16px; }
    .harch-table-head span:nth-child(5),
    .harch-table-row > div:last-child { display: none; }
    .harch-table-head,
    .harch-table-row {
      grid-template-columns: 50px 1fr 90px 100px;
    }
    .dash-mini-stats { grid-template-columns: 1fr; }
    .cta-form-grid { grid-template-columns: 1fr; }
    .logo-wall-grid { grid-template-columns: 1fr; }
  }

  /* Focus visible */
  a:focus-visible, button:focus-visible, input:focus-visible {
    outline: 2px solid ${C.accentHover}; /* stone-600 — DS V2 Atelier accent */
    outline-offset: 2px;
  }
`;

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════

export default function AtelierHome() {
  return (
    <>
      <style>{pageStyles}</style>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      {/* MASTER_VISION "Obligations absolues" + DS V2 — disclaimer pre-launch
          global. Affiché sur toutes les pages Atelier. */}
      <PhaseDisclaimer />
      <main style={{ position: "relative", zIndex: 1 }}>
        <Hero />
        <LogoWall />
        <WhatWeDo />
        <WhatsAppPreview />
        <DashboardPreview />
        <Harch100 />
        <HowItWorks />
        <Pricing />
        <ReportPreview />
        <FinalCTA />
      </main>
      <AtelierFooter />
      <BackToTop />
    </>
  );
}

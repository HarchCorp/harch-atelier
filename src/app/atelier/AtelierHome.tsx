"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, useInView } from "framer-motion";
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
// MOTION HELPERS — count-up + scroll-reveal (POLISH-PUBLIC)
// ═══════════════════════════════════════════════════════════════════════

// useCountUp — animates 0 → target once `start` flips to true.
// Uses requestAnimationFrame + easeOutCubic for smooth deceleration.
function useCountUp(target: number, duration = 1200, start = false): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

// AnimatedStat — animates 0 → value when the stat scrolls into view.
// Only animates values that start with optional whitespace + a digit
// (e.g. "5M+", "100M+", "120+", "32", "48h", "1.2K"). Values like
// "< 5min", "Sur devis", or "Illimité" render as-is.
function AnimatedStat({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  // prefix (whitespace only) + number + non-digit suffix
  const match = value.match(/^(\s*)(\d+(?:\.\d+)?)(\D.*)?$/);
  const target = match ? parseFloat(match[2]) : 0;
  const animated = useCountUp(target, 1200, inView && !!match);
  if (!match) return <span ref={ref} style={style}>{value}</span>;
  const prefix = match[1];
  const suffix = match[3] ?? "";
  const display = Number.isInteger(target)
    ? Math.round(animated).toString()
    : animated.toFixed(1);
  return (
    <span ref={ref} style={style}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// Reveal — fades + lifts a section into view on scroll. Once only.
function Reveal({
  children,
  delay = 0,
  y = 20,
  style,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// StaggerContainer — orchestrates staggered child reveals.
function StaggerContainer({
  children,
  style,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem — fades + lifts in, driven by parent StaggerContainer.
function StaggerItem({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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
  { name: "Credit rates", positive: 55, negative: 30, mentions: 41, risk: false },
  { name: "Branch network", positive: 73, negative: 15, mentions: 38, risk: false },
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

// IconBarChart — bar chart for daily brief WhatsApp bubble (replaces chart emoji).
function IconBarChart({ size = 16, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

// IconAlert — triangle warning for crisis alerts (replaces warning emoji).
function IconAlert({ size = 16, color = C.red }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

// IconFile — file/document icon for PDF report (replaces page emoji).
function IconFile({ size = 16, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="15" y2="17" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO
// ═══════════════════════════════════════════════════════════════════════

function Hero({ ctaHref, ctaLabel, secondaryCtaHref, secondaryCtaLabel }: {
  ctaHref: string;
  ctaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
}) {
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
              Intelligence réputationnelle IA · Augmentation de décision
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
              Promouvoir. Protéger.{" "}
              {/* DS V2 §5 + Benchmark Pattern 2 — H1 split-color.
                  Mot accent en stone-500 (C.accent). */}
              <span style={{ color: C.accent }}>Façonner.</span>
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
              Le scalpel chirurgical de l&apos;intelligence réputationnelle.
              Natif Maroc. WhatsApp-native. IA native. Pas une machine lourde
              occidentale — un instrument de précision qui comprend la réalité
              politique, sociale et linguistique du terrain.
            </p>

            {/* CTAs — DS V2 §3 : primary = bg-emerald-500, secondary = border-neutral-300 */}
            <div
              className="hero-cta-row"
              style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}
            >
              <motion.a
                href={ctaHref}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.ctaHover; // emerald-400
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = C.cta;
                }}
              >
                {ctaLabel}
                <IconArrow dir="right" size={16} color={C.textOnDark} />
              </motion.a>
              <motion.a
                href={secondaryCtaHref}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = C.bgHover; // neutral-100
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {secondaryCtaLabel}
              </motion.a>
            </div>

            {/* Trust indicators — Signal AI style */}
            <StaggerContainer
              className="hero-trust"
              style={{
                marginTop: "48px",
                display: "flex",
                gap: "32px",
                flexWrap: "wrap",
              }}
              stagger={0.1}
            >
              <StaggerItem><TrustStat value="5M+" label="Articles ingérés/jour" /></StaggerItem>
              <StaggerItem><TrustStat value="100M+" label="Entités labellisées/jour" /></StaggerItem>
              <StaggerItem><TrustStat value="120+" label="Langues traduites" /></StaggerItem>
              <StaggerItem><TrustStat value="32" label="Catégories de risque" /></StaggerItem>
            </StaggerContainer>
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
        <AnimatedStat value={value} />
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
            marginBottom: "12px",
          }}
        >
          Écosystème surveillé et cartographié par Harch IQ
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: "12px",
            color: C.textMuted,
            fontFamily: FONT.sans,
            maxWidth: "760px",
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          Ces entités sont suivies en continu par nos moteurs d&apos;ingestion et d&apos;analyse.
          La présence de leurs logos ne constitue pas une endorsement commerciale.
        </p>
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
      title: "Veille médiatique",
      desc: "Nous surveillons 30+ sources media marocaines et africaines — Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui Le Maroc et plus — 24/7.",
      stat: "30+",
      statLabel: "sources",
    },
    {
      icon: <IconAI size={32} color={C.sage} />,
      title: "Visibilité IA",
      desc: "Voyez ce que ChatGPT, Perplexity, Gemini et Claude disent de votre marque. Suivez votre rang sur les prompts qui comptent pour vos clients.",
      stat: "8",
      statLabel: "moteurs IA",
    },
    {
      icon: <IconSentiment size={32} color={C.sage} />,
      title: "Analyse de sentiment",
      desc: "HarchIQ analyse chaque mention en français, arabe et anglais. Répartition positif / neutre / négatif par entité, sujet et source.",
      stat: "3",
      statLabel: "langues",
    },
    {
      icon: <IconBell size={32} color={C.sage} />,
      title: "Alertes de crise",
      desc: "Quand le sentiment négatif grimpe sur un sujet, vous recevez une alerte WhatsApp sous 5 minutes — avant que cela ne devienne une crise.",
      stat: "< 5min",
      statLabel: "latence d'alerte",
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
        <Eyebrow>Notre métier</Eyebrow>
        <SectionTitle>
          Quatre piliers de l'intelligence réputationnelle.
        </SectionTitle>
        <SectionSub>
          La plupart des outils de réputation ont été conçus pour les marques
          américaines sur des médias anglophones. Nous avons construit Harch
          Atelier pour la réalité francophone et africaine — sources arabes,
          presse économique francophone, et moteurs IA que vos clients utilisent
          réellement.
        </SectionSub>

        <StaggerContainer
          className="feature-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
          stagger={0.1}
        >
          {features.map((f, i) => (
            <StaggerItem key={i} style={{ height: "100%" }}>
              <FeatureCard {...f} />
            </StaggerItem>
          ))}
        </StaggerContainer>
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
        className="feature-icon-box"
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
          transition: "all 0.25s",
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
          <AnimatedStat value={stat} />
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
            <Eyebrow color={C.sage}>Livraison WhatsApp</Eyebrow>
            <SectionTitle>
              Votre brief matinal, sur WhatsApp.
            </SectionTitle>
            <SectionSub>
              Chaque matin à 7h00, vous recevez un digest structuré de ce qui
              s'est dit sur votre marque dans les dernières 24 heures — média,
              social, et moteurs IA. Pas d'app à ouvrir. Pas de dashboard à
              consulter. Il suffit d'ouvrir WhatsApp.
            </SectionSub>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <WhatsAppFeature
                title="Digest quotidien à 7h00"
                desc="Articles média, mentions sociales, citations IA — tout dans un seul message."
              />
              <WhatsAppFeature
                title="Alertes de crise en temps réel"
                desc="Quand le sentiment négatif grimpe sur un sujet, vous recevez une alerte sous 5 minutes."
              />
              <WhatsAppFeature
                title="Répondez pour poser des questions"
                desc="Textez « Quel est mon score cette semaine ? » et obtenez une réponse instantanée de notre IA."
              />
              <WhatsAppFeature
                title="Partagez avec votre équipe"
                desc="Transférez le digest à votre équipe comms, au CEO, ou au board en un tap."
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
              en ligne
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
              Aujourd&rsquo;hui
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
                <strong style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <IconBarChart size={14} color={C.sage} />
                  Bank of Africa — Brief Quotidien — 18/07
                </strong>
                {"\n\n"}
                <strong>Médias:</strong> 12 articles (8 positifs, 3 neutres, 1 négatif){"\n"}
                <strong>Social:</strong> 340 mentions (78% positif){"\n"}
                <strong>IA:</strong> ChatGPT vous cite #2 sur &lsquo;meilleure banque Maroc&rsquo;
                {"\n\n"}
                <span style={{ color: C.red, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <IconAlert size={14} color={C.red} />
                  Alerte : sujet &lsquo;banking fees&rsquo; en hausse (+47% en 24h)
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
                Répondez &lsquo;details&rsquo; pour le rapport complet.
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
                details
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
              <div style={{ fontSize: "13px", color: C.text, lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <IconFile size={14} color={C.sage} />
                  Rapport Complet — Juillet 2026
                </span>
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
        <Eyebrow>Le dashboard</Eyebrow>
        <SectionTitle>
          Un dashboard. Chaque signal qui compte.
        </SectionTitle>
        <SectionSub>
          Veille médiatique, tendances de sentiment, benchmark concurrents,
          visibilité IA et alertes de crise — tout au même endroit. Conçu pour
          les directeurs comms et les CEO qui veulent la vision complète en
          60 secondes.
        </SectionSub>

        <DashboardMockup />
      </div>
    </section>
  );
}

function DashboardMockup() {
  const navItems = [
    { icon: <IconMonitor size={16} color={C.sage} />, label: "Veille", active: true },
    { icon: <IconChart size={16} color={C.textMuted} />, label: "Sentiment", active: false },
    { icon: <IconUsers size={16} color={C.textMuted} />, label: "Concurrents", active: false },
    { icon: <IconBell size={16} color={C.textMuted} />, label: "Alertes", active: false, badge: "3" },
    { icon: <IconReport size={16} color={C.textMuted} />, label: "Rapports", active: false },
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
            Rechercher mentions, sujets, concurrents…
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
                28 jours restants
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
                Mettre à niveau →
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
                Analyse de sentiment
              </h3>
            </div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["7 jours", "30 jours", "90 jours"].map((range, i) => (
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
                Sentiment dans le temps
              </div>
              {/* Legend */}
              <div style={{ display: "flex", gap: "16px" }}>
                <ChartLegend color={C.sage} label="Positif" />
                <ChartLegend color={C.neutral} label="Neutre" />
                <ChartLegend color={C.red} label="Négatif" />
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
              {["1 juil", "8 juil", "15 juil", "22 juil", "29 juil"].map((d) => (
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
              label="Sentiment moyen"
              value="68%"
              change="+4.2"
              positive
            />
            <DashMiniStat
              label="Mentions / jour"
              value="47"
              change="+12"
              positive
            />
            <DashMiniStat
              label="Citations IA"
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
            Top 5 sujets
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
              Visibilité IA
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
        <Eyebrow color={C.sage}>Le HARCH 100</Eyebrow>
        <SectionTitle>
          Les entreprises marocaines les plus réputées.
        </SectionTitle>
        <SectionSub>
          Mis à jour mensuellement. Le HARCH 100 classe les entreprises
          marocaines par score de réputation — un composite de sentiment média,
          volume de mentions sociales, visibilité IA et share of voice. Voici
          le top 10 pour juillet 2026.
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
            <span>Rang</span>
            <span>Entreprise</span>
            <span>Score</span>
            <span>Tendance 30j</span>
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
            Mis à jour 01/07/2026 · Méthodologie : sentiment pondéré (40 %) +
            volume (25 %) + visibilité IA (20 %) + share of voice (15 %)
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
            Voir le HARCH 100 complet
            <IconArrow dir="right" size={14} color={C.sage} />
          </a>
        </div>
      </div>

      {/* Flagship Report CTA */}
      <div style={{
        marginTop: "32px",
        padding: "32px",
        background: `linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%)`,
        borderRadius: "12px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          opacity: 0.5,
        }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "4px 12px", background: "rgba(5,150,105,0.15)",
              border: "1px solid rgba(5,150,105,0.3)", borderRadius: "100px",
              fontSize: "10px", fontFamily: FONT.mono, color: "#10B981",
              letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700,
              marginBottom: "16px",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
              Nouveau · Rapport phare
            </div>
            <h3 style={{
              fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 800,
              color: "#FAFAFA", letterSpacing: "-0.02em", lineHeight: 1.1,
              margin: "0 0 8px",
            }}>
              Rapport Intelligence Réputation Maroc 2026
            </h3>
            <p style={{
              fontSize: "14px", color: "#A3A3A3", lineHeight: 1.5,
              margin: 0, maxWidth: "520px",
            }}>
              L'analyse la plus complète jamais produite. 8 entreprises, 20
              personnes réelles, 1 858 articles, 416 instantanés de sentiment
              hebdomadaires, 3 726 cours BVC — sur 365 jours.
            </p>
          </div>
          <a
            href="/atelier/flagship-report"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "14px 28px", background: "#059669", color: "#FFFFFF",
              fontSize: "14px", fontWeight: 600, fontFamily: FONT.sans,
              textDecoration: "none", borderRadius: "6px", border: "1px solid #059669",
              whiteSpace: "nowrap", transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#10B981"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#059669"; }}
          >
            Lire le rapport
            <IconArrow dir="right" size={14} color="#FFFFFF" />
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
          <AnimatedStat value={String(row.score)} />
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
      title: "Nous surveillons",
      desc: "30+ sources media marocaines et africaines, plateformes sociales, et 8 moteurs IA — scannés 24/7 en français, arabe et anglais.",
      detail: "Sources : Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui Le Maroc, Le360, Yabiladi, Bladi, MâadBarid…",
      icon: <IconRadar size={36} color={C.sage} />,
    },
    {
      num: "02",
      title: "L'IA analyse",
      desc: "HarchIQ traite chaque mention — classification de sentiment, extraction de sujets, détection de tendances et scoring de crise. Le tout en temps réel.",
      detail: "Moteur : HarchIQ · Langues : FR / AR / EN · Latence : < 30 sec par article",
      icon: <IconAI size={36} color={C.sage} />,
    },
    {
      num: "03",
      title: "Vous recevez",
      desc: "Digest WhatsApp quotidien à 7h00. Dashboard live avec drill-down complet. Rapport PDF mensuel. Alertes en temps réel quand le sentiment bouge.",
      detail: "Canaux : WhatsApp · Dashboard web · Email PDF · API (Grandes Entreprises)",
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
        <Eyebrow>Comment ça marche</Eyebrow>
        <SectionTitle>
          Trois étapes. Zéro bruit.
        </SectionTitle>
        <SectionSub>
          D'une mention média à votre WhatsApp en moins de 5 minutes. Voici
          le pipeline qui alimente Harch Atelier.
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
              d&rsquo;une mention à WhatsApp
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
            <TimelineDot label="Analyse" time="~60s" />
            <TimelineDot label="Score" time="~10s" />
            <TimelineDot label="Livraison" time="~120s" />
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
      <Eyebrow color={C.accent}>Voir en action</Eyebrow>
      <SectionTitle maxW="720px">Trois phases. Un seul pipeline.</SectionTitle>
      <SectionSub>
        Cliquez sur un onglet pour voir ce qui se passe à chaque phase — du
        scrape média brut à votre boîte WhatsApp.
      </SectionSub>
      <TeslaTabs
        ariaLabel="Phases du pipeline Harch Atelier"
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
        Nous scrapeons 30+ media marocains et africains + 8 moteurs IA.
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
            Media marocains &amp; africains · 30+
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
            Moteurs IA · 8
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
            articles ingérés/jour
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
            langues traduites
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
            fréquence de scan
          </div>
        </div>
      </div>
    </div>
  );
}

function BuildView() {
  const pipeline = [
    { step: "Ingestion", desc: "Article brut + métadonnées capturés", time: "~5s" },
    { step: "NLP", desc: "Détection de langue + extraction d'entités", time: "~10s" },
    { step: "Score", desc: "Sentiment + risque + classification de sujets", time: "~8s" },
    { step: "Alerte", desc: "Vérification de seuil → WhatsApp si crise", time: "~2s" },
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
        HarchIQ analyse sentiment, risque et visibilité IA par entité.
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
        Moteur : HarchIQ · Langues : FR / AR / EN · Latence : &lt; 30 sec par
        article
      </div>
    </div>
  );
}

function VaultView() {
  const channels = [
    {
      name: "Digest quotidien WhatsApp",
      desc: "7h00 chaque matin — votre réputation en 60 secondes de lecture",
      icon: "▣",
      detail: "Alertes de crise en temps réel quand le sentiment bouge",
    },
    {
      name: "Dashboard web",
      desc: "Drill-down complet — articles, entités, tendances, concurrents",
      icon: "▦",
      detail: "Constructeur de visualisation drag-and-drop (Pro+)"
    },
    {
      name: "Rapport PDF mensuel",
      desc: "Format board-ready, 12 pages, brandé à votre logo",
      icon: "▤",
      detail: "Synthèse exécutive + matrice des risques + recommandations",
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
        Vous obtenez Digest WhatsApp + dashboard + PDF mensuel.
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
      name: "Essentiel",
      price: "Sur devis",
      period: "Engagement annuel · paiement mensuel",
      tagline: "Pour les petites équipes de communication et marketing qui démarrent leur veille réputationnelle.",
      features: [
        "Veille médiatique",
        "Veille sociale",
        "Suivi de la visibilité IA (GenAI Lens)",
        "Relations médias",
        "HarchIQ AI (50 questions/jour)",
        "Alertes et rapports",
        "Tableaux de bord prédéfinis",
      ],
      cta: "Contacter le service commercial",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "Sur devis",
      period: "Engagement annuel · paiement mensuel",
      tagline: "Pour les équipes régionales et les organisations de marketing multicanal qui doivent anticiper avec une analyse avancée.",
      features: [
        "Tout Essentiel, plus:",
        "HarchIQ AI — Avancé (200 questions/jour)",
        "Benchmarking concurrentiel",
        "Tableaux de bord et rapports personnalisés",
        "Alertes intelligentes",
        "Suivi influenceurs",
        "Export data (CSV, API read-only)",
      ],
      cta: "Contacter le service commercial",
      highlighted: true,
    },
    {
      name: "Grandes Entreprises",
      price: "Sur devis",
      period: "Engagement annuel · paiement mensuel",
      tagline: "Pour les marques leaders et internationales qui industrialisent l'intelligence réputationnelle avec gouvernance et conformité.",
      features: [
        "Tout Pro, plus:",
        "HarchIQ AI — Version entreprise (illimité)",
        "Intégrations API et MCP",
        "Gouvernance, workflows et autorisations",
        "Marketing d'influence",
        "SSO / SAML",
        "Rapports board-ready",
        "SLA enterprise",
      ],
      cta: "Contacter le service commercial",
      highlighted: false,
    },
    {
      name: "Agences",
      price: "Sur devis",
      period: "Engagement annuel · paiement mensuel",
      tagline: "Pour les agences RP et cabinets de conseil qui gèrent plusieurs clients en portefeuille avec white-label et gouvernance multi-comptes.",
      features: [
        "Tout Grandes Entreprises, plus:",
        "Multi-clients + White-label",
        "HarchIQ AI — Avancé",
        "Gouvernance, workflows et autorisations",
        "Facturation par compte",
        "3 niveaux selon la taille de l'agence",
      ],
      cta: "Contacter le service commercial",
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
        <Eyebrow color={C.sage}>Tarifs</Eyebrow>
        <SectionTitle>
          Une tarification qui passe à l'échelle de votre réputation.
        </SectionTitle>
        <SectionSub>
          Tous les plans incluent un essai gratuit de 14 jours. Sans carte
          bancaire. Prix en MAD (dirham marocain). Annulable à tout moment.
        </SectionSub>

        <StaggerContainer
          className="pricing-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
            alignItems: "stretch",
          }}
          stagger={0.1}
        >
          {tiers.map((tier) => (
            <StaggerItem key={tier.name} style={{ height: "100%" }}>
              <PricingCard tier={tier} />
            </StaggerItem>
          ))}
        </StaggerContainer>

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
          <PricingNote icon="✓" text="Essai gratuit 14 jours" />
          <PricingNote icon="✓" text="Sans carte bancaire" />
          <PricingNote icon="✓" text="Annulable à tout moment" />
          <PricingNote icon="✓" text="Facturation MAD et EUR" />
          <PricingNote icon="✓" text="Données hébergées en UE" />
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
          e.currentTarget.style.boxShadow = SHADOW.cardHover;
        } else {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = SHADOW.deep;
        }
      }}
      onMouseLeave={(e) => {
        if (!tier.highlighted) {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = SHADOW.card;
        } else {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = SHADOW.cardHover;
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
          Le plus populaire
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
      <motion.a
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
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
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
      </motion.a>

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
          Inclus
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
            <Eyebrow>Rapport mensuel</Eyebrow>
            <SectionTitle>
              Un PDF board-ready, chaque mois.
            </SectionTitle>
            <SectionSub>
              Le 1er de chaque mois, vous recevez un rapport de réputation de
              12 pages dans votre boîte mail. Synthèse exécutive, tendances de
              sentiment, benchmark concurrents, sujets émergents, visibilité
              IA — formaté pour votre CEO et votre board.
            </SectionSub>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <ReportFeature
                title="Synthèse exécutive"
                desc="Une page que votre CEO lira réellement."
              />
              <ReportFeature
                title="Tendances de sentiment"
                desc="Graphiques 30 jours par source, sujet et entité."
              />
              <ReportFeature
                title="Benchmark concurrents"
                desc="Votre rang vs. vos 3 principaux concurrents."
              />
              <ReportFeature
                title="Rapport de visibilité IA"
                desc="Ce que ChatGPT et Perplexity ont dit de vous ce mois-ci."
              />
              <ReportFeature
                title="Watchlist de crise"
                desc="Sujets qui trendent négatif — avant qu'ils ne deviennent des actualités."
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
              Télécharger un exemple de rapport (PDF, 2,4 Mo)
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
              Monthly Report
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
            Reputation Report
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
            Period: 01/06/2026 — 30/06/2026 · 30 days
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
              <strong style={{ color: C.sage }}>+4.2 pts</strong>, driven by
              couverture de la transformation digitale. Cependant, le sujet{" "}
              <strong style={{ color: C.red }}>&laquo; frais bancaires &raquo;</strong>{" "}
              shows an emerging risk (+47% in 24h).
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
            Sentiment Trend — 30 days
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Synchronous rage-click guard — prevents double-submit when the
  // user double-clicks the CTA before the loading state paints.
  const submittingRef = useRef(false);
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    // Task FIX-FORMS-1: POST to /api/access-request with
    // source="landing-page" so the admin can triage FinalCTA leads
    // separately from the contact / audit / request-access flows.
    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          country: "Morocco",
          source: "landing-page",
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        return;
      }

      if (res.status === 409) {
        // A request or account already exists — still surface a
        // friendly success state so we don't leak lead status.
        setSubmitted(true);
        return;
      }

      const data = await res.json().catch(() => null);
      setError(
        (data?.error as string) ||
          "Échec de l'envoi. Veuillez réessayer."
      );
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
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
            Audit de réputation gratuit
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
          Obtenez votre audit de réputation gratuit.
        </h2>
        <p
          style={{
            fontSize: "18px",
            color: C.textSecondary,
            lineHeight: 1.6,
            margin: "0 0 40px",
          }}
        >
          Nous scanons 30+ sources média et 8 moteurs IA pour votre marque,
          puis vous envoyons un instantané de réputation d'une page sous 48
          heures. Sans engagement, sans carte bancaire.
        </p>

        {/* Form */}
        {!submitted ? (
          <Reveal>
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
                label="Nom complet"
                type="text"
                placeholder="Aicha Bennani"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
              />
              <FormField
                label="Email professionnel"
                type="email"
                placeholder="aicha@boa.ma"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <FormField
                label="Entreprise"
                type="text"
                placeholder="Bank of Africa"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "15px 28px",
                background: submitting ? C.ctaHover : C.cta, // emerald-500 — DS V2 primary CTA
                color: C.textOnDark, // white
                fontSize: "15px",
                fontWeight: 600,
                border: `1px solid ${C.cta}`,
                borderRadius: "3px",
                cursor: submitting ? "wait" : "pointer",
                fontFamily: FONT.sans,
                transition: "background-color 0.2s, opacity 0.2s",
                opacity: submitting ? 0.7 : 1,
              }}
              whileHover={submitting ? undefined : { scale: 1.02 }}
              whileTap={submitting ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onMouseEnter={(e) => {
                if (submitting) return;
                e.currentTarget.style.background = C.ctaHover; // emerald-400
              }}
              onMouseLeave={(e) => {
                if (submitting) return;
                e.currentTarget.style.background = C.cta;
              }}
            >
              {submitting ? "Envoi en cours…" : "Obtenir mon audit gratuit"}
              {!submitting && (
                <IconArrow dir="right" size={16} color={C.textOnDark} />
              )}
            </motion.button>
            {/* Inline error banner (Task FIX-FORMS-1) — surfaces API
                failures so the user can retry without losing form
                state. */}
            {error && (
              <div
                role="alert"
                style={{
                  marginTop: "12px",
                  padding: "10px 14px",
                  background: "rgba(160,82,75,0.06)",
                  border: `1px solid ${C.red}`,
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: C.red,
                  fontFamily: FONT.sans,
                  lineHeight: 1.5,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
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
              <span>✓ Réponse sous 48h</span>
              <span>✓ Sans carte bancaire</span>
              <span>✓ Annulez à tout moment</span>
            </div>
          </form>
          </Reveal>
        ) : (
          <Reveal>
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
              Merci, {form.name.split(" ")[0]}.
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: C.textSecondary,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Nous avons bien reçu votre demande pour{" "}
              <strong style={{ color: C.textPrimary }}>{form.company}</strong>.
              Vous recevrez votre instantané de réputation d&rsquo;une page à{" "}
              <strong style={{ color: C.textPrimary }}>{form.email}</strong> sous
              48 heures.
            </p>
          </div>
          </Reveal>
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

  /* POLISH-PUBLIC · icon hover polish — subtle bg tint + scale lift
     on the feature-card icon container (overrides inline bg via
     !important since the icon-box has inline background). */
  .feature-card:hover .feature-icon-box {
    background: rgba(120,113,108,0.16) !important;
    border-color: rgba(120,113,108,0.30) !important;
    transform: scale(1.06);
  }
`;

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE EXPORT
// ═══════════════════════════════════════════════════════════════════════

export default function AtelierHome() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const consoleUrl = session?.user?.role === "admin"
    ? "/atelier/admin"
    : "/atelier/console";
  const ctaHref = isLoggedIn ? consoleUrl : "/atelier/login";
  const ctaLabel = isLoggedIn ? "Accéder à la Console" : "Se connecter";
  const secondaryCtaHref = isLoggedIn ? "/atelier/request-access" : "/atelier/audit";
  const secondaryCtaLabel = isLoggedIn ? "Inviter votre équipe" : "Demander une démo";

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
        <Hero
          ctaHref={ctaHref}
          ctaLabel={ctaLabel}
          secondaryCtaHref={secondaryCtaHref}
          secondaryCtaLabel={secondaryCtaLabel}
        />
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

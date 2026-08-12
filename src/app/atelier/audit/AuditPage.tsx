"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// MOTION HELPERS — count-up + scroll-reveal (POLISH-PUBLIC)
// ═══════════════════════════════════════════════════════════════════════

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

// AnimatedStat — animates 0 → value when scrolled into view.
// Only animates values that start with optional whitespace + a digit.
function AnimatedStat({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
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

// SageConfetti — CSS-only sage celebration burst for the success state.
// 24 particles with random left / delay / duration / size, falling from
// top with rotation. Rendered once on mount; particles fade out at end.
function SageConfetti() {
  const particles = Array.from({ length: 24 }, (_, i) => {
    const seed = (i * 73) % 100;
    const left = (seed * 1.0 + (i * 13) % 7) % 100;
    const delay = (i % 6) * 0.08;
    const duration = 2.2 + (i % 5) * 0.3;
    const size = 6 + (i % 4) * 2;
    const palette = [C.sage, C.sageBright, C.accentDark];
    const color = palette[i % palette.length];
    return { left, delay, duration, size, color, i };
  });
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {particles.map((p) => (
        <span
          key={p.i}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: "2px",
            opacity: 0,
            animation: `audit-confetti-fall ${p.duration}s ${p.delay}s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — AUDIT PAGE (Free reputation audit form)
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — free 7-day audit request form.
// 3-step form: Company → Sources → Contact. Success state at the end.
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero
//   02  Audit form (3 steps) + what-you-get preview
//   03  Success state
//   04  Sample audit deliverable preview
//   05  Trust / why us
//   06  CTA
//   07  Footer
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

const SECTORS = [
  "Banque", "Télécom", "Énergie", "Mines", "Agriculture", "Hôtellerie",
  "Distribution", "Transport / Logistique", "Santé", "Tech / SaaS", "Autre",
];

const SOURCES_OPTIONS = [
  { id: "media", label: "Media marocains", desc: "Le Matin, L'Économiste, Hespress, TelQuel...", default: true },
  { id: "african", label: "Media africains", desc: "Jeune Afrique, Financial Afrik...", default: false },
  { id: "francophone", label: "Press francophone", desc: "Le Monde Afrique, RFI...", default: false },
  { id: "ai", label: "Moteurs IA", desc: "ChatGPT, Perplexity, Gemini...", default: true },
  { id: "social", label: "Signaux sociaux", desc: "Twitter, forums, avis...", default: false },
];

const WHAT_YOU_GET = [
  {
    n: "01",
    title: "Monitoring de 7 jours",
    desc: "Nous déployons le pipeline complet sur votre marque pendant 7 jours. Même couverture que le tier Corporate.",
    icon: "radar",
  },
  {
    n: "02",
    title: "Accès au dashboard live",
    desc: "Dashboard en temps réel avec votre score de réputation, la répartition de sentiment, les sujets émergents.",
    icon: "chart",
  },
  {
    n: "03",
    title: "3 digests WhatsApp",
    desc: "Exemples de digests matinaux livrés sur votre WhatsApp — voyez exactement ce que vous recevrez.",
    icon: "bell",
  },
  {
    n: "04",
    title: "Rapport PDF d'exemple",
    desc: "Mini-rapport de 8 pages à la fin de l'audit — format board-ready.",
    icon: "doc",
  },
];

const TIMELINE = [
  { day: "Jour 1", label: "Appel d'onboarding (30 min) + configuration", color: C.sage },
  { day: "Jour 1-7", label: "Monitoring actif sur votre marque", color: C.accentDark },
  { day: "Jour 3", label: "Premier digest WhatsApp livré", color: C.sage },
  { day: "Jour 7", label: "Rapport PDF final + appel de debrief", color: C.red },
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

function IconArrow({ size = 20, color = C.textMuted, dir = "right" }: { size?: number; color?: string; dir?: "right" | "up" }) {
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

function IconRadar({ size = 22, color = C.sage }: { size?: number; color?: string }) {
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

function IconChart({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 14l3-3 3 3 5-5" />
    </svg>
  );
}

function IconBell({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconDoc({ size = 22, color = C.sage }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}

function getWhatYouGetIcon(icon: string) {
  if (icon === "radar") return IconRadar;
  if (icon === "chart") return IconChart;
  if (icon === "bell") return IconBell;
  return IconDoc;
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
        padding: "80px 32px 80px",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: "-200px", right: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(74,123,95,0.04), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-150px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,157,175,0.05), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <Reveal style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1, textAlign: "center" }}>
        <Eyebrow color={C.sage}>Audit gratuit · 7 jours</Eyebrow>
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
          Voyez ce que le monde dit
          <br />
          <span style={{ color: C.sage }}>de votre marque. Gratuitement.</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: C.textSecondary,
            lineHeight: 1.5,
            maxWidth: "620px",
            margin: "0 auto 40px",
          }}
        >
          7 jours de monitoring complet — même pipeline que notre tier Corporate.
          Vous obtenez un dashboard live, trois digests WhatsApp, et un rapport
          PDF d'exemple. Sans carte bancaire. Sans engagement.
        </p>

        {/* Hero stats */}
        <StaggerContainer
          className="hero-stats"
          style={{
            display: "flex",
            gap: "40px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          stagger={0.1}
        >
          <StaggerItem><HeroStat value="7" label="Jours offerts" /></StaggerItem>
          <StaggerItem><HeroStat value="30+" label="Sources média" /></StaggerItem>
          <StaggerItem><HeroStat value="8" label="Moteurs IA" /></StaggerItem>
          <StaggerItem><HeroStat value="0" label="Carte bancaire" /></StaggerItem>
          <StaggerItem><HeroStat value="48h" label="Mise en service" /></StaggerItem>
        </StaggerContainer>
      </Reveal>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: FONT.mono, color: C.sage, lineHeight: 1, letterSpacing: "-0.02em" }}>
        <AnimatedStat value={value} />
      </div>
      <div style={{ fontSize: "11px", color: C.textMuted, fontFamily: FONT.mono, marginTop: "6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — AUDIT FORM (3 STEPS) + WHAT-YOU-GET PREVIEW
// ═══════════════════════════════════════════════════════════════════════

function AuditFormSection() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Synchronous rage-click guard — prevents double-submit when the
  // user clicks the CTA multiple times before the loading state paints.
  const submittingRef = useRef(false);
  const [form, setForm] = useState({
    company: "",
    website: "",
    sector: "",
    competitors: "",
    sources: SOURCES_OPTIONS.filter((s) => s.default).map((s) => s.id),
    name: "",
    role: "",
    email: "",
    whatsapp: "",
    goals: "",
  });

  const updateForm = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSource = (id: string) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.includes(id)
        ? prev.sources.filter((s) => s !== id)
        : [...prev.sources, id],
    }));
  };

  const canProceed = () => {
    if (step === 1) return form.company.trim() !== "" && form.sector !== "";
    if (step === 2) return form.sources.length > 0;
    if (step === 3) return form.name.trim() !== "" && form.email.trim() !== "" && form.whatsapp.trim() !== "";
    return false;
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    // ─── Map audit form → /api/access-request payload ───────────
    // Task FIX-FORMS-1: pack website/sector/competitors/sources into
    // the `message` field (no dedicated columns), goals → useCase,
    // whatsapp → phone, source = "audit-page".
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company.trim() || undefined,
      role: form.role.trim() || undefined,
      phone: form.whatsapp.trim() || undefined,
      country: "Morocco",
      // goals → useCase (the column that represents "what they want
      // to monitor / achieve")
      goals: form.goals.trim() || undefined,
      // Extra audit context — packed into `message` by the API.
      website: form.website.trim() || undefined,
      sector: form.sector || undefined,
      competitors: form.competitors.trim() || undefined,
      sources: form.sources,
      source: "audit-page",
    };

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (res.status === 409) {
        setSubmitError(
          "Une demande est déjà en cours pour cet email, ou un compte existe déjà. Notre équipe vous recontactera."
        );
        return;
      }

      const data = await res.json().catch(() => null);
      setSubmitError(
        (data?.error as string) ||
          "Échec de l'envoi de la demande. Veuillez réessayer."
      );
    } catch {
      setSubmitError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (submitted) {
    return <SuccessState form={form} onReset={() => { setSubmitted(false); setStep(1); }} />;
  }

  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px 40px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div
          className="audit-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.2fr",
            gap: "48px",
            alignItems: "start",
          }}
        >
          {/* Left: What you get */}
          <div>
            <Reveal>
            <Eyebrow color={C.sage}>Ce que vous obtenez</Eyebrow>
            <SectionTitle>Quatre livrables, en 7 jours.</SectionTitle>
            <p style={{ fontSize: "16px", color: C.textSecondary, lineHeight: 1.6, margin: "0 0 40px" }}>
              L'audit n'est pas un pitch commercial. C'est le vrai produit,
              déployé sur votre marque, pendant une semaine. Vous décidez à la fin.
            </p>
            </Reveal>

            <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "16px" }} stagger={0.08}>
              {WHAT_YOU_GET.map((item) => {
                const Icon = getWhatYouGetIcon(item.icon);
                return (
                  <StaggerItem key={item.n}>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      padding: "20px",
                      background: C.surfaceAlt,
                      border: `1px solid ${C.border}`,
                      borderRadius: "8px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = C.sage;
                      e.currentTarget.style.boxShadow = SHADOW.card;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
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
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={22} color={C.sage} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "11px", fontFamily: FONT.mono, fontWeight: 700, color: C.sage, letterSpacing: "0.08em" }}>{item.n}</span>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: C.textPrimary }}>{item.title}</span>
                      </div>
                      <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>{item.desc}</p>
                    </div>
                  </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Timeline */}
            <Reveal delay={0.2}>
            <div
              style={{
                marginTop: "32px",
                padding: "24px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                boxShadow: SHADOW.card,
              }}
            >
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "16px" }}>
                Calendrier
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {TIMELINE.map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: t.color,
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                    <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: t.color, fontWeight: 700, minWidth: "70px" }}>{t.day}</span>
                    <span style={{ fontSize: "13px", color: C.textSecondary }}>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            </Reveal>
          </div>

          {/* Right: 3-step form */}
          <div
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "12px",
              boxShadow: SHADOW.hero,
              overflow: "hidden",
              position: "sticky",
              top: "90px",
            }}
          >
            {/* Progress header */}
            <div
              style={{
                padding: "20px 28px",
                background: C.surfaceAlt,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Demande d'audit gratuit
                </span>
                <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>
                  Étape {step} / 3
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ display: "flex", gap: "6px" }}>
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={s === step ? "audit-progress-active" : undefined}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background: s <= step ? C.sage : C.border,
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
                {["Entreprise", "Sources", "Contact"].map((label, i) => (
                  <span
                    key={label}
                    style={{
                      fontSize: "11px",
                      fontFamily: FONT.mono,
                      color: i + 1 <= step ? C.sage : C.textFaint,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding: "28px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                >
                  {step === 1 && <Step1 form={form} updateForm={updateForm} />}
                  {step === 2 && <Step2 form={form} toggleSource={toggleSource} />}
                  {step === 3 && <Step3 form={form} updateForm={updateForm} />}
                </motion.div>
              </AnimatePresence>

              {/* Submit error banner — only shown on step 3 when the
                  POST to /api/access-request fails (network, 409, 4xx,
                  5xx). Inline so the user can retry without losing
                  the form state. */}
              {step === 3 && submitError && (
                <div
                  role="alert"
                  style={{
                    marginTop: "16px",
                    padding: "12px 14px",
                    background: "rgba(160,82,75,0.06)",
                    border: `1px solid ${C.red}`,
                    borderRadius: "4px",
                    fontSize: "13px",
                    color: C.red,
                    fontFamily: FONT.sans,
                    lineHeight: 1.5,
                  }}
                >
                  {submitError}
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: "flex", gap: "12px", marginTop: "28px", paddingTop: "24px", borderTop: `1px solid ${C.borderLight}` }}>
                {step > 1 && (
                  <motion.button
                    onClick={() => setStep(step - 1)}
                    disabled={submitting}
                    style={{
                      padding: "12px 20px",
                      background: "transparent",
                      color: C.accentDark,
                      fontSize: "14px",
                      fontWeight: 500,
                      border: `1px solid ${C.border}`,
                      borderRadius: "3px",
                      cursor: submitting ? "not-allowed" : "pointer",
                      fontFamily: FONT.sans,
                      transition: "all 0.2s",
                      opacity: submitting ? 0.5 : 1,
                    }}
                    whileHover={submitting ? undefined : { scale: 1.02 }}
                    whileTap={submitting ? undefined : { scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    Retour
                  </motion.button>
                )}
                {step < 3 ? (
                  <motion.button
                    onClick={() => canProceed() && setStep(step + 1)}
                    disabled={!canProceed()}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: canProceed() ? C.sage : C.border,
                      color: canProceed() ? "#FFFFFF" : C.textFaint,
                      fontSize: "14px",
                      fontWeight: 600,
                      border: `1px solid ${canProceed() ? C.sage : C.border}`,
                      borderRadius: "3px",
                      cursor: canProceed() ? "pointer" : "not-allowed",
                      fontFamily: FONT.sans,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    whileHover={canProceed() ? { scale: 1.02 } : undefined}
                    whileTap={canProceed() ? { scale: 0.98 } : undefined}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    Continuer
                    <IconArrow size={14} color={canProceed() ? "#FFFFFF" : C.textFaint} />
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!canProceed() || submitting}
                    style={{
                      flex: 1,
                      padding: "12px 20px",
                      background: canProceed() && !submitting ? C.sage : C.border,
                      color: canProceed() && !submitting ? "#FFFFFF" : C.textFaint,
                      fontSize: "14px",
                      fontWeight: 600,
                      border: `1px solid ${canProceed() && !submitting ? C.sage : C.border}`,
                      borderRadius: "3px",
                      cursor: canProceed() && !submitting ? "pointer" : "not-allowed",
                      fontFamily: FONT.sans,
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                    whileHover={canProceed() && !submitting ? { scale: 1.02 } : undefined}
                    whileTap={canProceed() && !submitting ? { scale: 0.98 } : undefined}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  >
                    {submitting ? "Envoi en cours…" : "Démarrer mon audit gratuit"}
                    {!submitting && (
                      <IconArrow size={14} color={canProceed() ? "#FFFFFF" : C.textFaint} />
                    )}
                  </motion.button>
                )}
              </div>

              {/* Trust line */}
              <div style={{ marginTop: "16px", textAlign: "center", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <IconCheck size={11} color={C.sage} />
                Sans carte bancaire · Sans engagement · Annulable à tout moment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── STEP 1: COMPANY ───────────────────────────────────────────────────

function Step1({ form, updateForm }: { form: typeof INITIAL_FORM; updateForm: (k: string, v: string) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        Parlez-nous de votre entreprise
      </h3>
      <p style={{ fontSize: "13px", color: C.textMuted, margin: "0 0 24px" }}>
        Nous utilisons ces informations pour configurer votre monitoring de marque.
      </p>

      <Field label="Nom de l'entreprise" required>
        <input
          type="text"
          value={form.company}
          onChange={(e) => updateForm("company", e.target.value)}
          placeholder="Bank of Africa"
          style={inputStyle}
        />
      </Field>

      <Field label="Site web">
        <input
          type="text"
          value={form.website}
          onChange={(e) => updateForm("website", e.target.value)}
          placeholder="bankofafrica.ma"
          style={inputStyle}
        />
      </Field>

      <Field label="Secteur" required>
        <select
          value={form.sector}
          onChange={(e) => updateForm("sector", e.target.value)}
          style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: "none" }}
        >
          <option value="">Sélectionnez votre secteur...</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </Field>

      <Field label="Principaux concurrents (optionnel)" hint="Un par ligne — nous les benchmarkerons aussi">
        <textarea
          value={form.competitors}
          onChange={(e) => updateForm("competitors", e.target.value)}
          placeholder={"Attijariwafa Bank\nCIH Bank\nBank of Africa"}
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical", fontFamily: FONT.sans }}
        />
      </Field>
    </div>
  );
}

// ─── STEP 2: SOURCES ───────────────────────────────────────────────────

function Step2({ form, toggleSource }: { form: typeof INITIAL_FORM; toggleSource: (id: string) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        Que devons-nous surveiller ?
      </h3>
      <p style={{ fontSize: "13px", color: C.textMuted, margin: "0 0 24px" }}>
        Sélectionnez les sources que nous devons couvrir. Vous pourrez modifier cela plus tard.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {SOURCES_OPTIONS.map((s) => {
          const checked = form.sources.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleSource(s.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                background: checked ? C.sageBg : C.surface,
                border: `1px solid ${checked ? "rgba(74,123,95,0.3)" : C.border}`,
                borderRadius: "6px",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: `1.5px solid ${checked ? C.sage : C.border}`,
                  background: checked ? C.sage : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {checked && <IconCheck size={12} color="#FFFFFF" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: C.textPrimary }}>{s.label}</div>
                <div style={{ fontSize: "12px", color: C.textMuted, marginTop: "2px" }}>{s.desc}</div>
              </div>
              {s.default && (
                <span
                  style={{
                    fontSize: "9px",
                    fontFamily: FONT.mono,
                    color: C.sage,
                    background: C.sageBg,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    border: "1px solid rgba(74,123,95,0.2)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  Recommandé
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "20px", padding: "14px 16px", background: C.surfaceAlt, border: `1px solid ${C.borderLight}`, borderRadius: "6px", fontSize: "12px", color: C.textSecondary, lineHeight: 1.55 }}>
        <strong style={{ color: C.textPrimary }}>Note :</strong> L'audit gratuit couvre toutes les sources sélectionnées pendant 7 jours. Après l'audit, votre tier détermine combien de sources restent actives.
      </div>
    </div>
  );
}

// ─── STEP 3: CONTACT ───────────────────────────────────────────────────

function Step3({ form, updateForm }: { form: typeof INITIAL_FORM; updateForm: (k: string, v: string) => void }) {
  return (
    <div>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: C.textPrimary, margin: "0 0 6px", letterSpacing: "-0.01em" }}>
        Où devons-nous envoyer les résultats ?
      </h3>
      <p style={{ fontSize: "13px", color: C.textMuted, margin: "0 0 24px" }}>
        Nous configurons votre dashboard et vos digests WhatsApp sous 48 heures.
      </p>

      <Field label="Votre nom" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          placeholder="Yasmine El Fassi"
          style={inputStyle}
        />
      </Field>

      <Field label="Votre fonction">
        <input
          type="text"
          value={form.role}
          onChange={(e) => updateForm("role", e.target.value)}
          placeholder="Directeur de la communication"
          style={inputStyle}
        />
      </Field>

      <Field label="Email professionnel" required>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          placeholder="yasmine@bankofafrica.ma"
          style={inputStyle}
        />
      </Field>

      <Field label="Numéro WhatsApp" required hint="Pour les digests quotidiens — nous ne le partagerons pas">
        <input
          type="tel"
          value={form.whatsapp}
          onChange={(e) => updateForm("whatsapp", e.target.value)}
          placeholder="+212 6 12 34 56 78"
          style={inputStyle}
        />
      </Field>

      <Field label="Que souhaitez-vous apprendre ?" hint="Optionnel — nous aide à adapter l'audit">
        <textarea
          value={form.goals}
          onChange={(e) => updateForm("goals", e.target.value)}
          placeholder="Nous voulons savoir ce que les médias disent de notre lancement produit..."
          style={{ ...inputStyle, minHeight: "70px", resize: "vertical", fontFamily: FONT.sans }}
        />
      </Field>
    </div>
  );
}

const INITIAL_FORM = {
  company: "",
  website: "",
  sector: "",
  competitors: "",
  sources: ["media", "ai"] as string[],
  name: "",
  role: "",
  email: "",
  whatsapp: "",
  goals: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: "14px",
  fontFamily: FONT.sans,
  color: C.textPrimary,
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: "4px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function Field({
  label,
  children,
  required,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          fontFamily: FONT.mono,
          color: C.textSecondary,
          marginBottom: "6px",
          letterSpacing: "0.04em",
          fontWeight: 500,
        }}
      >
        {label}
        {required && <span style={{ color: C.red, marginLeft: "4px" }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: "11px", color: C.textMuted, marginTop: "6px", fontFamily: FONT.mono }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — SUCCESS STATE
// ═══════════════════════════════════════════════════════════════════════

function SuccessState({ form, onReset }: { form: typeof INITIAL_FORM; onReset: () => void }) {
  return (
    <section
      style={{
        position: "relative",
        background: C.bg,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
        minHeight: "70vh",
        overflow: "hidden",
      }}
    >
      {/* POLISH-PUBLIC · sage confetti burst on success mount */}
      <SageConfetti />
      <Reveal style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Success check — spring scale+bounce on mount */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.15 }}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: C.sageBg,
            border: `2px solid ${C.sage}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
          }}
        >
          <IconCheck size={36} color={C.sage} />
        </motion.div>

        <Eyebrow color={C.sage}>Demande d'audit reçue</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: C.textPrimary,
            margin: "0 0 20px",
          }}
        >
          Merci, {form.name.split(" ")[0] || "à vous"}.
          <br />
          <span style={{ color: C.sage }}>Nous nous en occupons.</span>
        </h1>
        <p
          style={{
            fontSize: "17px",
            color: C.textSecondary,
            lineHeight: 1.6,
            maxWidth: "500px",
            margin: "0 auto 40px",
          }}
        >
          Nous avons bien reçu votre demande d'audit pour <strong style={{ color: C.textPrimary }}>{form.company || "votre marque"}</strong>.
          Vous recevrez un email de confirmation à <strong style={{ color: C.textPrimary }}>{form.email || "votre boîte mail"}</strong> dans l'heure qui vient,
          et notre équipe vous contactera sur WhatsApp pour planifier l'appel d'onboarding.
        </p>

        {/* What happens next */}
        <div
          style={{
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            boxShadow: SHADOW.card,
            padding: "28px",
            textAlign: "left",
            marginBottom: "32px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px", textAlign: "center" }}>
            Ce qui se passe ensuite
          </div>
          <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "16px" }} stagger={0.1}>
            <StaggerItem><SuccessStep n="01" label="Sous 1 heure" desc="Email de confirmation + message WhatsApp de notre équipe." /></StaggerItem>
            <StaggerItem><SuccessStep n="02" label="Sous 24 heures" desc="Appel d'onboarding de 30 min pour finaliser les sources et les prompts." /></StaggerItem>
            <StaggerItem><SuccessStep n="03" label="Jour 1" desc="Le monitoring démarre. Votre dashboard est en ligne." /></StaggerItem>
            <StaggerItem><SuccessStep n="04" label="Jour 3" desc="Premier digest WhatsApp livré à 7h00." /></StaggerItem>
            <StaggerItem><SuccessStep n="05" label="Jour 7" desc="Rapport PDF final + appel de debrief de 30 min." /></StaggerItem>
          </StaggerContainer>
        </div>

        {/* Summary card */}
        <div
          style={{
            background: C.surfaceAlt,
            border: `1px solid ${C.border}`,
            borderRadius: "8px",
            padding: "24px",
            textAlign: "left",
            marginBottom: "32px",
          }}
        >
          <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "14px" }}>
            Récapitulatif de votre demande
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "12px" }}>
            <SummaryItem label="Entreprise" value={form.company || "—"} />
            <SummaryItem label="Secteur" value={form.sector || "—"} />
            <SummaryItem label="Contact" value={form.name || "—"} />
            <SummaryItem label="Email" value={form.email || "—"} />
            <SummaryItem label="WhatsApp" value={form.whatsapp || "—"} />
            <SummaryItem label="Sources" value={`${form.sources.length} sélectionnées`} />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <motion.a
            href="https://wa.me/212684440682"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.sageDark)}
            onMouseLeave={(e) => (e.currentTarget.style.background = C.sage)}
          >
            Écrivez-nous sur WhatsApp
            <IconArrow size={14} color="#FFFFFF" />
          </motion.a>
          <motion.a
            href="/atelier"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 24px",
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,93,110,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Retour à l'accueil
          </motion.a>
        </div>
      </Reveal>
    </section>
  );
}

function SuccessStep({ n, label, desc }: { n: string; label: string; desc: string }) {
  return (
    <div style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
      <span
        style={{
          fontSize: "11px",
          fontFamily: FONT.mono,
          fontWeight: 700,
          color: C.sage,
          background: C.sageBg,
          padding: "4px 8px",
          borderRadius: "2px",
          border: "1px solid rgba(74,123,95,0.2)",
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}
      >
        {n}
      </span>
      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: C.textPrimary, marginBottom: "2px" }}>{label}</div>
        <div style={{ fontSize: "12px", color: C.textSecondary, lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "13px", color: C.textPrimary, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — SAMPLE AUDIT DELIVERABLE PREVIEW
// ═══════════════════════════════════════════════════════════════════════

function SampleDeliverable() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Reveal>
        <Eyebrow color={C.sage}>Exemple de livrable</Eyebrow>
        <SectionTitle>Voici à quoi ressemblera votre dashboard.</SectionTitle>
        <SectionSub>
          Un exemple réel issu d'un audit récent (anonymisé). C'est le dashboard
          live auquel vous aurez accès dès le Jour 1.
        </SectionSub>
        </Reveal>

        <Reveal delay={0.1}>
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
              atelier.harchcorp.com / dashboard / audit-sample
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
              ● En direct
            </span>
          </div>

          <div style={{ padding: "28px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Audit gratuit · Jour 3 sur 7
                </div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: C.textPrimary, marginBottom: "4px" }}>
                  [Votre marque] — anonymisé
                </div>
                <div style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.sage }}>
                  ↑ +6,8 pts depuis le Jour 1
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "44px", fontWeight: 700, fontFamily: FONT.mono, color: C.sage, lineHeight: 1, letterSpacing: "-0.03em" }}>
                  74
                </span>
                <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textMuted }}>/ 100</span>
              </div>
            </div>

            <div
              className="sample-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "24px",
              }}
            >
              {/* Left: chart */}
              <div
                style={{
                  padding: "20px",
                  background: C.surfaceAlt,
                  borderRadius: "6px",
                  border: `1px solid ${C.borderLight}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Score de réputation · tendance 7 jours
                  </span>
                  <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.sage, fontWeight: 700 }}>↑ +6,8 pts</span>
                </div>
                <svg width="100%" height="120" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="auditSampleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.sage} stopOpacity="0.25" />
                      <stop offset="100%" stopColor={C.sage} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={buildAreaPath([67, 68, 70, 69, 71, 72, 74], 400, 120, 100)} fill="url(#auditSampleGrad)" />
                  <path d={buildLinePath([67, 68, 70, 69, 71, 72, 74], 400, 120, 100)} fill="none" stroke={C.sage} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {[
                    { x: 0, y: 67, label: "Day 1" },
                    { x: 400, y: 74, label: "Day 7" },
                  ].map((p, i) => (
                    <circle key={i} cx={p.x} cy={120 - (p.y / 100) * 120} r="4" fill={C.sage} />
                  ))}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "8px" }}>
                  <span>Jour 1 · 67</span>
                  <span>Jour 4 · 71</span>
                  <span>Jour 7 · 74</span>
                </div>
              </div>

              {/* Right: KPIs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <SampleKpi label="Mentions" value="342" delta="+18%" color={C.sage} />
                <SampleKpi label="Citations IA" value="9" delta="+3" color={C.accentDark} />
                <SampleKpi label="Alertes" value="2" delta="-1" color={C.red} />
                <SampleKpi label="Sentiment moyen" value="+0,42" delta="+0,08" color={C.sage} />
              </div>
            </div>

            {/* Sentiment split */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                Répartition des sentiments · 7 jours
              </div>
              <div style={{ display: "flex", height: "14px", borderRadius: "7px", overflow: "hidden", marginBottom: "10px", background: C.borderLight }}>
                <div style={{ width: "71%", background: C.sage }} />
                <div style={{ width: "20%", background: C.neutral }} />
                <div style={{ width: "9%", background: C.red }} />
              </div>
              <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", background: C.sage, borderRadius: "2px" }} />
                  <span style={{ color: C.textSecondary }}>Positif</span>
                  <span style={{ fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 700 }}>71%</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", background: C.neutral, borderRadius: "2px" }} />
                  <span style={{ color: C.textSecondary }}>Neutre</span>
                  <span style={{ fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 700 }}>20%</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", background: C.red, borderRadius: "2px" }} />
                  <span style={{ color: C.textSecondary }}>Négatif</span>
                  <span style={{ fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 700 }}>9%</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}

function SampleKpi({ label, value, delta, color }: { label: string; value: string; delta: string; color: string }) {
  return (
    <div
      style={{
        padding: "14px",
        background: C.surfaceAlt,
        borderRadius: "6px",
        border: `1px solid ${C.borderLight}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: FONT.mono, color: C.textPrimary, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      </div>
      <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: color, fontWeight: 700 }}>{delta}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 05 — WHY US / TRUST
// ═══════════════════════════════════════════════════════════════════════

function WhyUs() {
  const reasons = [
    { title: "Sans carte bancaire", desc: "Nous ne demandons aucune information de paiement. L'audit est réellement gratuit." },
    { title: "Le vrai produit, pas une démo", desc: "Vous bénéficiez du même pipeline que les clients payants. Pas de sandbox." },
    { title: "Pas d'appels commerciaux", desc: "Un seul appel d'onboarding pour la configuration. Pas d'upsell, pas de campagne de relance." },
    { title: "Vos données vous appartiennent", desc: "Export CSV à tout moment. Nous ne vous enfermons pas." },
  ];
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 16px",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <Reveal>
        <Eyebrow>Pourquoi notre audit est différent</Eyebrow>
        <SectionTitle>Sans astuce. Sans piège.</SectionTitle>
        <SectionSub>
          Nous connaissons le playbook SaaS — essai gratuit qui exige une carte,
          démo qui masque le vrai produit, appels commerciaux déguisés en
          « onboarding ». Nous faisons l'inverse.
        </SectionSub>
        </Reveal>

        <StaggerContainer
          className="why-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "20px",
          }}
          stagger={0.1}
        >
          {reasons.map((r, i) => (
            <StaggerItem key={i}>
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: "8px",
                padding: "24px",
                boxShadow: SHADOW.card,
                transition: "all 0.25s",
                height: "100%",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.sage;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = SHADOW.cardHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = SHADOW.card;
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  background: C.sageBg,
                  border: "1px solid rgba(74,123,95,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  transition: "all 0.25s",
                }}
              >
                <IconCheck size={18} color={C.sage} />
              </div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: C.textPrimary, margin: "0 0 8px" }}>{r.title}</h3>
              <p style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.55, margin: 0 }}>{r.desc}</p>
            </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
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
        .audit-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        .audit-grid > div:last-child { position: static !important; }
        .sample-grid { grid-template-columns: 1fr !important; }
        .why-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 640px) {
        .why-grid { grid-template-columns: 1fr !important; }
      }

      /* POLISH-PUBLIC · active progress bar segment — sage pulse */
      @keyframes audit-progress-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(74,123,95,0.45); }
        50% { box-shadow: 0 0 0 4px rgba(74,123,95,0); }
      }
      .audit-progress-active {
        animation: audit-progress-pulse 1.8s ease-in-out infinite;
      }

      /* POLISH-PUBLIC · sage confetti fall keyframe for success state */
      @keyframes audit-confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        80% { opacity: 1; }
        100% { transform: translateY(70vh) rotate(720deg); opacity: 0; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function AuditPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero />
        <AuditFormSection />
        <SampleDeliverable />
        <WhyUs />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import { ScrollProgress, CursorGlow, BackToTop } from "../components/shared";

// ═══════════════════════════════════════════════════════════════
// MOTION HELPERS — count-up + scroll-reveal + hover lift (POLISH-PUBLIC)
// ═══════════════════════════════════════════════════════════════

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

function AnimatedStat({
  value,
  style,
}: {
  value: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const match = value.match(/^(\s*)(\d[\d\s]*(?:[.,]\d+)?)(\D.*)?$/);
  const rawNum = match ? match[2].replace(/\s/g, "").replace(",", ".") : "";
  const target = match ? parseFloat(rawNum) : 0;
  const hasThousandSep = match ? /\s/.test(match[2]) : false;
  const isDecimal = match ? /[.,]/.test(match[2]) : false;
  const decimals = isDecimal ? rawNum.split(/[.,]/)[1]?.length ?? 0 : 0;
  const animated = useCountUp(target, 1200, inView && !!match);
  if (!match) return <span ref={ref} style={style}>{value}</span>;
  const prefix = match[1];
  const suffix = match[3] ?? "";
  const formatNum = (n: number): string => {
    if (isDecimal) return n.toFixed(decimals);
    const rounded = Math.round(n).toString();
    if (hasThousandSep) {
      return rounded.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    return rounded;
  };
  return (
    <span ref={ref} style={style}>
      {prefix}
      {formatNum(animated)}
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
  hover = false,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  hover?: boolean;
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
      whileHover={hover ? { y: -2 } : undefined}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const C = {
  bg: "#FAFAFA", surface: "#FFFFFF", surfaceAlt: "#F4F4F5",
  border: "#E5E5E5", borderLight: "#F0F0F0",
  text: "#0A0A0A", textSec: "#525252", textMuted: "#71717A",
  accent: "#4A5D6E", sage: "#4A7B5F", sageBright: "#6FA386",
  red: "#A0524B", amber: "#B87333",
  shadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
};

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch" | "fix";
  title: string;
  changes: { category: string; items: string[] }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "3.1.0",
    date: "August 11, 2026",
    type: "minor",
    title: "UX hardening — persistence, accessibility, system status",
    changes: [
      { category: "Added", items: [
        "SystemStatus indicator dans le footer global — fetch /api/health toutes les 60s, pulsing dot vert/rouge, timestamp fr-FR",
        "Hook usePersistentState<T> — localStorage-backed state pour HarchIQ history (Agency, Pro, Enterprise)",
        "Char counter sur le chat HarchIQ Agency (textarea) — 'N / 2000' avec couleur amber si >1800",
        "Tooltip Recharts sur le gauge RadialBarChart Score de Réputation (Agency)",
        "Bouton Copy sur les résultats du Pitch Deck Generator (Agency)",
      ]},
      { category: "Fixed", items: [
        "HarchIQ Agency Section 13 : <input> single-line → <textarea> auto-grow avec Shift+Enter pour newline (parité restaurée vs Section 1)",
        "Historique des conversations HarchIQ : cap 5/10 → 50, persistance localStorage (survit refresh/switch client) sur Agency, Pro, Enterprise",
        "Pitch Deck Generator : serial-lock supprimé (3 outils en parallèle au lieu de séquentiel)",
        "Pitch Deck Generator : fake empty state 'Pitch deck généré pour prospect [X]' remplacé par un message conditionnel contextuel",
        "Portfolio Clients table (Agency) : keyboard a11y — tabIndex, onKeyDown (Enter/Space), aria-label, focus-visible ring (WCAG 2.1 Level A)",
        "Footer 'Dernière maj' (Agency Score hero) : span non-cliquable → button cliquable qui déclenche handleRefresh",
      ]},
      { category: "Security", items: [
        "AbortSignal.timeout(4s) sur le fetch SystemStatus — empêche les requêtes pendantes",
      ]},
    ],
  },
  {
    version: "3.0.0",
    date: "July 21, 2026",
    type: "major",
    title: "Tier rename — Corporate & Sovereign grade",
    changes: [
      { category: "Changed", items: [
        "Renommage des tiers : Starter / Pro / Enterprise → Émergence / Corporate / Sovereign",
        "Nouvelle grille tarifaire : Émergence 15K · Corporate 40K · Sovereign 75K MAD/mo",
        "Alignement avec les contrats licence (Executive 450K MAD/yr · Sovereign 850K MAD/yr)",
        "Tokens renommés : pricingEmergence / pricingCorporate / pricingSovereign (cosmetic consistency)",
        "Configs backend (lib/config.ts) : IDs aligned avec PricingPage (emergence / corporate / sovereign)",
        "API rate-limit labels : API Corporate (60 req/min) · API Sovereign (600 req/min)",
        "FAQ JSON-LD, AtelierHome pricing section, AuditPage, OurCommitment, LegalPage, ContactPage, Method, ApiMcp, Integrations, ProductsPage, ApiDocs, AskHarchIQ, BroadcastMonitor — all tier references migrated",
        "SME / startup framing repositioned to 'structured mid-cap' / 'corporate group' / 'sovereign entity'",
      ]},
      { category: "Removed", items: [
        "Old pricing tiers Starter (5K) / Pro (15K) / Enterprise (50K) — purged from marketing surfaces",
        "'Designed for SMEs and startups' positioning — replaced with institutional-grade language",
      ]},
    ],
  },
  {
    version: "2.4.0",
    date: "July 19, 2026",
    type: "major",
    title: "Signal AI-style mega-menu + 16 new pages",
    changes: [
      { category: "Added", items: [
        "Mega-menu navigation with 6 top-level items and 41 dropdown links",
        "5 Expertise pages (Enterprise Risk, Reputation Risk, PR & Comms, ESG, Regulation)",
        "5 Insight Report pages (Risk, Reputation Risk, Reputation, Media Impact, Deep Dive)",
        "3 Approach pages (Our AI, Our Data, Our Commitment)",
        "Ask HarchIQ conversational AI chat interface",
        "Insights hub page with 14 resources",
        "Reputation Tracker (sister to Risk Tracker)",
        "Decision Augmentation page (Signal AI whitepaper thesis)",
        "Customers page with 4 case studies",
        "Media Intelligence Report (2026 year-in-review)",
        "Trust Center (security & compliance)",
        "Contact, Careers, Partners, Legal pages",
      ]},
      { category: "Changed", items: [
        "Replaced all GLM-4 mentions with HarchIQ (our branded trainable AI)",
        "Engine lists now: ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok",
        "Nav simplified to 6 items with mega-menu dropdowns",
      ]},
    ],
  },
  {
    version: "2.3.0",
    date: "July 18, 2026",
    type: "major",
    title: "Massive content expansion — News, Blog, Industries, Companies",
    changes: [
      { category: "Added", items: [
        "Charts library: 11 reusable SVG components (BarChart, LineChart, DonutChart, Gauge, Heatmap, Sparkline, RadarChart, StackedBar, StatCard, MetricRow, HorizontalBarChart)",
        "Live News Feed with 36 articles, 5 filters, sticky filter bar",
        "Blog with 15 SEO articles (~21,500 words total)",
        "6 Industry profile pages (Banking, Telecom, Mining, Aviation, Retail, Energy)",
        "5 Company profile pages (OCP, Attijariwafa, Maroc Telecom, RAM, Bank of Africa)",
        "Institutional Audit template (12-page PDF with blur teaser)",
        "Risk Intelligence engine: 32 risk categories, Frequency × Impact × Velocity scoring",
        "Signal AI 500-style Harch 100 with Innovation/Performance/Purpose pillars",
        "Risk Tracker with Industry Risk Dashboard",
      ]},
    ],
  },
  {
    version: "2.2.0",
    date: "July 17, 2026",
    type: "minor",
    title: "Signal AI-style Products + Solutions pages",
    changes: [
      { category: "Added", items: [
        "Products page: 5 products (Platform, API & MCP, Insight Reports, Dashboards, Briefings)",
        "Solutions page: 4 solutions (Narrative Planning, Threat Sensing, Benchmarking, Media Monitoring)",
        "Reputation Dashboards product page with materiality matrix",
        "Enterprise Risk Intelligence product page with risk matrix",
        "API & MCP product page with code examples (Python, TypeScript, cURL, MCP)",
        "Integrations page (12 integrations: Slack, Teams, Tableau, PowerBI, Claude, etc.)",
      ]},
      { category: "Changed", items: [
        "Home page hero: 'Promote. Protect. Shape.' (Signal AI style)",
        "Stats: 5M+ articles/day, 100M+ entities, 120+ languages, 32 risk categories",
      ]},
    ],
  },
  {
    version: "2.1.0",
    date: "July 16, 2026",
    type: "fix",
    title: "Critical SEO + data consistency + accessibility fixes",
    changes: [
      { category: "Fixed", items: [
        "Double-pipe title bug on 42 pages (title: string → title: { absolute })",
        "Canonical URLs missing /atelier/ prefix (5 company pages + 56 sitemap routes)",
        "Cross-page data contradictions (Harch 100 scores, quarterly trends, risk levels)",
        "Fabricated CEO name 'Mohamed El Kettani' → 'Ismail Douiri' (Attijariwafa)",
        "Fabricated digital platforms 'TawbaTam/TikTal' → 'Tijari' (Attijariwafa)",
        "OCP phosphate reserves 31% → 70% (was factually wrong)",
        "Energy page logic error 'second-lowest ahead of retail' → 'lowest behind retail'",
        "Removed fabricated 'Mohammedia refinery fire' (Samir closed since 2015)",
        "Mega-menu keyboard accessibility (aria-expanded, aria-haspopup, onClick, Escape)",
        "Skip-to-content link added (WCAG 2.4.1)",
        "Harch 100 expandable rows keyboard accessible (tabIndex, role, aria-expanded, onKeyDown)",
        "News Feed dates 2025 → 2026, stat cards honest, AR tags fixed",
      ]},
    ],
  },
  {
    version: "2.0.0",
    date: "July 15, 2026",
    type: "major",
    title: "Light theme rebuild — AI Reputation Intelligence",
    changes: [
      { category: "Added", items: [
        "Complete light theme rebuild (#FAFAFA bg, sage #4A7B5F accent)",
        "BrandBadge component: 'HARCH | Atelier' pattern",
        "FR/EN language switcher in nav",
        "Harch 100 ranking (Signal AI 500 style)",
        "Risk Tracker (Industry Risk Dashboard)",
        "PDF templates with blur teaser (free → paid conversion)",
        "WhatsApp daily digest preview",
      ]},
      { category: "Removed", items: [
        "Dark theme (user rejected: 'dégueulasse')",
        "GEO (Generative Engine Optimization) framing — pivoted to AI Reputation Intelligence",
      ]},
    ],
  },
  {
    version: "1.5.0",
    date: "July 12, 2026",
    type: "minor",
    title: "Intelligence Engine v2 — institutional-grade",
    changes: [
      { category: "Added", items: [
        "Entity-level sentiment analysis (FR/AR/EN trilingual, 108+ word lexicon)",
        "Topic clustering (10 categories)",
        "Narrative detection (5 dominant narratives with strength scoring)",
        "Risk assessment (0-100, 5 levels)",
        "Competitor benchmarking",
        "Recommendation engine (prioritized, with timeline and owner)",
        "9-step analysis pipeline (Scrape → Analyze → Score → Rank → Deliver)",
      ]},
    ],
  },
  {
    version: "1.0.0",
    date: "July 8, 2026",
    type: "major",
    title: "Initial launch — Harch Atelier",
    changes: [
      { category: "Added", items: [
        "Initial Next.js 16 + TypeScript + Turbopack setup",
        "30+ Moroccan and African media sources (RSS + Google News aggregation)",
        "Company aliases for 12 Moroccan companies",
        "Google News RSS as primary scraper source (48+ articles per company)",
        "Dashboard with live audit API",
        "Pricing page (Starter 5K / Pro 15K / Enterprise 50K MAD/mois)",
      ]},
    ],
  },
];

const TYPE_COLORS = {
  major: { bg: "rgba(74,123,95,0.1)", text: "#4A7B5F", label: "MAJOR" },
  minor: { bg: "rgba(74,93,110,0.1)", text: "#4A5D6E", label: "MINOR" },
  patch: { bg: "rgba(184,115,51,0.1)", text: "#B87333", label: "PATCH" },
  fix: { bg: "rgba(160,82,75,0.1)", text: "#A0524B", label: "FIX" },
};

const CATEGORY_COLORS = {
  Added: "#4A7B5F",
  Changed: "#4A5D6E",
  Fixed: "#A0524B",
  Removed: "#71717A",
  Deprecated: "#B87333",
};

export default function ChangelogPage() {
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />

      {/* HERO */}
      <section style={{
        background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bg} 100%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "48px 16px 40px",
      }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          <Reveal>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "6px 14px", background: C.surface,
            border: `1px solid ${C.border}`, borderRadius: "100px",
            fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
            color: C.sage, letterSpacing: "0.14em", textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: C.sage, animation: "pulse 2s infinite" }} />
            Changelog · Product updates
          </div>
          </Reveal>

          <Reveal delay={0.05}>
          <h1 style={{
            fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800,
            letterSpacing: "-0.04em", lineHeight: 1.0, color: C.text,
            margin: "0 0 28px",
          }}>
            What's new at <span style={{ color: C.sage }}>Harch Atelier.</span>
          </h1>
          </Reveal>

          <Reveal delay={0.1}>
          <p style={{
            fontSize: "16px", color: C.textSec, lineHeight: 1.55,
            maxWidth: "640px",
          }}>
            Every update to the Harch Atelier platform — new features, improvements, bug fixes, and breaking changes.
            Subscribe to our weekly digest to stay informed.
          </p>
          </Reveal>
        </div>
      </section>

      {/* CHANGELOG ENTRIES */}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 16px" }}>
        <StaggerContainer style={{ display: "flex", flexDirection: "column", gap: "48px" }} stagger={0.1}>
          {CHANGELOG.map((entry, i) => {
            const typeColor = TYPE_COLORS[entry.type];
            return (
              <StaggerItem
                key={entry.version}
                style={{
                  position: "relative",
                  paddingBottom: i === CHANGELOG.length - 1 ? 0 : "48px",
                }}
              >
                {/* Timeline line */}
                {i < CHANGELOG.length - 1 && (
                  <div style={{
                    position: "absolute", left: "19px", top: "40px", bottom: "0",
                    width: "2px", background: C.border,
                  }} />
                )}
                
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: "24px" }}>
                  {/* Timeline dot — pulses when scrolled into view */}
                  <motion.div
                    style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: typeColor.bg, border: `2px solid ${typeColor.text}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px", fontWeight: 800, color: typeColor.text,
                      fontFamily: "'JetBrains Mono', monospace",
                      flexShrink: 0, zIndex: 1,
                    }}
                    initial={{ scale: 0.6, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    ●
                  </motion.div>

                  {/* Entry content */}
                  <div>
                    {/* Header */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      marginBottom: "8px", flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontSize: "24px", fontWeight: 800, color: C.text,
                        fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-0.02em",
                      }}>
                        v{entry.version}
                      </span>
                      <motion.span
                        style={{
                          fontSize: "10px", fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          padding: "3px 10px", borderRadius: "100px",
                          background: typeColor.bg, color: typeColor.text,
                          letterSpacing: "0.08em",
                          cursor: "default",
                        }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        {typeColor.label}
                      </motion.span>
                      <span style={{
                        fontSize: "12px", color: C.textMuted,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                        {entry.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      fontSize: "16px", fontWeight: 700, color: C.text,
                      letterSpacing: "-0.02em", margin: "0 0 20px",
                    }}>
                      {entry.title}
                    </h2>

                    {/* Changes */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {entry.changes.map((change, ci) => {
                        const catColor = CATEGORY_COLORS[change.category as keyof typeof CATEGORY_COLORS] || C.accent;
                        return (
                          <div key={ci}>
                            <div style={{
                              fontSize: "11px", fontFamily: "'JetBrains Mono', monospace",
                              color: catColor, letterSpacing: "0.12em", textTransform: "uppercase",
                              marginBottom: "10px", fontWeight: 700,
                            }}>
                              {change.category}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {change.items.map((item, ii) => (
                                <div key={ii} style={{
                                  display: "flex", gap: "10px",
                                  fontSize: "14px", color: C.textSec, lineHeight: 1.55,
                                }}>
                                  <span style={{ color: catColor, fontWeight: 700, flexShrink: 0 }}>•</span>
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section style={{
        background: C.text, color: "#FFFFFF",
        padding: "48px 16px", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.sageBright, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "16px" }}>
            Stay updated
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#FFFFFF" }}>
            Get the weekly product update.
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", marginBottom: "32px", lineHeight: 1.6 }}>
            Every Friday: new features, improvements, and fixes. Plus early access to beta features.
          </p>
          <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", gap: "8px", maxWidth: "440px", margin: "0 auto", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              style={{
                flex: 1, minWidth: "240px",
                padding: "14px 18px", background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px", color: "#FFFFFF",
                fontSize: "14px", fontFamily: "'Inter', sans-serif", outline: "none",
              }}
            />
            <motion.button
              type="submit"
              style={{
                padding: "14px 24px", background: C.sage, color: "#FFFFFF",
                border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                fontFamily: "'Inter', sans-serif", cursor: "pointer",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              Subscribe →
            </motion.button>
          </form>
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

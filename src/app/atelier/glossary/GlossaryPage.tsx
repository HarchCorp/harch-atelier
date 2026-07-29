"use client";

import React, { useState, useMemo } from "react";
import { AtelierNav } from "../components/AtelierNav";
import { AtelierFooter } from "../components/AtelierFooter";
import {
  ScrollProgress,
  CursorGlow,
  BackToTop,
} from "../components/shared";

// ═══════════════════════════════════════════════════════════════════════
// HARCH ATELIER — REPUTATION INTELLIGENCE GLOSSARY
// 50 terms · 6 categories · SEO long-tail · Light theme
// ═══════════════════════════════════════════════════════════════════════
//
// Sections:
//   01  Hero + stats
//   02  Search bar
//   03  Category filter chips
//   04  Term cards grid (auto-fit minmax 320px)
//   05  CTA — Master reputation intelligence
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #4A5D6E · sage #4A7B5F · red #A0524B · amber #B87333
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
  accent: "#4A5D6E",
  accentBg: "rgba(74,93,110,0.08)",
  sage: "#4A7B5F",
  sageBright: "#6FA386",
  sageDark: "#3D6650",
  sageBg: "rgba(74,123,95,0.08)",
  red: "#A0524B",
  redBg: "rgba(160,82,75,0.08)",
  amber: "#B87333",
  amberBg: "rgba(184,115,51,0.08)",
} as const;

const FONT = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

const SHADOW = {
  card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
  cardHover: "0 2px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06)",
} as const;

// ─── CATEGORIES ───────────────────────────────────────────────────────
type Category =
  | "Reputation"
  | "AI & Search"
  | "PR & Comms"
  | "Risk"
  | "ESG"
  | "Analytics";

const CATEGORY_ORDER: Category[] = [
  "Reputation",
  "AI & Search",
  "PR & Comms",
  "Risk",
  "ESG",
  "Analytics",
];

const CATEGORY_COLOR: Record<Category, { fg: string; bg: string }> = {
  Reputation: { fg: C.accent, bg: C.accentBg },
  "AI & Search": { fg: C.sage, bg: C.sageBg },
  "PR & Comms": { fg: C.amber, bg: C.amberBg },
  Risk: { fg: C.red, bg: C.redBg },
  ESG: { fg: C.sageDark, bg: C.sageBg },
  Analytics: { fg: C.accent, bg: C.accentBg },
};

// ─── DATA: 50 TERMS ───────────────────────────────────────────────────
interface GlossaryTerm {
  name: string;
  category: Category;
  definition: string;
  related?: string[];
}

const TERMS: GlossaryTerm[] = [
  // ── Reputation Intelligence ─────────────────────────────────────────
  {
    name: "Reputation Score",
    category: "Reputation",
    definition:
      "A numerical score (0-100) quantifying a company's reputation based on media sentiment, AI visibility, volume, and authority.",
    related: ["Reputation Tracker", "Brand Health", "Sentiment Analysis"],
  },
  {
    name: "Reputation Risk",
    category: "Reputation",
    definition:
      "The risk of damage to a company's reputation from negative media coverage, social media, or AI engine responses.",
    related: ["Risk Matrix", "Crisis Communication", "Early Warning System"],
  },
  {
    name: "Reputation Tracker",
    category: "Reputation",
    definition:
      "A tool that monitors and displays a company's reputation score over time.",
    related: ["Reputation Score", "Media Monitoring"],
  },
  {
    name: "Share of Voice (SOV)",
    category: "Reputation",
    definition:
      "The percentage of media coverage a company receives relative to its competitors.",
    related: ["Share of Conversation", "Coverage Volume", "Salience"],
  },
  {
    name: "Sentiment Analysis",
    category: "Reputation",
    definition:
      "The process of determining whether media coverage is positive, neutral, or negative.",
    related: ["Entity-Level Sentiment", "Sentiment Shift", "HarchIQ"],
  },
  {
    name: "Entity-Level Sentiment",
    category: "Reputation",
    definition:
      "Sentiment analysis that tracks specific entities (company, CEO, products) within articles.",
    related: ["Sentiment Analysis", "Narrative Detection"],
  },
  {
    name: "Brand Health",
    category: "Reputation",
    definition:
      "The overall state of a brand's reputation, measured by sentiment, coverage volume, and share of voice.",
    related: ["Reputation Score", "Share of Voice (SOV)", "Sentiment Analysis"],
  },
  {
    name: "Narrative Detection",
    category: "Reputation",
    definition:
      "Identifying the dominant stories or themes forming around a brand in media coverage.",
    related: ["Topic Clustering", "Entity-Level Sentiment", "Salience"],
  },

  // ── AI & Search ─────────────────────────────────────────────────────
  {
    name: "AI Visibility",
    category: "AI & Search",
    definition:
      "Whether and how AI engines (ChatGPT, Perplexity, Gemini, Claude) cite a company in their responses.",
    related: ["AI Reputation Index", "GEO", "HarchIQ"],
  },
  {
    name: "AI Reputation Index",
    category: "AI & Search",
    definition:
      "A measure of how AI engines perceive and discuss a company.",
    related: ["AI Visibility", "Reputation Score"],
  },
  {
    name: "Generative Engine Optimization (GEO)",
    category: "AI & Search",
    definition:
      "The practice of optimizing content to appear in AI-generated responses.",
    related: ["AI Visibility", "LLM", "RAG"],
  },
  {
    name: "Large Language Model (LLM)",
    category: "AI & Search",
    definition:
      "AI models like GPT-4, Claude, and Gemini that generate human-like text.",
    related: ["Hallucination", "RAG", "HarchIQ"],
  },
  {
    name: "HarchIQ",
    category: "AI & Search",
    definition:
      "Harch Atelier's trainable AI engine for reputation intelligence.",
    related: ["LLM", "Sentiment Analysis", "AI Visibility"],
  },
  {
    name: "Model Context Protocol (MCP)",
    category: "AI & Search",
    definition:
      "A protocol for connecting AI assistants to external data sources.",
    related: ["RAG", "LLM", "HarchIQ"],
  },
  {
    name: "Hallucination",
    category: "AI & Search",
    definition:
      "When an AI model generates false or fabricated information.",
    related: ["LLM", "RAG"],
  },
  {
    name: "Retrieval-Augmented Generation (RAG)",
    category: "AI & Search",
    definition:
      "AI technique that combines retrieval with generation for accurate responses.",
    related: ["LLM", "Hallucination", "MCP"],
  },

  // ── PR & Communications ─────────────────────────────────────────────
  {
    name: "Crisis Communication",
    category: "PR & Comms",
    definition:
      "Strategic communication during a crisis to protect reputation.",
    related: ["Holding Statement", "Crisis Playbook", "Spokesperson"],
  },
  {
    name: "Holding Statement",
    category: "PR & Comms",
    definition:
      "A preliminary public statement issued during a crisis before full details are known.",
    related: ["Crisis Communication", "Crisis Playbook"],
  },
  {
    name: "Media Monitoring",
    category: "PR & Comms",
    definition:
      "The process of tracking media coverage of a company, industry, or topic.",
    related: ["Coverage Volume", "Source Authority", "Reputation Tracker"],
  },
  {
    name: "Press Release",
    category: "PR & Comms",
    definition:
      "An official statement sent to media to share news.",
    related: ["Earned Media", "Spokesperson"],
  },
  {
    name: "Earned Media",
    category: "PR & Comms",
    definition:
      "Media coverage gained through PR efforts, not paid advertising.",
    related: ["Press Release", "Share of Voice (SOV)"],
  },
  {
    name: "Share of Conversation",
    category: "PR & Comms",
    definition:
      "Similar to SOV but focused on specific topics or narratives.",
    related: ["Share of Voice (SOV)", "Narrative Detection"],
  },
  {
    name: "PR ROI",
    category: "PR & Comms",
    definition:
      "Return on investment for PR activities, measured through reputation impact.",
    related: ["KPI", "Reputation Score", "Earned Media"],
  },
  {
    name: "Spokesperson",
    category: "PR & Comms",
    definition:
      "An individual designated to speak on behalf of a company.",
    related: ["Crisis Communication", "Press Release", "Holding Statement"],
  },

  // ── Risk Management ─────────────────────────────────────────────────
  {
    name: "Risk Matrix",
    category: "Risk",
    definition:
      "A visual tool for assessing risks based on likelihood and impact.",
    related: ["Risk Velocity", "Risk Impact Severity", "Materiality Matrix"],
  },
  {
    name: "Risk Velocity",
    category: "Risk",
    definition:
      "The speed at which a risk is developing or escalating.",
    related: ["Risk Matrix", "Risk Frequency", "Early Warning System"],
  },
  {
    name: "Risk Frequency",
    category: "Risk",
    definition:
      "How often a particular risk event occurs.",
    related: ["Risk Matrix", "Risk Velocity", "Risk Register"],
  },
  {
    name: "Risk Impact Severity",
    category: "Risk",
    definition:
      "The potential consequences of a risk event.",
    related: ["Risk Matrix", "Risk Register"],
  },
  {
    name: "Crisis Playbook",
    category: "Risk",
    definition:
      "A documented set of procedures for responding to crises.",
    related: ["Crisis Communication", "Holding Statement", "Risk Register"],
  },
  {
    name: "Early Warning System",
    category: "Risk",
    definition:
      "A system that detects emerging risks before they escalate.",
    related: ["Anomaly Detection", "Risk Velocity", "Reputation Risk"],
  },
  {
    name: "Risk Register",
    category: "Risk",
    definition:
      "A central repository of all identified risks facing an organization.",
    related: ["Risk Matrix", "Risk Impact Severity", "Risk Frequency"],
  },
  {
    name: "Materiality Matrix",
    category: "Risk",
    definition:
      "A visualization comparing internal priorities vs external impact.",
    related: ["Risk Matrix", "ESG", "Sustainability Reporting"],
  },

  // ── ESG & Compliance ────────────────────────────────────────────────
  {
    name: "ESG (Environmental, Social, Governance)",
    category: "ESG",
    definition:
      "A framework for evaluating corporate sustainability and ethical impact.",
    related: ["Sustainability Reporting", "Greenwashing", "Materiality Matrix"],
  },
  {
    name: "Greenwashing",
    category: "ESG",
    definition:
      "Making misleading claims about environmental benefits.",
    related: ["ESG", "Sustainability Reporting"],
  },
  {
    name: "Sustainability Reporting",
    category: "ESG",
    definition:
      "Disclosing environmental and social performance.",
    related: ["ESG", "Materiality Matrix", "Greenwashing"],
  },
  {
    name: "Loi 09-08",
    category: "ESG",
    definition:
      "Moroccan data protection law (equivalent to GDPR).",
    related: ["GDPR", "CNDP"],
  },
  {
    name: "GDPR",
    category: "ESG",
    definition:
      "EU General Data Protection Regulation.",
    related: ["Loi 09-08", "CNDP"],
  },
  {
    name: "Bank Al-Maghrib (BAM)",
    category: "ESG",
    definition:
      "Morocco's central bank and banking regulator.",
    related: ["AMMC", "ONSSA"],
  },
  {
    name: "AMMC",
    category: "ESG",
    definition:
      "Autorité Marocaine du Marché des Capitaux (Moroccan capital markets authority).",
    related: ["Bank Al-Maghrib (BAM)", "ANRT"],
  },
  {
    name: "ANRT",
    category: "ESG",
    definition:
      "Agence Nationale de Réglementation des Télécommunications (Moroccan telecom regulator).",
    related: ["AMMC", "ONSSA"],
  },
  {
    name: "CNDP",
    category: "ESG",
    definition:
      "Commission Nationale de contrôle de la Protection des Données à caractère Personnel (Moroccan data protection authority).",
    related: ["Loi 09-08", "GDPR"],
  },
  {
    name: "ONSSA",
    category: "ESG",
    definition:
      "Office National de Sécurité Sanitaire des Produits Alimentaires (Moroccan food safety authority).",
    related: ["Bank Al-Maghrib (BAM)", "AMMC"],
  },

  // ── Analytics & Measurement ─────────────────────────────────────────
  {
    name: "KPI (Key Performance Indicator)",
    category: "Analytics",
    definition:
      "A measurable value that indicates performance level.",
    related: ["Benchmark", "PR ROI"],
  },
  {
    name: "Benchmark",
    category: "Analytics",
    definition:
      "A standard or point of reference for comparison.",
    related: ["KPI", "Share of Voice (SOV)"],
  },
  {
    name: "Topic Clustering",
    category: "Analytics",
    definition:
      "Grouping articles by topic for analysis.",
    related: ["Narrative Detection", "Salience"],
  },
  {
    name: "Salience",
    category: "Analytics",
    definition:
      "The prominence or importance of a topic in media coverage.",
    related: ["Topic Clustering", "Share of Voice (SOV)"],
  },
  {
    name: "Source Authority",
    category: "Analytics",
    definition:
      "A score indicating the credibility and reach of a media source.",
    related: ["Media Monitoring", "Coverage Volume"],
  },
  {
    name: "Coverage Volume",
    category: "Analytics",
    definition:
      "The total number of articles mentioning a company or topic.",
    related: ["Media Monitoring", "Share of Voice (SOV)", "Source Authority"],
  },
  {
    name: "Sentiment Shift",
    category: "Analytics",
    definition:
      "A significant change in sentiment over a period.",
    related: ["Sentiment Analysis", "Anomaly Detection"],
  },
  {
    name: "Anomaly Detection",
    category: "Analytics",
    definition:
      "Identifying unusual spikes or patterns in coverage.",
    related: ["Early Warning System", "Sentiment Shift", "Coverage Volume"],
  },
];

// ─── ICONS ────────────────────────────────────────────────────────────
function IconSearch({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconArrow({ size = 18, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconClose({ size = 14, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── EYEBROW ──────────────────────────────────────────────────────────
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
        justifyContent: "center",
      }}
    >
      {children}
      <span style={{ width: "48px", height: "1px", background: `linear-gradient(to right, ${color}, transparent)`, opacity: 0.6 }} aria-hidden />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO + STATS
// ═══════════════════════════════════════════════════════════════════════

function Hero({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
  return (
    <section
      style={{
        position: "relative",
        background: C.bg,
        padding: "80px 32px 64px",
        overflow: "hidden",
      }}
    >
      <div aria-hidden style={{ position: "absolute", top: "-200px", right: "-100px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(74,123,95,0.05), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", bottom: "-150px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(74,93,110,0.05), transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: "960px", margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
        <Eyebrow color={C.sage}>Glossary · 50 terms</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(38px, 5.5vw, 60px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.textPrimary,
            margin: "0 0 24px",
          }}
        >
          The Reputation Intelligence
          <br />
          <span style={{ color: C.sage }}>Glossary.</span>
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: C.textSecondary,
            lineHeight: 1.55,
            maxWidth: "640px",
            margin: "0 auto 40px",
          }}
        >
          50 essential terms across reputation intelligence, AI &amp; search, PR
          communications, risk management, ESG &amp; compliance, and analytics —
          the vocabulary of modern brand reputation.
        </p>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "40px",
          }}
        >
          <StatPill value="50" label="Terms defined" color={C.accent} />
          <StatPill value="6" label="Categories" color={C.sage} />
          <StatPill value="Monthly" label="Updated" color={C.red} />
        </div>

        {/* Search bar */}
        <div style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}>
          <div
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: C.textMuted,
              pointerEvents: "none",
            }}
          >
            <IconSearch size={18} color={C.textMuted} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms — reputation score, GEO, sentiment, BAM..."
            aria-label="Search glossary terms"
            style={{
              width: "100%",
              padding: "16px 48px 16px 50px",
              fontSize: "15px",
              fontFamily: FONT.sans,
              color: C.textPrimary,
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "6px",
              outline: "none",
              boxShadow: SHADOW.card,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = C.sage;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${C.sageBg}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.boxShadow = SHADOW.card;
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.textMuted,
              }}
            >
              <IconClose size={14} color={C.textMuted} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function StatPill({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "8px",
        padding: "10px 18px",
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "4px",
        boxShadow: SHADOW.card,
      }}
    >
      <span style={{ fontFamily: FONT.mono, fontSize: "18px", fontWeight: 600, color }}>{value}</span>
      <span style={{ fontFamily: FONT.sans, fontSize: "12px", color: C.textMuted }}>{label}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 02 — CATEGORY FILTER
// ═══════════════════════════════════════════════════════════════════════

function CategoryFilter({
  active,
  setActive,
  counts,
}: {
  active: string;
  setActive: (c: string) => void;
  counts: Record<string, number>;
}) {
  const chips = ["All", ...CATEGORY_ORDER];
  return (
    <section
      style={{
        background: C.surface,
        padding: "32px 32px 0",
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.borderLight}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        <div
          className="glossary-chips"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {chips.map((cat) => {
            const isActive = active === cat;
            const count = cat === "All" ? TERMS.length : counts[cat] || 0;
            const catColor = cat === "All" ? C.accent : CATEGORY_COLOR[cat as Category].fg;
            return (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  fontSize: "13px",
                  fontFamily: FONT.sans,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#FFFFFF" : C.textSecondary,
                  background: isActive ? catColor : C.surface,
                  border: `1px solid ${isActive ? catColor : C.border}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {cat}
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: FONT.mono,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    background: isActive ? "rgba(255,255,255,0.2)" : C.surfaceAlt,
                    color: isActive ? "#FFFFFF" : C.textMuted,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 03 — TERM CARDS GRID
// ═══════════════════════════════════════════════════════════════════════

function TermCard({ term }: { term: GlossaryTerm }) {
  const catColor = CATEGORY_COLOR[term.category];
  return (
    <article
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: "8px",
        padding: "24px",
        boxShadow: SHADOW.card,
        transition: "box-shadow 0.2s, transform 0.2s, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = SHADOW.cardHover;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = catColor.fg + "55";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOW.card;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = C.border;
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <h3
          style={{
            fontSize: "17px",
            fontFamily: FONT.mono,
            fontWeight: 600,
            color: C.textPrimary,
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {term.name}
        </h3>
        <span
          style={{
            display: "inline-block",
            flexShrink: 0,
            padding: "3px 8px",
            fontSize: "10px",
            fontFamily: FONT.mono,
            fontWeight: 500,
            color: catColor.fg,
            background: catColor.bg,
            borderRadius: "3px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {term.category}
        </span>
      </div>
      <p
        style={{
          fontSize: "14px",
          color: C.textSecondary,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {term.definition}
      </p>
      {term.related && term.related.length > 0 && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: `1px solid ${C.borderLight}`,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.textMuted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Related terms
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {term.related.map((r) => (
              <span
                key={r}
                style={{
                  fontSize: "11px",
                  fontFamily: FONT.sans,
                  color: C.accent,
                  padding: "2px 8px",
                  background: C.accentBg,
                  borderRadius: "3px",
                  border: `1px solid ${C.borderLight}`,
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function TermGrid({ terms }: { terms: GlossaryTerm[] }) {
  return (
    <section style={{ background: C.bg, padding: "48px 32px 80px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 16px" }}>
        {terms.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "14px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "8px" }}>
              No terms match your search.
            </div>
            <div style={{ fontSize: "13px", color: C.textSecondary }}>
              Try a different keyword, or browse all 50 terms.
            </div>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div style={{ fontSize: "13px", color: C.textMuted, fontFamily: FONT.mono }}>
                Showing <span style={{ color: C.textPrimary, fontWeight: 600 }}>{terms.length}</span> of {TERMS.length} terms
              </div>
              <div style={{ fontSize: "12px", color: C.textFaint, fontFamily: FONT.mono }}>
                Alphabetical by category
              </div>
            </div>
            <div
              className="glossary-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "16px",
              }}
            >
              {terms.map((t) => (
                <TermCard key={t.name} term={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — CTA
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
          padding: "56px 48px",
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: "12px",
          boxShadow: SHADOW.card,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(74,123,95,0.06), transparent 70%)", borderRadius: "50%" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Eyebrow color={C.sage}>Put it into practice</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(26px, 4vw, 38px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              color: C.textPrimary,
              margin: "0 0 16px",
            }}
          >
            Master reputation intelligence.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "560px",
              margin: "0 auto 32px",
            }}
          >
            These 50 terms define the vocabulary of modern brand reputation.
            Start tracking how media and AI engines talk about your company —
            with a free 7-day audit from Harch Atelier.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/audit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
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
              Get a free 7-day audit
              <IconArrow size={16} color="#FFFFFF" />
            </a>
            <a
              href="/method"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                background: "transparent",
                color: C.accent,
                fontSize: "15px",
                fontWeight: 500,
                textDecoration: "none",
                borderRadius: "3px",
                border: `1px solid ${C.accent}`,
                cursor: "pointer",
                fontFamily: FONT.sans,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.accentBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              See our method
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
      @media (max-width: 640px) {
        .glossary-chips { justify-content: flex-start !important; overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 8px; }
        .glossary-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Counts per category
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    TERMS.forEach((t) => {
      c[t.category] = (c[t.category] || 0) + 1;
    });
    return c;
  }, []);

  // Filtered + sorted terms
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const out = TERMS.filter((t) => {
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      if (!matchesCategory) return false;
      if (q === "") return true;
      // Search in name, definition, and related terms
      const inName = t.name.toLowerCase().includes(q);
      const inDef = t.definition.toLowerCase().includes(q);
      const inRelated = (t.related || []).some((r) => r.toLowerCase().includes(q));
      const inCat = t.category.toLowerCase().includes(q);
      return inName || inDef || inRelated || inCat;
    });
    // Sort: alphabetical by name within category order
    const catIndex = (cat: Category) => CATEGORY_ORDER.indexOf(cat);
    out.sort((a, b) => {
      const ci = catIndex(a.category) - catIndex(b.category);
      if (ci !== 0) return ci;
      return a.name.localeCompare(b.name);
    });
    return out;
  }, [search, activeCategory]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero search={search} setSearch={setSearch} />
        <CategoryFilter active={activeCategory} setActive={setActiveCategory} counts={counts} />
        <TermGrid terms={filtered} />
        <CTA />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

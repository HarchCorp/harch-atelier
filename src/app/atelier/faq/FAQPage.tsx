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
// HARCH ATELIER — FAQ PAGE
// Light theme · Inter + JetBrains Mono · SVG charts · No images
// ═══════════════════════════════════════════════════════════════════════
//
// Product: AI Reputation Intelligence — 12 questions, search filter,
// inline mini-charts in answers.
//
// Palette (LOCKED — light):
//   bg #FAFAFA · surface #FFFFFF · surfaceAlt #F4F4F5 · border #E5E5E5
//   text #0A0A0A · secondary #525252 · muted #71717A
//   accent #8B9DAF · accentDark #4A5D6E
//   sage #4A7B5F · sageBright #6FA386 · red #A0524B
//
// Sections:
//   01  Hero + search
//   02  Category filter chips
//   03  FAQ list (12 questions, collapsible, with inline mini-charts)
//   04  Still have questions CTA
//   05  Footer
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

// ─── DATA: 12 QUESTIONS ────────────────────────────────────────────────

type FAQ = {
  id: number;
  category: "Produit" | "Méthode" | "Pricing" | "Technique" | "Livraison";
  q: string;
  a: React.ReactNode;
};

const FAQS: FAQ[] = [
  {
    id: 1,
    category: "Produit",
    q: "What is AI Reputation Intelligence?",
    a: (
      <AnswerBody
        intro="AI Reputation Intelligence is the practice of monitoring what media and AI engines say about your brand, analyzing the sentiment of every mention, and acting on the insights before they become a crisis."
        chart={<ChartSentimentSplit />}
        bullets={[
          "Monitoring: 30+ media sources + 8 AI engines (ChatGPT, Perplexity, Gemini, Claude...)",
          "Analysis: sentiment classification (positive / neutral / negative) per entity, topic, and source",
          "Delivery: WhatsApp digest, live dashboard, monthly PDF report",
        ]}
        note="Unlike traditional press clipping, we track AI engines — because your customers now ask ChatGPT before they Google."
      />
    ),
  },
  {
    id: 2,
    category: "Produit",
    q: "How is this different from social listening?",
    a: (
      <AnswerBody
        intro="Social listening (Meltwater, Brandwatch, Talkwalker) tracks Twitter, Facebook, forums. We track media articles and AI engine responses — two channels social tools ignore."
        chart={<ChartChannelCompare />}
        bullets={[
          "Social listening → Twitter, Facebook, forums, blogs",
          "AI Reputation → media articles + ChatGPT / Perplexity / Gemini responses",
          "We complement your social tool, we don't replace it",
        ]}
        note="If a customer asks ChatGPT ' Quelle est la meilleure banque au Maroc ?', the answer shapes their decision. Social listening won't catch that."
      />
    ),
  },
  {
    id: 3,
    category: "Méthode",
    q: "How do you measure sentiment?",
    a: (
      <AnswerBody
        intro="Every mention goes through HarchIQ sentiment classification. The model assigns a score from -1 (very negative) to +1 (very positive), with a confidence interval."
        chart={<ChartSentimentScale />}
        bullets={[
          "Score -1.0 to -0.3: negative (red zone, triggers alert if < -0.5)",
          "Score -0.3 to +0.3: neutral (informational)",
          "Score +0.3 to +1.0: positive (green zone)",
          "Confidence < 70%: flagged for human review",
        ]}
        note="We handle French, Arabic, and English natively. Darija and code-switching are detected but flagged for review."
      />
    ),
  },
  {
    id: 4,
    category: "Méthode",
    q: "Which media sources do you cover?",
    a: (
      <AnswerBody
        intro="30+ Moroccan and African media sources, plus the major francophone press. We add sources on request for Enterprise clients."
        chart={<ChartSourceCoverage />}
        bullets={[
          "Morocco: Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui, Le Desk, ChallengeMA...",
          "Africa: Jeune Afrique, RFI Afrique, Africa News, Financial Afrik...",
          "Francophone: Le Monde Afrique, Le Figaro, Liberation (mentions of your brand)",
        ]}
        note="Full list available on the method page. We crawl every 60 seconds for Pro and Enterprise, every 5 minutes for Starter."
      />
    ),
  },
  {
    id: 5,
    category: "Méthode",
    q: "How fast are crisis alerts?",
    a: (
      <AnswerBody
        intro="Pro and Enterprise tiers get crisis alerts in under 5 minutes from publication. The full pipeline: detection (2min) → NLP (1min) → sentiment classification (1min) → WhatsApp delivery (1min)."
        chart={<ChartAlertLatency />}
        bullets={[
          "Starter: alerte under 1 hour",
          "Pro: alerte under 5 minutes",
          "Enterprise: alerte under 5 minutes + comms playbook",
          "Triggers: sentiment < -0.5 on tracked entity, or volume spike > 200%",
        ]}
        note="We deliver to WhatsApp because that's where you already are at 7am. No app to open, no email to refresh."
      />
    ),
  },
  {
    id: 6,
    category: "Pricing",
    q: "Why bank transfer and not credit card?",
    a: (
      <AnswerBody
        intro="Two reasons. First, most of our clients are Moroccan and African companies where bank transfer is the standard B2B payment. Second, it keeps our costs down — no Stripe fees, no chargeback risk — and we pass the savings to you."
        chart={<ChartPricingCompare />}
        bullets={[
          "Virement bancaire en MAD ou EUR",
          "Facture mensuelle, payable sous 30 jours",
          "Aucun engagement de durée (Starter et Pro)",
          "Enterprise: contrat annuel, SLA 99.9%",
        ]}
        note="We can also accept Wise, PayPal, or crypto for international clients — ask us."
      />
    ),
  },
  {
    id: 7,
    category: "Pricing",
    q: "Can I cancel anytime?",
    a: (
      <AnswerBody
        intro="Yes. Starter and Pro are monthly with no commitment. You cancel with one email, effective at the end of the current month. No penalty, no clawback."
        chart={<ChartCancellationFlow />}
        bullets={[
          "Starter / Pro: cancel anytime, effective end of month",
          "Enterprise: 90 days notice for annual contracts",
          "You keep dashboard access until the end of the paid period",
          "All your historical data is exported to CSV on request",
        ]}
        note="We don't believe in lock-in. If we're not delivering value, you should leave."
      />
    ),
  },
  {
    id: 8,
    category: "Technique",
    q: "What AI models do you use?",
    a: (
      <AnswerBody
        intro="We use a combination of open-source NLP and frontier LLMs. The pipeline is modular — we can swap models as better ones become available."
        chart={<ChartModelStack />}
        bullets={[
          "NER (entity extraction): spaCy + custom Moroccan entity library",
          "Sentiment classification: HarchIQ (multilingual, handles FR/AR/EN)",
          "Topic modeling: BERTopic (clusters articles into themes)",
          "Language detection: fastText (handles Darija and code-switching)",
        ]}
        note="We don't depend on a single model provider. If OpenAI raises prices or degrades quality, we switch."
      />
    ),
  },
  {
    id: 9,
    category: "Technique",
    q: "Do you track what ChatGPT says about me?",
    a: (
      <AnswerBody
        intro="Yes. We query 8 AI engines every hour with the prompts your customers actually use — and track how your brand appears in the responses."
        chart={<ChartAIEngines />}
        bullets={[
          "8 engines: ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Copilot, Mistral, Grok",
          "Prompts: we work with you to define the 20-50 prompts that matter for your sector",
          "We track: mention presence, position (1st / 2nd / not mentioned), sentiment, competitors cited",
          "Hourly refresh, daily digest",
        ]}
        note="This is what makes us different from social listening. AI engines are the new search — and your customers use them daily."
      />
    ),
  },
  {
    id: 10,
    category: "Livraison",
    q: "What does the daily WhatsApp digest look like?",
    a: (
      <AnswerBody
        intro="A structured message, every morning at 7:00 (Casa time). Designed to be read in 30 seconds on your phone — score, mentions, top topics, alerts."
        chart={<ChartWhatsAppDigest />}
        bullets={[
          "Header: brand + date + reputation score + delta",
          "Mentions: count + % change vs yesterday",
          "Top topics: 3-5 themes, color-coded by sentiment",
          "Alerts: any crisis alert from the last 24h",
          "Reply: text a question, get an instant AI answer",
        ]}
        note="You can forward it to your comms team, your CEO, or your board in one tap. No login, no app."
      />
    ),
  },
  {
    id: 11,
    category: "Livraison",
    q: "What's in the monthly PDF report?",
    a: (
      <AnswerBody
        intro="A 32-page board-ready document. Cover, executive summary, reputation score evolution, sentiment breakdown, top risks, competitor benchmark, recommended actions."
        chart={<ChartPDFStructure />}
        bullets={[
          "Pages 1-2: Cover + executive summary (1-page read for the CEO)",
          "Pages 3-8: Reputation score evolution (30 / 90 / 365 days)",
          "Pages 9-16: Sentiment breakdown by source, topic, entity",
          "Pages 17-24: Top risks + crisis review",
          "Pages 25-28: Competitor benchmark (3 competitors)",
          "Pages 29-32: Recommended actions + appendix",
        ]}
        note="Starter tier gets an 8-page version. Enterprise gets an additional quarterly report."
      />
    ),
  },
  {
    id: 12,
    category: "Produit",
    q: "I'm a startup / SME — is this for me?",
    a: (
      <AnswerBody
        intro="Yes. Starter tier (5,000 MAD/month) is designed for SMEs and startups. You get the same pipeline as the big groups, just with fewer sources and brands."
        chart={<ChartTierFit />}
        bullets={[
          "SME / startup: Starter (5K MAD) — 1 brand, 10 sources, 3 AI engines",
          "Mid-size company: Pro (15K MAD) — 3 brands, 30+ sources, 8 AI engines",
          "Large group / multi-country: Enterprise (50K MAD) — unlimited brands, custom taxonomy",
          "Free 7-day audit available for any tier — try before you buy",
        ]}
        note="70% of our clients start on Starter and upgrade within 3 months once they see the value."
      />
    ),
  },
];

const CATEGORIES = ["All", "Produit", "Méthode", "Pricing", "Technique", "Livraison"] as const;

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

function IconArrow({ size = 20, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconSearch({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─── ANSWER BODY (reusable layout with chart + bullets + note) ──────────

function AnswerBody({
  intro,
  chart,
  bullets,
  note,
}: {
  intro: string;
  chart: React.ReactNode;
  bullets: string[];
  note: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <p style={{ fontSize: "15px", color: C.textSecondary, lineHeight: 1.65, margin: 0 }}>{intro}</p>

      <div
        style={{
          background: C.surfaceAlt,
          border: `1px solid ${C.borderLight}`,
          borderRadius: "6px",
          padding: "16px",
        }}
      >
        <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "12px" }}>
          Data preview
        </div>
        {chart}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                background: C.sage,
                marginTop: "9px",
                flexShrink: 0,
              }}
              aria-hidden
            />
            <span style={{ fontSize: "14px", color: C.textPrimary, lineHeight: 1.55 }}>{b}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "14px 16px",
          background: C.sageBg,
          border: `1px solid rgba(74,123,95,0.2)`,
          borderRadius: "6px",
          fontSize: "13px",
          color: C.textPrimary,
          lineHeight: 1.55,
          fontStyle: "italic",
        }}
      >
        {note}
      </div>
    </div>
  );
}

// ─── INLINE MINI CHARTS (one per question) ─────────────────────────────

function ChartSentimentSplit() {
  return (
    <div>
      <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", marginBottom: "10px", background: C.borderLight }}>
        <div style={{ width: "68%", background: C.sage }} />
        <div style={{ width: "22%", background: C.neutral }} />
        <div style={{ width: "10%", background: C.red }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: FONT.mono }}>
        <span style={{ color: C.sage }}>Positive · 68%</span>
        <span style={{ color: C.neutral }}>Neutral · 22%</span>
        <span style={{ color: C.red }}>Negative · 10%</span>
      </div>
    </div>
  );
}

function ChartChannelCompare() {
  const rows = [
    { label: "Social listening", media: 20, ai: 0, social: 100 },
    { label: "Press clipping", media: 100, ai: 0, social: 10 },
    { label: "Harch Atelier", media: 100, ai: 100, social: 30 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {rows.map((r) => (
        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: C.textSecondary, minWidth: "110px" }}>{r.label}</span>
          <div style={{ flex: 1, display: "flex", gap: "3px" }}>
            <div style={{ width: `${r.media}%`, height: "10px", background: C.sage, borderRadius: "2px" }} title="Media" />
            <div style={{ width: `${r.ai}%`, height: "10px", background: C.accentDark, borderRadius: "2px" }} title="AI" />
            <div style={{ width: `${r.social / 4}%`, height: "10px", background: C.neutral, borderRadius: "2px" }} title="Social" />
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: "16px", fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", background: C.sage, borderRadius: "2px" }} />Media</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", background: C.accentDark, borderRadius: "2px" }} />AI engines</span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><span style={{ width: "8px", height: "8px", background: C.neutral, borderRadius: "2px" }} />Social</span>
      </div>
    </div>
  );
}

function ChartSentimentScale() {
  return (
    <div>
      <div style={{ position: "relative", height: "24px", marginBottom: "8px" }}>
        <div style={{ display: "flex", height: "100%", borderRadius: "4px", overflow: "hidden" }}>
          <div style={{ flex: 3, background: C.red }} />
          <div style={{ flex: 6, background: C.neutral }} />
          <div style={{ flex: 3, background: C.sage }} />
        </div>
        <div style={{ position: "absolute", left: "30%", top: 0, bottom: 0, width: "1px", background: C.textPrimary }} />
        <div style={{ position: "absolute", left: "70%", top: 0, bottom: 0, width: "1px", background: C.textPrimary }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>
        <span style={{ color: C.red }}>-1.0</span>
        <span>-0.3</span>
        <span>+0.3</span>
        <span style={{ color: C.sage }}>+1.0</span>
      </div>
      <div style={{ marginTop: "10px", fontSize: "11px", fontFamily: FONT.mono, color: C.red }}>
        ● Alert threshold: sentiment &lt; -0.5
      </div>
    </div>
  );
}

function ChartSourceCoverage() {
  const sources = [
    { region: "Maroc", count: 18, share: 100 },
    { region: "Afrique", count: 8, share: 60 },
    { region: "Francophone", count: 6, share: 45 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sources.map((s) => (
        <div key={s.region} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "12px", color: C.textPrimary, minWidth: "100px", fontWeight: 600 }}>{s.region}</span>
          <div style={{ flex: 1, height: "10px", background: C.surface, borderRadius: "2px", overflow: "hidden", border: `1px solid ${C.borderLight}` }}>
            <div style={{ width: `${s.share}%`, height: "100%", background: C.sage }} />
          </div>
          <span style={{ fontSize: "12px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 700, minWidth: "30px", textAlign: "right" }}>{s.count}</span>
        </div>
      ))}
      <div style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px" }}>
        Total: 32 sources · refresh every 60s
      </div>
    </div>
  );
}

function ChartAlertLatency() {
  const stages = [
    { label: "Detection", time: "2min", color: C.accent },
    { label: "NLP", time: "1min", color: C.accentDark },
    { label: "Classification", time: "1min", color: C.accentDark },
    { label: "WhatsApp", time: "1min", color: C.sage },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "10px" }}>
        {stages.map((s) => (
          <div key={s.label} style={{ flex: 1, padding: "10px 6px", background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: "4px", textAlign: "center" }}>
            <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" }}>{s.label}</div>
            <div style={{ fontSize: "13px", fontFamily: FONT.mono, fontWeight: 700, color: s.color }}>{s.time}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: C.sageBg, border: `1px solid rgba(74,123,95,0.2)`, borderRadius: "4px" }}>
        <span style={{ fontSize: "12px", color: C.textSecondary }}>Total latency</span>
        <span style={{ fontSize: "14px", fontFamily: FONT.mono, fontWeight: 700, color: C.sage }}>&lt; 5 min</span>
      </div>
    </div>
  );
}

function ChartPricingCompare() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {[
        { method: "Virement bancaire", fee: "0%", note: "Standard B2B", highlight: true },
        { method: "Stripe (card)", fee: "2.9%", note: "+ 3 MAD fixed" },
        { method: "PayPal", fee: "4.4%", note: "+ fixed fee" },
      ].map((m) => (
        <div
          key={m.method}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 12px",
            background: m.highlight ? C.sageBg : C.surface,
            border: `1px solid ${m.highlight ? "rgba(74,123,95,0.2)" : C.borderLight}`,
            borderRadius: "4px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", fontWeight: 600, color: C.textPrimary }}>{m.method}</div>
            <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>{m.note}</div>
          </div>
          <span style={{ fontSize: "14px", fontFamily: FONT.mono, fontWeight: 700, color: m.highlight ? C.sage : C.textMuted }}>{m.fee}</span>
        </div>
      ))}
    </div>
  );
}

function ChartCancellationFlow() {
  const steps = ["Email cancel", "Confirm", "End of month", "Data export"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ padding: "8px 10px", background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: "4px", fontSize: "11px", fontFamily: FONT.mono, color: C.textSecondary, textAlign: "center", flex: 1 }}>
              {s}
            </div>
            {i < steps.length - 1 && <span style={{ color: C.textFaint, fontSize: "10px" }}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <div style={{ padding: "10px 14px", background: C.sageBg, border: `1px solid rgba(74,123,95,0.2)`, borderRadius: "4px", fontSize: "12px", color: C.textSecondary }}>
        No penalty · No clawback · Access until end of paid period
      </div>
    </div>
  );
}

function ChartModelStack() {
  const models = [
    { name: "spaCy + custom", role: "NER", color: C.accent },
    { name: "HarchIQ", role: "Sentiment", color: C.sage },
    { name: "BERTopic", role: "Topics", color: C.accentDark },
    { name: "fastText", role: "Language", color: C.red },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
      {models.map((m) => (
        <div key={m.name} style={{ padding: "10px", background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: "4px", borderLeft: `3px solid ${m.color}` }}>
          <div style={{ fontSize: "9px", fontFamily: FONT.mono, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{m.role}</div>
          <div style={{ fontSize: "13px", fontWeight: 700, fontFamily: FONT.mono, color: m.color }}>{m.name}</div>
        </div>
      ))}
    </div>
  );
}

function ChartAIEngines() {
  const engines = [
    { name: "ChatGPT", share: 68 },
    { name: "Perplexity", share: 14 },
    { name: "Gemini", share: 5 },
    { name: "Claude", share: 2 },
    { name: "Others", share: 11 },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {engines.map((e) => (
        <div key={e.name} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: C.textSecondary, minWidth: "80px" }}>{e.name}</span>
          <div style={{ flex: 1, height: "8px", background: C.surface, borderRadius: "2px", overflow: "hidden", border: `1px solid ${C.borderLight}` }}>
            <div style={{ width: `${e.share}%`, height: "100%", background: e.share >= 10 ? C.sage : C.accentDark }} />
          </div>
          <span style={{ fontSize: "11px", fontFamily: FONT.mono, color: C.textPrimary, fontWeight: 600, minWidth: "30px", textAlign: "right" }}>{e.share}%</span>
        </div>
      ))}
    </div>
  );
}

function ChartWhatsAppDigest() {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: "6px", padding: "12px", fontFamily: FONT.mono, fontSize: "11px", color: C.textSecondary, lineHeight: 1.7 }}>
      <div style={{ color: C.sage, fontWeight: 700, marginBottom: "6px" }}>Harch Atelier · 7:00</div>
      <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: "12px" }}>Bank of Africa · 13 mars</div>
      <div>Score: <span style={{ color: C.sage, fontWeight: 700 }}>78/100</span> ↑ +4.2</div>
      <div>Mentions: 247 · AI: 14</div>
      <div style={{ marginTop: "6px", color: C.red }}>● 1 alerte crise</div>
    </div>
  );
}

function ChartPDFStructure() {
  const sections = [
    { label: "Cover + Exec", pages: "1-2", color: C.sage, width: "6%" },
    { label: "Score evolution", pages: "3-8", color: C.accentDark, width: "19%" },
    { label: "Sentiment", pages: "9-16", color: C.sage, width: "25%" },
    { label: "Top risks", pages: "17-24", color: C.red, width: "25%" },
    { label: "Competitors", pages: "25-28", color: C.accentDark, width: "12%" },
    { label: "Actions", pages: "29-32", color: C.sage, width: "13%" },
  ];
  return (
    <div>
      <div style={{ display: "flex", height: "20px", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
        {sections.map((s) => (
          <div key={s.label} style={{ width: s.width, background: s.color }} title={`${s.label} (p.${s.pages})`} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted }}>
        {sections.map((s) => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: "8px", height: "8px", background: s.color, borderRadius: "2px" }} />
            {s.label} <span style={{ color: C.textFaint }}>(p.{s.pages})</span>
          </span>
        ))}
      </div>
      <div style={{ marginTop: "8px", fontSize: "11px", fontFamily: FONT.mono, color: C.textMuted }}>
        Total: 32 pages · board-ready · PDF + print
      </div>
    </div>
  );
}

function ChartTierFit() {
  const tiers = [
    { name: "Starter", price: "5K", fit: "SME / startup", color: C.sage, width: "33%" },
    { name: "Pro", price: "15K", fit: "Mid-size", color: C.accentDark, width: "33%" },
    { name: "Enterprise", price: "50K", fit: "Large group", color: C.red, width: "34%" },
  ];
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {tiers.map((t) => (
        <div key={t.name} style={{ flex: 1, padding: "12px", background: C.surface, border: `1px solid ${C.borderLight}`, borderRadius: "4px", borderLeft: `3px solid ${t.color}` }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: C.textPrimary }}>{t.name}</div>
          <div style={{ fontSize: "16px", fontFamily: FONT.mono, fontWeight: 700, color: t.color, marginTop: "4px" }}>{t.price}</div>
          <div style={{ fontSize: "10px", fontFamily: FONT.mono, color: C.textMuted, marginTop: "4px" }}>{t.fit}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 01 — HERO + SEARCH
// ═══════════════════════════════════════════════════════════════════════

function Hero({ search, setSearch }: { search: string; setSearch: (v: string) => void }) {
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

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
        <Eyebrow color={C.sage}>FAQ · 12 questions</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(40px, 5.5vw, 60px)",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            lineHeight: 1.05,
            color: C.textPrimary,
            margin: "0 0 24px",
          }}
        >
          Twelve questions about
          <br />
          <span style={{ color: C.sage }}>AI reputation monitoring.</span>
        </h1>
        <p
          style={{
            fontSize: "19px",
            color: C.textSecondary,
            lineHeight: 1.55,
            maxWidth: "620px",
            margin: "0 auto 40px",
          }}
        >
          Search, filter by category, or browse. Each answer includes a
          mini-chart with real data.
        </p>

        {/* Search bar */}
        <div
          style={{
            position: "relative",
            maxWidth: "640px",
            margin: "0 auto",
          }}
        >
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
            placeholder="Search questions — sentiment, pricing, ChatGPT, alerts..."
            style={{
              width: "100%",
              padding: "16px 20px 16px 50px",
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
          />
        </div>
      </div>
    </section>
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
  return (
    <section
      style={{
        background: C.surface,
        padding: "32px 32px 0",
        borderTop: `1px solid ${C.border}`,
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          className="faq-chips"
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = active === cat;
            const count = cat === "All" ? FAQS.length : counts[cat] || 0;
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
                  background: isActive ? C.sage : C.surface,
                  border: `1px solid ${isActive ? C.sage : C.border}`,
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
// SECTION 03 — FAQ LIST
// ═══════════════════════════════════════════════════════════════════════

function FAQList({ faqs, openId, setOpenId }: { faqs: FAQ[]; openId: number | null; setOpenId: (id: number | null) => void }) {
  return (
    <section
      style={{
        background: C.surface,
        padding: "48px 32px 80px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {faqs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: C.surfaceAlt,
              border: `1px solid ${C.border}`,
              borderRadius: "8px",
            }}
          >
            <div style={{ fontSize: "14px", color: C.textMuted, fontFamily: FONT.mono, marginBottom: "8px" }}>
              No questions match your search.
            </div>
            <div style={{ fontSize: "13px", color: C.textSecondary }}>
              Try a different keyword, or browse all 12 questions.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq) => (
              <FAQItem key={faq.id} faq={faq} open={openId === faq.id} onToggle={() => setOpenId(openId === faq.id ? null : faq.id)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FAQItem({ faq, open, onToggle }: { faq: FAQ; open: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${open ? C.sage : C.border}`,
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: open ? SHADOW.cardHover : SHADOW.card,
        transition: "all 0.25s",
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          padding: "20px 24px",
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
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
          <span
            style={{
              fontSize: "11px",
              fontFamily: FONT.mono,
              fontWeight: 700,
              color: C.textMuted,
              minWidth: "32px",
              letterSpacing: "0.04em",
            }}
          >
            {String(faq.id).padStart(2, "0")}
          </span>
          <span
            style={{
              fontSize: "10px",
              fontFamily: FONT.mono,
              color: C.sage,
              background: C.sageBg,
              padding: "3px 8px",
              borderRadius: "2px",
              border: "1px solid rgba(74,123,95,0.2)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {faq.category}
          </span>
          <span style={{ fontSize: "16px", fontWeight: 600, color: C.textPrimary, letterSpacing: "-0.01em" }}>{faq.q}</span>
        </div>
        <span
          style={{
            fontSize: "24px",
            color: open ? C.sage : C.textMuted,
            flexShrink: 0,
            transition: "transform 0.2s",
            transform: open ? "rotate(45deg)" : "rotate(0deg)",
            lineHeight: 1,
          }}
        >
          +
        </span>
      </button>
      {open && (
        <div style={{ padding: "0 24px 24px 70px" }}>
          {faq.a}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION 04 — STILL HAVE QUESTIONS CTA
// ═══════════════════════════════════════════════════════════════════════

function StillHaveQuestions() {
  return (
    <section
      style={{
        background: C.surfaceAlt,
        padding: "80px 32px",
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
          <Eyebrow color={C.sage}>Still have questions?</Eyebrow>
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
            Talk to a human.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: C.textSecondary,
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto 32px",
            }}
          >
            We reply within 24 hours on WhatsApp or email. No sales pitch —
            we'll answer your specific question.
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="https://wa.me/212684440682"
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
              WhatsApp us
              <IconArrow size={16} color="#FFFFFF" />
            </a>
            <a
              href="mailto:atelier@harchcorp.com"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
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
              Send an email
            </a>
          </div>

          {/* Contact info row */}
          <div
            style={{
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: `1px solid ${C.borderLight}`,
              display: "flex",
              gap: "32px",
              justifyContent: "center",
              flexWrap: "wrap",
              fontSize: "12px",
              fontFamily: FONT.mono,
              color: C.textMuted,
            }}
          >
            <span>atelier@harchcorp.com</span>
            <span>·</span>
            <span>+212 684 440 682</span>
            <span>·</span>
            <span>Casablanca, Maroc</span>
            <span>·</span>
            <span>Reply within 24h</span>
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
        .faq-chips { justify-content: flex-start !important; overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 8px; }
      }
    `}</style>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openId, setOpenId] = useState<number | null>(1);

  // Counts per category
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    FAQS.forEach((f) => {
      c[f.category] = (c[f.category] || 0) + 1;
    });
    return c;
  }, []);

  // Filtered FAQs
  const filtered = useMemo(() => {
    return FAQS.filter((f) => {
      const matchesCategory = activeCategory === "All" || f.category === activeCategory;
      const matchesSearch =
        search === "" ||
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <AtelierNav />
      <main style={{ background: C.bg, color: C.textPrimary, fontFamily: FONT.sans }}>
        <Hero search={search} setSearch={setSearch} />
        <CategoryFilter active={activeCategory} setActive={setActiveCategory} counts={counts} />
        <FAQList faqs={filtered} openId={openId} setOpenId={setOpenId} />
        <StillHaveQuestions />
      </main>
      <AtelierFooter />
      <BackToTop />
      <ResponsiveStyles />
    </>
  );
}

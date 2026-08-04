import type { Metadata } from "next";
import FAQPage from "./FAQPage";

// ─── FAQ PAGE SEO ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "FAQ — AI Reputation Intelligence Questions | Harch Atelier",
  },
  description:
    "What is AI reputation intelligence? How does sentiment analysis work? What does the audit include? All your questions answered.",
  keywords: [
    "AI reputation intelligence FAQ",
    "what is AI reputation",
    "how sentiment analysis works",
    "HarchIQ sentiment model",
    "ChatGPT brand tracking",
    "WhatsApp digest FAQ",
    "media monitoring questions",
    "crisis alert speed",
    "bank transfer pricing",
    "cancel subscription",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/faq",
  },
  openGraph: {
    title: "FAQ — AI Reputation Intelligence Questions | Harch Atelier",
    description:
      "What is AI reputation intelligence? How does sentiment analysis work? What does the audit include? All your questions answered.",
    type: "website",
    url: "https://atelier.harchcorp.com/faq",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — AI Reputation Intelligence Questions | Harch Atelier",
    description:
      "What is AI reputation intelligence? How does sentiment analysis work? What does the audit include? All your questions answered.",
  },
};

// ─── JSON-LD: FAQPage (12 questions) ─────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "Harch Atelier — AI Reputation Intelligence FAQ",
  url: "https://atelier.harchcorp.com/faq",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AI Reputation Intelligence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI Reputation Intelligence is the practice of monitoring what media and AI engines say about your brand, analyzing the sentiment of every mention, and acting on the insights before they become a crisis. We track 30+ media sources and 8 AI engines (ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok), classify sentiment per entity and topic, and deliver insights via WhatsApp digest, live dashboard, and monthly PDF report.",
      },
    },
    {
      "@type": "Question",
      name: "How is this different from social listening?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Social listening tools (Meltwater, Brandwatch, Talkwalker) track Twitter, Facebook, forums. We track media articles and AI engine responses — two channels social tools ignore. If a customer asks ChatGPT 'Quelle est la meilleure banque au Maroc ?', the answer shapes their decision. Social listening won't catch that. We complement your social tool, we don't replace it.",
      },
    },
    {
      "@type": "Question",
      name: "How do you measure sentiment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every mention goes through HarchIQ sentiment classification. The model assigns a score from -1 (very negative) to +1 (very positive), with a confidence interval. Score -1.0 to -0.3 is negative (red zone, triggers alert if below -0.5), -0.3 to +0.3 is neutral, +0.3 to +1.0 is positive. Confidence below 70% is flagged for human review. We handle French, Arabic, and English natively. Darija and code-switching are detected but flagged for review.",
      },
    },
    {
      "@type": "Question",
      name: "Which media sources do you cover?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "30+ Moroccan and African media sources, plus the major francophone press. Morocco: Le Matin, L'Économiste, Hespress, TelQuel, Médias24, Aujourd'hui, Le Desk, ChallengeMA. Africa: Jeune Afrique, RFI Afrique, Africa News, Financial Afrik. Francophone: Le Monde Afrique, Le Figaro, Libération. We crawl every 60 seconds for Corporate and Sovereign, every 5 minutes for Émergence. Sovereign clients can request additional sources.",
      },
    },
    {
      "@type": "Question",
      name: "How fast are crisis alerts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Corporate and Sovereign tiers get crisis alerts in under 5 minutes from publication. The pipeline: detection (2min) → NLP (1min) → sentiment classification (1min) → WhatsApp delivery (1min). Émergence tier alerts are under 1 hour. Triggers: sentiment below -0.5 on a tracked entity, or a volume spike above 200%. We deliver to WhatsApp because that's where you already are at 7am.",
      },
    },
    {
      "@type": "Question",
      name: "Why bank transfer and not credit card?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Two reasons. First, most of our clients are Moroccan and African companies where bank transfer is the standard B2B payment. Second, it keeps our costs down — no Stripe fees, no chargeback risk — and we pass the savings to you. We accept bank transfer in MAD or EUR, with monthly invoices payable within 30 days. We can also accept Wise, PayPal, or crypto for international clients.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Émergence and Corporate are monthly with no commitment. You cancel with one email, effective at the end of the current month — no penalty, no clawback. Sovereign has a 90-day notice period for annual contracts. You keep dashboard access until the end of the paid period, and all your historical data is exported to CSV on request. We don't believe in lock-in.",
      },
    },
    {
      "@type": "Question",
      name: "What AI models do you use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We use a combination of open-source NLP and frontier LLMs. The pipeline is modular — we swap models as better ones become available. NER (entity extraction): spaCy with a custom Moroccan entity library. Sentiment classification: HarchIQ (multilingual, handles FR/AR/EN). Topic modeling: BERTopic. Language detection: fastText (handles Darija and code-switching). We don't depend on a single model provider.",
      },
    },
    {
      "@type": "Question",
      name: "Do you track what ChatGPT says about me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We query 8 AI engines every hour with the prompts your customers actually use — and track how your brand appears in the responses. Engines: ChatGPT, Perplexity, Google AI Overviews, Gemini, Claude, Copilot, Mistral, Grok. We work with you to define the 20-50 prompts that matter for your sector, then track mention presence, position (1st / 2nd / not mentioned), sentiment, and competitors cited. Hourly refresh, daily digest.",
      },
    },
    {
      "@type": "Question",
      name: "What does the daily WhatsApp digest look like?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A structured message, every morning at 7:00 (Casa time). Designed to be read in 30 seconds on your phone. Header: brand + date + reputation score + delta. Mentions: count + % change vs yesterday. Top topics: 3-5 themes, color-coded by sentiment. Alerts: any crisis alert from the last 24h. Reply: text a question, get an instant AI answer. You can forward it to your comms team, CEO, or board in one tap. No login, no app.",
      },
    },
    {
      "@type": "Question",
      name: "What's in the monthly PDF report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A 32-page board-ready document. Pages 1-2: cover + executive summary (1-page read for the CEO). Pages 3-8: reputation score evolution (30 / 90 / 365 days). Pages 9-16: sentiment breakdown by source, topic, entity. Pages 17-24: top risks + crisis review. Pages 25-28: competitor benchmark (3 competitors). Pages 29-32: recommended actions + appendix. Émergence tier gets an 8-page version. Sovereign gets an additional quarterly report.",
      },
    },
    {
      "@type": "Question",
      name: "I'm a startup / SME — is this for me?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Émergence tier (15,000 MAD/month) is calibrated for the structured mid-cap company that needs institutional-grade intelligence without the enterprise footprint. You get the same pipeline as the big groups, just with fewer sources and brands. Structured mid-cap: Émergence (15K MAD) — 1 brand, 10 sources, 3 AI engines. Corporate group: Corporate (40K MAD) — 3 brands, 30+ sources, 8 AI engines. Large group / multi-country / sovereign entity: Sovereign (75K MAD) — unlimited brands, custom taxonomy. Free 7-day audit available for any tier. 70% of our clients start on Émergence and upgrade within 3 months.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQPage />
    </>
  );
}

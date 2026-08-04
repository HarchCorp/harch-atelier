import type { Metadata } from "next";
import MethodPage from "./MethodPage";

// ─── METHOD PAGE SEO ─────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "How It Works — Monitor, Analyze, Deliver | Harch Atelier",
  },
  description:
    "Three steps: we monitor 30+ media sources 24/7, analyze sentiment with AI, deliver insights via WhatsApp and PDF. No engineers needed.",
  keywords: [
    "media monitoring process",
    "AI sentiment analysis",
    "reputation monitoring workflow",
    "WhatsApp intelligence alerts",
    "HarchIQ sentiment",
    "BERTopic modeling",
    "NER entity extraction",
    "AI reputation pipeline",
    "daily digest",
    "board-ready PDF report",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/method",
  },
  openGraph: {
    title: "How It Works — Monitor, Analyze, Deliver | Harch Atelier",
    description:
      "Three steps: we monitor 30+ media sources 24/7, analyze sentiment with AI, deliver insights via WhatsApp and PDF. No engineers needed.",
    type: "article",
    url: "https://atelier.harchcorp.com/method",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "How It Works — Monitor, Analyze, Deliver | Harch Atelier",
    description:
      "Three steps: monitor 30+ media sources, analyze sentiment with AI, deliver insights via WhatsApp and PDF.",
  },
};

// ─── JSON-LD: HowTo (3 steps) ────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How Harch Atelier Monitors Your Reputation",
  description:
    "Three steps: we monitor 30+ media sources 24/7, analyze sentiment with AI, deliver insights via WhatsApp and PDF.",
  url: "https://atelier.harchcorp.com/method",
  totalTime: "P1D",
  supply: [
    {
      "@type": "HowToSupply",
      name: "30+ Moroccan and African media sources",
    },
    {
      "@type": "HowToSupply",
      name: "8 AI engines (ChatGPT, Perplexity, Gemini, Claude, Copilot, Mistral, Grok)",
    },
  ],
  tool: [
    {
      "@type": "HowToTool",
      name: "HarchIQ multilingual sentiment classifier",
    },
    {
      "@type": "HowToTool",
      name: "spaCy NER + BERTopic",
    },
  ],
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Monitor — 30+ media sources 24/7",
      text: "We crawl 30+ Moroccan and African media sources every 60 seconds (Corporate & Sovereign) or every 5 minutes (Émergence). We also query 8 AI engines hourly with the prompts your customers actually use.",
      url: "https://atelier.harchcorp.com/method#monitor",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Analyze — HarchIQ sentiment + NER + topics",
      text: "Every mention goes through HarchIQ sentiment classification (score -1 to +1), spaCy NER for entity extraction, and BERTopic for topic clustering. Articles handled natively in French, Arabic, and English; NLP Darija pour les commentaires Hespress, forums, WhatsApp et TikTok — la couche UGC que aucun concurrent ne couvre.",
      url: "https://atelier.harchcorp.com/method#analyze",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Deliver — WhatsApp, dashboard, PDF",
      text: "Daily WhatsApp digest at 7:00 Casa time, live dashboard with 90-day history, monthly 32-page board-ready PDF report. Crisis alerts delivered in under 5 minutes for Corporate and Sovereign tiers.",
      url: "https://atelier.harchcorp.com/method#deliver",
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
      <MethodPage />
    </>
  );
}

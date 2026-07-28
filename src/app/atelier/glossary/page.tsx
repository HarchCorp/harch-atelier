import type { Metadata } from "next";
import GlossaryPage from "./GlossaryPage";

// ─── GLOSSARY PAGE SEO ───────────────────────────────────────────
// Long-tail SEO target: 50 reputation intelligence, PR, AI terms.

export const metadata: Metadata = {
  title: {
    absolute:
      "Reputation Intelligence Glossary — 50 PR, AI & Risk Terms | Harch Atelier",
  },
  description:
    "50 essential terms across reputation intelligence, AI & search, PR communications, risk management, ESG & compliance, and analytics. Reputation Score, AI Visibility, GEO, HarchIQ, RAG, sentiment analysis, crisis communication and more.",
  keywords: [
    "reputation intelligence glossary",
    "what is AI visibility",
    "what is reputation score",
    "generative engine optimization GEO",
    "what is HarchIQ",
    "retrieval augmented generation RAG",
    "sentiment analysis definition",
    "share of voice SOV",
    "crisis communication definition",
    "Moroccan data protection law Loi 09-08",
    "Bank Al-Maghrib BAM",
    "AMMC Morocco",
    "ANRT telecom regulator",
    "CNDP Morocco data protection",
    "ONSSA food safety Morocco",
    "reputation risk definition",
    "ESG framework definition",
    "greenwashing definition",
    "risk matrix definition",
    "materiality matrix definition",
    "early warning system risk",
    "crisis playbook",
    "anomaly detection media",
    "topic clustering analysis",
    "source authority score",
    "PR ROI measurement",
    "earned media definition",
    "holding statement crisis",
    "Model Context Protocol MCP",
    "LLM large language model definition",
    "hallucination AI definition",
    "brand health metrics",
    "narrative detection",
    "entity level sentiment",
    "media monitoring definition",
    "press release definition",
    "spokesperson definition",
    "benchmark KPI analytics",
    "salience media coverage",
    "coverage volume metrics",
    "sentiment shift detection",
    "risk velocity definition",
    "risk frequency definition",
    "risk impact severity",
    "sustainability reporting",
    "GDPR definition",
    "share of conversation",
    "AI reputation index",
    "risk register",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/glossary",
  },
  openGraph: {
    title:
      "Reputation Intelligence Glossary — 50 PR, AI & Risk Terms | Harch Atelier",
    description:
      "50 essential terms across reputation intelligence, AI & search, PR communications, risk management, ESG & compliance, and analytics.",
    type: "website",
    url: "https://atelier.harchcorp.com/glossary",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Reputation Intelligence Glossary — 50 PR, AI & Risk Terms | Harch Atelier",
    description:
      "50 essential terms across reputation intelligence, AI & search, PR communications, risk management, ESG & compliance, and analytics.",
  },
};

// ─── JSON-LD: DefinedTermSet ─────────────────────────────────────
// Schema.org DefinedTermSet for SEO. We inline the 50 terms so search
// engines can pick up structured glossary content.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "Reputation Intelligence Glossary",
  description:
    "50 essential terms across reputation intelligence, AI & search, PR communications, risk management, ESG & compliance, and analytics.",
  url: "https://atelier.harchcorp.com/glossary",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  hasDefinedTerm: [
    { "@type": "DefinedTerm", name: "Reputation Score", description: "A numerical score (0-100) quantifying a company's reputation based on media sentiment, AI visibility, volume, and authority." },
    { "@type": "DefinedTerm", name: "Reputation Risk", description: "The risk of damage to a company's reputation from negative media coverage, social media, or AI engine responses." },
    { "@type": "DefinedTerm", name: "Reputation Tracker", description: "A tool that monitors and displays a company's reputation score over time." },
    { "@type": "DefinedTerm", name: "Share of Voice (SOV)", description: "The percentage of media coverage a company receives relative to its competitors." },
    { "@type": "DefinedTerm", name: "Sentiment Analysis", description: "The process of determining whether media coverage is positive, neutral, or negative." },
    { "@type": "DefinedTerm", name: "Entity-Level Sentiment", description: "Sentiment analysis that tracks specific entities (company, CEO, products) within articles." },
    { "@type": "DefinedTerm", name: "Brand Health", description: "The overall state of a brand's reputation, measured by sentiment, coverage volume, and share of voice." },
    { "@type": "DefinedTerm", name: "Narrative Detection", description: "Identifying the dominant stories or themes forming around a brand in media coverage." },
    { "@type": "DefinedTerm", name: "AI Visibility", description: "Whether and how AI engines (ChatGPT, Perplexity, Gemini, Claude) cite a company in their responses." },
    { "@type": "DefinedTerm", name: "AI Reputation Index", description: "A measure of how AI engines perceive and discuss a company." },
    { "@type": "DefinedTerm", name: "Generative Engine Optimization (GEO)", description: "The practice of optimizing content to appear in AI-generated responses." },
    { "@type": "DefinedTerm", name: "Large Language Model (LLM)", description: "AI models like GPT-4, Claude, and Gemini that generate human-like text." },
    { "@type": "DefinedTerm", name: "HarchIQ", description: "Harch Atelier's trainable AI engine for reputation intelligence." },
    { "@type": "DefinedTerm", name: "Model Context Protocol (MCP)", description: "A protocol for connecting AI assistants to external data sources." },
    { "@type": "DefinedTerm", name: "Hallucination", description: "When an AI model generates false or fabricated information." },
    { "@type": "DefinedTerm", name: "Retrieval-Augmented Generation (RAG)", description: "AI technique that combines retrieval with generation for accurate responses." },
    { "@type": "DefinedTerm", name: "Crisis Communication", description: "Strategic communication during a crisis to protect reputation." },
    { "@type": "DefinedTerm", name: "Holding Statement", description: "A preliminary public statement issued during a crisis before full details are known." },
    { "@type": "DefinedTerm", name: "Media Monitoring", description: "The process of tracking media coverage of a company, industry, or topic." },
    { "@type": "DefinedTerm", name: "Press Release", description: "An official statement sent to media to share news." },
    { "@type": "DefinedTerm", name: "Earned Media", description: "Media coverage gained through PR efforts, not paid advertising." },
    { "@type": "DefinedTerm", name: "Share of Conversation", description: "Similar to SOV but focused on specific topics or narratives." },
    { "@type": "DefinedTerm", name: "PR ROI", description: "Return on investment for PR activities, measured through reputation impact." },
    { "@type": "DefinedTerm", name: "Spokesperson", description: "An individual designated to speak on behalf of a company." },
    { "@type": "DefinedTerm", name: "Risk Matrix", description: "A visual tool for assessing risks based on likelihood and impact." },
    { "@type": "DefinedTerm", name: "Risk Velocity", description: "The speed at which a risk is developing or escalating." },
    { "@type": "DefinedTerm", name: "Risk Frequency", description: "How often a particular risk event occurs." },
    { "@type": "DefinedTerm", name: "Risk Impact Severity", description: "The potential consequences of a risk event." },
    { "@type": "DefinedTerm", name: "Crisis Playbook", description: "A documented set of procedures for responding to crises." },
    { "@type": "DefinedTerm", name: "Early Warning System", description: "A system that detects emerging risks before they escalate." },
    { "@type": "DefinedTerm", name: "Risk Register", description: "A central repository of all identified risks facing an organization." },
    { "@type": "DefinedTerm", name: "Materiality Matrix", description: "A visualization comparing internal priorities vs external impact." },
    { "@type": "DefinedTerm", name: "ESG (Environmental, Social, Governance)", description: "A framework for evaluating corporate sustainability and ethical impact." },
    { "@type": "DefinedTerm", name: "Greenwashing", description: "Making misleading claims about environmental benefits." },
    { "@type": "DefinedTerm", name: "Sustainability Reporting", description: "Disclosing environmental and social performance." },
    { "@type": "DefinedTerm", name: "Loi 09-08", description: "Moroccan data protection law (equivalent to GDPR)." },
    { "@type": "DefinedTerm", name: "GDPR", description: "EU General Data Protection Regulation." },
    { "@type": "DefinedTerm", name: "Bank Al-Maghrib (BAM)", description: "Morocco's central bank and banking regulator." },
    { "@type": "DefinedTerm", name: "AMMC", description: "Autorité Marocaine du Marché des Capitaux (Moroccan capital markets authority)." },
    { "@type": "DefinedTerm", name: "ANRT", description: "Agence Nationale de Réglementation des Télécommunications (Moroccan telecom regulator)." },
    { "@type": "DefinedTerm", name: "CNDP", description: "Commission Nationale de contrôle de la Protection des Données à caractère Personnel (Moroccan data protection authority)." },
    { "@type": "DefinedTerm", name: "ONSSA", description: "Office National de Sécurité Sanitaire des Produits Alimentaires (Moroccan food safety authority)." },
    { "@type": "DefinedTerm", name: "KPI (Key Performance Indicator)", description: "A measurable value that indicates performance level." },
    { "@type": "DefinedTerm", name: "Benchmark", description: "A standard or point of reference for comparison." },
    { "@type": "DefinedTerm", name: "Topic Clustering", description: "Grouping articles by topic for analysis." },
    { "@type": "DefinedTerm", name: "Salience", description: "The prominence or importance of a topic in media coverage." },
    { "@type": "DefinedTerm", name: "Source Authority", description: "A score indicating the credibility and reach of a media source." },
    { "@type": "DefinedTerm", name: "Coverage Volume", description: "The total number of articles mentioning a company or topic." },
    { "@type": "DefinedTerm", name: "Sentiment Shift", description: "A significant change in sentiment over a period." },
    { "@type": "DefinedTerm", name: "Anomaly Detection", description: "Identifying unusual spikes or patterns in coverage." },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GlossaryPage />
    </>
  );
}

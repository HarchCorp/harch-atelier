import type { Metadata } from "next";
import AviationIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Aviation Industry Reputation Report — Royal Air Maroc | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's aviation sector: Royal Air Maroc tracked across 892 data points and 32 risk categories. RAM scores 76/100 — Tier 2, lifted by oneworld alliance and African expansion, weighed by labour disputes.",
  keywords: [
    "Royal Air Maroc reputation",
    "RAM reputation score",
    "Morocco aviation industry",
    "RAM oneworld alliance",
    "Royal Air Maroc safety",
    "RAM labour dispute cabin crew",
    "Morocco aviation ESG SAF",
    "RAM African expansion",
    "Casablanca aviation hub",
    "Harch aviation industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/industries/aviation" },
  openGraph: {
    title: "Aviation Industry Reputation Report — Royal Air Maroc",
    description:
      "892 data points, 32 risk categories. Royal Air Maroc scores 76/100 — Tier 2, lifted by oneworld alliance and African expansion, weighed by labour disputes.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/industries/aviation",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviation Industry Reputation Report — Morocco",
    description:
      "892 data points. Royal Air Maroc scores 76/100 — Tier 2. Safety incident (70) and labour dispute (57) top the risk register.",
  },
};

// ─── JSON-LD: Dataset (industry reputation dataset) ──────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Aviation Industry Reputation Report — Morocco",
  description:
    "Real-time reputation intelligence for Morocco's aviation sector: Royal Air Maroc tracked across 892 data points and 32 risk categories. RAM scores 76/100.",
  url: "https://atelier.harchcorp.com/atelier/industries/aviation",
  inLanguage: "en",
  keywords: "Morocco aviation, Royal Air Maroc, RAM, oneworld, safety, labour dispute, SAF",
  creator: {
    "@type": "Organization",
    "@id": "https://atelier.harchcorp.com/#organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  publisher: {
    "@type": "Organization",
    "@id": "https://atelier.harchcorp.com/#organization",
    name: "Harch Atelier",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/industries/aviation",
  },
  spatialCoverage: {
    "@type": "Place",
    name: "Morocco",
  },
  variableMeasured: [
    "Reputation score (0-100)",
    "Sentiment distribution",
    "Risk index (32 categories)",
    "Share of voice",
    "AI visibility",
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AviationIndustryPage />
    </>
  );
}

import type { Metadata } from "next";
import RetailIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Retail Industry Reputation Report — Marjane, Label'Vie | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's retail sector: 2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat (70) and product recall (62) top the risk register.",
  keywords: [
    "Marjane Group reputation",
    "Label'Vie reputation",
    "Morocco retail reputation",
    "Carrefour Maroc reputation",
    "Morocco retail boycott risk",
    "Morocco retail ESG",
    "Morocco supermarket industry",
    "Marjane digital transformation",
    "Morocco retail consumer protection",
    "Harch retail industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/industries/retail" },
  openGraph: {
    title: "Retail Industry Reputation Report — Marjane, Label'Vie",
    description:
      "2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat and product recall top the risk register.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/industries/retail",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail Industry Reputation Report — Morocco",
    description:
      "2 majors, 1,256 data points. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat (70) and product recall (62) top the risk register.",
  },
};

// ─── JSON-LD: Dataset (industry reputation dataset) ──────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Retail Industry Reputation Report — Morocco",
  description:
    "Real-time reputation intelligence for Morocco's retail sector: 2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100.",
  url: "https://atelier.harchcorp.com/atelier/industries/retail",
  inLanguage: "en",
  keywords: "Morocco retail, Marjane, Label'Vie, Carrefour Maroc, boycott risk, ESG",
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
    "@id": "https://atelier.harchcorp.com/atelier/industries/retail",
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
      <RetailIndustryPage />
    </>
  );
}

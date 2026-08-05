import type { Metadata } from "next";
import EnergyIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Energy Industry Reputation Report — Nareva, Total, Afriquia, Shell | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's energy sector: 4 companies, 1,348 data points, 32 risk categories. Industry avg 55/100. Nareva leads at 72 (renewable champion); Total Maroc trails at 41. Operational accident (70) and pollution incident (65) top the risk register.",
  keywords: [
    "Nareva reputation Morocco",
    "Morocco energy industry reputation",
    "Total Maroc reputation",
    "Shell Maroc reputation",
    "Afriquia Akwa Group reputation",
    "Morocco renewable energy transition",
    "Morocco green hydrogen",
    "Morocco fuel price regulation",
    "Morocco energy ESG",
    "Harch energy industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/industries/energy" },
  openGraph: {
    title: "Energy Industry Reputation Report — Morocco",
    description:
      "4 companies, 1,348 data points, 32 risk categories. Industry avg 55/100. Nareva leads at 72 (renewable champion); Total Maroc trails at 41 — the lowest score in our Moroccan universe.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/industries/energy",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Energy Industry Reputation Report — Morocco",
    description:
      "4 companies, 1,348 data points. Industry avg 55/100. Nareva leads at 72; Total Maroc trails at 41. Operational accident (70) and pollution incident (65) top the risk register.",
  },
};

// ─── JSON-LD: Dataset (industry reputation dataset) ──────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Energy Industry Reputation Report — Morocco",
  description:
    "Real-time reputation intelligence for Morocco's energy sector: 4 companies, 1,348 data points, 32 risk categories. Nareva leads at 72; Total Maroc trails at 41.",
  url: "https://atelier.harchcorp.com/atelier/industries/energy",
  inLanguage: "en",
  keywords: "Morocco energy, Nareva, Total Maroc, Afriquia, Shell Maroc, renewable, green hydrogen",
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
    "@id": "https://atelier.harchcorp.com/atelier/industries/energy",
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
      <EnergyIndustryPage />
    </>
  );
}

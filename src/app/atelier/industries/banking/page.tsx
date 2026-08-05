import type { Metadata } from "next";
import BankingIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Banking Industry Reputation Report — 8 Moroccan Banks Tracked | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's banking sector: 8 banks, 1,842 data points, 32 risk categories. Attijariwafa leads at 84/100. Financial fraud (81) and cyber attack (78) are the top reputational risks.",
  keywords: [
    "Morocco banking reputation",
    "Attijariwafa Bank reputation score",
    "Bank of Africa BMCE reputation",
    "Moroccan banks risk index",
    "Bank Al-Maghrib AML compliance",
    "Morocco banking cyber attack risk",
    "CIH Bank reputation",
    "Banque Centrale Populaire reputation",
    "Morocco banking ESG sustainable finance",
    "Harch banking industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/industries/banking" },
  openGraph: {
    title: "Banking Industry Reputation Report — 8 Moroccan Banks Tracked",
    description:
      "8 banks, 1,842 data points, 32 risk categories. Attijariwafa leads at 84/100. Financial fraud and cyber attack are the top reputational risks for Moroccan banking.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/industries/banking",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Banking Industry Reputation Report — Morocco",
    description:
      "8 banks, 1,842 data points. Attijariwafa leads at 84/100. Financial fraud (81) and cyber attack (78) top the risk register.",
  },
};

// ─── JSON-LD: Dataset (industry reputation dataset) ──────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Banking Industry Reputation Report — Morocco",
  description:
    "Real-time reputation intelligence for Morocco's banking sector: 8 banks, 1,842 data points, 32 risk categories. Attijariwafa leads at 84/100.",
  url: "https://atelier.harchcorp.com/atelier/industries/banking",
  inLanguage: "en",
  keywords: "Morocco banking, reputation intelligence, Attijariwafa, Bank of Africa, BMCE, CIH, BCP",
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
    "@id": "https://atelier.harchcorp.com/atelier/industries/banking",
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
      <BankingIndustryPage />
    </>
  );
}

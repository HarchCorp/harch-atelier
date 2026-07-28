import type { Metadata } from "next";
import BankOfAfricaPage from "./CompanyPage";

export const metadata: Metadata = {
  title: { absolute: "Bank of Africa Reputation Profile — Score 72/100 · #6 in Harch 100 | Harch Atelier" },
  description:
    "Bank of Africa ranks #6 in Morocco's Harch 100 with a 72/100 reputation score. 247 articles analyzed, 18 sources, cited by 3/4 AI engines. Nigeria market entry, Q2 record results, digital transformation, sustainable-finance framework.",
  keywords: [
    "Bank of Africa reputation score",
    "Bank of Africa Harch 100",
    "BMCE Bank of Morocco reputation",
    "Bank of Africa Nigeria entry",
    "Prestige Bank acquisition",
    "Bank of Africa pan-African strategy",
    "Bank of Africa green bond",
    "Bank of Africa EU Taxonomy",
    "Morocco banking reputation",
    "Harch Atelier company profile",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/companies/bank-of-africa" },
  openGraph: {
    title: "Bank of Africa — Reputation Score 72/100 · #6 in Harch 100",
    description:
      "Morocco's second-largest bank and pan-African franchise ranks #6 in the Harch 100. 247 articles, 18 sources, 3/4 AI engine citations, 22% share of voice in Banking. Nigeria entry, Q2 results, digital transformation, sustainable finance.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/companies/bank-of-africa",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bank of Africa — Reputation Score 72/100 · #6 in Harch 100",
    description:
      "247 articles analyzed · 18 sources · 3/4 AI engines · 22% share of voice. Nigeria entry, Q2 results, digital transformation, sustainable-finance framework.",
  },
};

// ─── JSON-LD: Organization schema ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Bank of Africa",
  alternateName: "BMCE Bank of Morocco",
  url: "https://atelier.harchcorp.com/atelier/companies/bank-of-africa",
  description:
    "Bank of Africa ranks #6 in Morocco's Harch 100 with a 72/100 reputation score. 247 articles analyzed, 18 sources, cited by 3/4 AI engines. Nigeria market entry, Q2 record results, digital transformation, sustainable-finance framework.",
  areaServed: ["Morocco", "Africa", "Europe"],
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/companies/bank-of-africa",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BankOfAfricaPage />
    </>
  );
}

import type { Metadata } from "next";
import RoyalAirMarocPage from "./CompanyPage";

export const metadata: Metadata = {
  title: { absolute: "Royal Air Maroc Reputation Profile — Score 76/100 · #4 in Harch 100 | Harch Atelier" },
  description:
    "Royal Air Maroc ranks #4 in Morocco's Harch 100 with a 76/100 reputation score. 198 articles analyzed, 20 sources, cited by 3/4 AI engines. oneworld alliance, new Asia routes, fleet modernization, labor disputes, fuel efficiency.",
  keywords: [
    "Royal Air Maroc reputation score",
    "Royal Air Maroc Harch 100",
    "Morocco aviation reputation",
    "RAM oneworld alliance",
    "Royal Air Maroc Casablanca Beijing Tokyo",
    "Royal Air Maroc fleet renewal Boeing 787",
    "RAM pilot strike 2025",
    "RAM fuel hedging strategy",
    "Royal Air Maroc safety record",
    "Harch Atelier company profile",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/companies/royal-air-maroc" },
  openGraph: {
    title: "Royal Air Maroc — Reputation Score 76/100 · #4 in Harch 100",
    description:
      "Morocco's flag carrier and oneworld alliance member ranks #4 in the Harch 100. 198 articles, 20 sources, 3/4 AI engine citations, 19% share of voice in Aviation. oneworld expansion, new Asia routes, fleet modernization.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/companies/royal-air-maroc",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Royal Air Maroc — Reputation Score 76/100 · #4 in Harch 100",
    description:
      "198 articles analyzed · 20 sources · 3/4 AI engines · 19% share of voice. oneworld alliance, new Asia routes, fleet modernization, labor disputes.",
  },
};

// ─── JSON-LD: Organization schema ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Royal Air Maroc",
  alternateName: "RAM",
  url: "https://atelier.harchcorp.com/atelier/companies/royal-air-maroc",
  description:
    "Royal Air Maroc ranks #4 in Morocco's Harch 100 with a 76/100 reputation score. 198 articles analyzed, 20 sources, cited by 3/4 AI engines. oneworld alliance, new Asia routes, fleet modernization, labor disputes, fuel efficiency.",
  areaServed: ["Morocco", "Africa", "Europe", "Asia"],
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/companies/royal-air-maroc",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RoyalAirMarocPage />
    </>
  );
}

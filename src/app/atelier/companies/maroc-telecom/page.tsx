import type { Metadata } from "next";
import MarocTelecomPage from "./CompanyPage";

export const metadata: Metadata = {
  title: { absolute: "Maroc Telecom Reputation Profile — Score 79/100 · #3 in Harch 100 | Harch Atelier" },
  description:
    "Maroc Telecom ranks #3 in Morocco's Harch 100 with a 79/100 reputation score. 245 articles analyzed, 22 sources, cited by 3/4 AI engines. 5G rollout leadership, digital inclusion, FTTH expansion, B2B services.",
  keywords: [
    "Maroc Telecom reputation score",
    "Maroc Telecom Harch 100",
    "Morocco telecom reputation",
    "Maroc Telecom 5G rollout",
    "Maroc Telecom FTTH fiber",
    "Itissalat Al-Maghrib reputation",
    "Maroc Telecom universal service",
    "Morocco telecom cyber risk",
    "Maroc Telecom B2B cybersecurity",
    "Harch Atelier company profile",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/companies/maroc-telecom" },
  openGraph: {
    title: "Maroc Telecom — Reputation Score 79/100 · #3 in Harch 100",
    description:
      "Morocco's incumbent telecom operator ranks #3 in the Harch 100. 245 articles, 22 sources, 3/4 AI engine citations, 24% share of voice in Telecommunications. 5G leadership, digital inclusion, FTTH expansion.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/companies/maroc-telecom",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maroc Telecom — Reputation Score 79/100 · #3 in Harch 100",
    description:
      "245 articles analyzed · 22 sources · 3/4 AI engines · 24% share of voice. 5G rollout leadership, digital inclusion, FTTH expansion, B2B services.",
  },
};

// ─── JSON-LD: Organization schema ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Maroc Telecom",
  alternateName: "Itissalat Al-Maghrib",
  url: "https://atelier.harchcorp.com/atelier/companies/maroc-telecom",
  description:
    "Maroc Telecom ranks #3 in Morocco's Harch 100 with a 79/100 reputation score. 245 articles analyzed, 22 sources, cited by 3/4 AI engines. 5G rollout leadership, digital inclusion, FTTH expansion, B2B services.",
  areaServed: ["Morocco", "Africa"],
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/companies/maroc-telecom",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarocTelecomPage />
    </>
  );
}

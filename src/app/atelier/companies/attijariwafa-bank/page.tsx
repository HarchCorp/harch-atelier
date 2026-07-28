import type { Metadata } from "next";
import AttijariwafaPage from "./CompanyPage";

export const metadata: Metadata = {
  title: { absolute: "Attijariwafa Bank Reputation Profile — Score 84/100 · #2 in Harch 100 | Harch Atelier" },
  description:
    "Attijariwafa Bank ranks #2 in Morocco's Harch 100 with an 84/100 reputation score. 287 articles analyzed, 24 sources, cited by 4/4 AI engines. Q2 results, regional expansion across 23 countries, Tijari digital platform, ESG leadership.",
  keywords: [
    "Attijariwafa Bank reputation score",
    "Attijariwafa Harch 100",
    "Morocco banking reputation",
    "Attijariwafa Tijari digital bank",
    "Ismail Douiri succession",
    "Attijariwafa Egypt subsidiary",
    "Attijariwafa sustainable bond",
    "Morocco bank cyber risk",
    "Attijariwafa Côte d'Ivoire",
    "Harch Atelier company profile",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/companies/attijariwafa-bank" },
  openGraph: {
    title: "Attijariwafa Bank — Reputation Score 84/100 · #2 in Harch 100",
    description:
      "Morocco's largest bank by assets ranks #2 in the Harch 100. 287 articles, 24 sources, 4/4 AI engine citations, 27% share of voice in Banking. Q2 results, regional expansion, digital transformation.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/companies/attijariwafa-bank",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Attijariwafa Bank — Reputation Score 84/100 · #2 in Harch 100",
    description:
      "287 articles analyzed · 24 sources · 4/4 AI engines · 27% share of voice. Q2 results, regional expansion, Tijari digital, ESG leadership.",
  },
};

// ─── JSON-LD: Organization schema ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Attijariwafa Bank",
  url: "https://atelier.harchcorp.com/atelier/companies/attijariwafa-bank",
  description:
    "Attijariwafa Bank ranks #2 in Morocco's Harch 100 with an 84/100 reputation score. 287 articles analyzed, 24 sources, cited by 4/4 AI engines. Q2 results, regional expansion across 23 countries, Tijari digital platform, ESG leadership.",
  areaServed: ["Morocco", "Africa", "Europe"],
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/companies/attijariwafa-bank",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AttijariwafaPage />
    </>
  );
}

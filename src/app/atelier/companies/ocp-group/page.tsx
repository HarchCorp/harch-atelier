import type { Metadata } from "next";
import OCPGroupPage from "./CompanyPage";

export const metadata: Metadata = {
  title: { absolute: "OCP Group Reputation Profile — Score 91/100 · #1 in Harch 100 | Harch Atelier" },
  description:
    "OCP Group ranks #1 in Morocco's Harch 100 with a 91/100 reputation score — the highest in our corporate universe. 342 articles analyzed, 28 sources, cited by 4/4 AI engines. Green ammonia leadership, food-security diplomacy, sustainable phosphate.",
  keywords: [
    "OCP Group reputation score",
    "OCP Group Harch 100",
    "Morocco phosphate company reputation",
    "OCP green ammonia Jorf Lasfar",
    "Mostafa Terrab reputation",
    "OCP Group CBAM 2026",
    "OCP sustainable phosphate",
    "Plant4Tomorrow carbon farming",
    "OCP Africa expansion Nigeria Ghana",
    "Harch Atelier company profile",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/companies/ocp-group" },
  openGraph: {
    title: "OCP Group — Reputation Score 91/100 · #1 in Harch 100",
    description:
      "Morocco's national phosphate champion sits at 91/100 — the highest score in the Harch 100. 342 articles, 28 sources, 4/4 AI engine citations, 31% share of voice in Mining & Phosphates.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/companies/ocp-group",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "OCP Group — Reputation Score 91/100 · #1 in Harch 100",
    description:
      "342 articles analyzed · 28 sources · 4/4 AI engines · 31% share of voice. Green ammonia leadership, food-security diplomacy, sustainable phosphate.",
  },
};

// ─── JSON-LD: Organization schema ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "OCP Group",
  alternateName: "Office Chérifien des Phosphates",
  url: "https://atelier.harchcorp.com/atelier/companies/ocp-group",
  description:
    "OCP Group ranks #1 in Morocco's Harch 100 with a 91/100 reputation score — the highest in our corporate universe. 342 articles analyzed, 28 sources, cited by 4/4 AI engines. Green ammonia leadership, food-security diplomacy, sustainable phosphate.",
  areaServed: ["Morocco", "Africa", "Global"],
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/companies/ocp-group",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OCPGroupPage />
    </>
  );
}

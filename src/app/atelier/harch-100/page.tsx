import type { Metadata } from "next";
import Harch100Page from "./Harch100Page";

export const metadata: Metadata = {
  title: "Harch 100 — Morocco's Most Reputable Companies",
  description: "AI-powered reputation ranking of Morocco's top 100 companies. Based on media sentiment, AI visibility, and social mentions across 30+ sources.",
  alternates: { canonical: "https://atelier.harchcorp.com/harch-100" },
  openGraph: {
    title: "Harch 100 — Morocco's Most Reputable Companies",
    description: "AI-powered reputation ranking of Morocco's top 100 companies.",
    url: "https://atelier.harchcorp.com/harch-100",
    type: "website",
  },
};

// ─── JSON-LD: ItemList (Top 10 companies) ───────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Harch 100 — Morocco's Most Reputable Companies",
  description:
    "AI-powered reputation ranking of Morocco's top 100 companies. Based on media sentiment, AI visibility, and social mentions across 30+ sources.",
  url: "https://atelier.harchcorp.com/harch-100",
  numberOfItems: 10,
  itemListOrder: "https://schema.org/ItemListOrderDescending",
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "OCP Group",
      url: "https://atelier.harchcorp.com/atelier/companies/ocp-group",
      description:
        "Mining & Phosphates · Reputation Score 91/100 · 342 articles · 31% share of voice · cited by 4/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Attijariwafa Bank",
      url: "https://atelier.harchcorp.com/atelier/companies/attijariwafa-bank",
      description:
        "Banking · Reputation Score 84/100 · 287 articles · 27% share of voice · cited by 4/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Maroc Telecom",
      url: "https://atelier.harchcorp.com/atelier/companies/maroc-telecom",
      description:
        "Telecommunications · Reputation Score 79/100 · 245 articles · 24% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Royal Air Maroc",
      url: "https://atelier.harchcorp.com/atelier/companies/royal-air-maroc",
      description:
        "Aviation · Reputation Score 76/100 · 198 articles · 19% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Inwi",
      url: "https://atelier.harchcorp.com/harch-100",
      description:
        "Telecommunications · Reputation Score 74/100 · 176 articles · 18% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Bank of Africa",
      url: "https://atelier.harchcorp.com/atelier/companies/bank-of-africa",
      description:
        "Banking · Reputation Score 72/100 · 247 articles · 22% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 7,
      name: "CIH Bank",
      url: "https://atelier.harchcorp.com/harch-100",
      description:
        "Banking · Reputation Score 68/100 · 145 articles · 14% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 8,
      name: "Managem",
      url: "https://atelier.harchcorp.com/harch-100",
      description:
        "Mining · Reputation Score 66/100 · 112 articles · 12% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 9,
      name: "LesieurCristal",
      url: "https://atelier.harchcorp.com/harch-100",
      description:
        "Agro-industry · Reputation Score 64/100 · 89 articles · 10% share of voice · cited by 3/4 AI engines.",
    },
    {
      "@type": "ListItem",
      position: 10,
      name: "Cosumar",
      url: "https://atelier.harchcorp.com/harch-100",
      description:
        "Sugar · Reputation Score 62/100 · 76 articles · 9% share of voice · cited by 3/4 AI engines.",
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Harch100Page />
    </>
  );
}

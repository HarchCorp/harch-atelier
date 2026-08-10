import type { Metadata } from "next";
import Harch100Page from "./Harch100Page";

export const metadata: Metadata = {
  title: "Harch 100 — Le classement mensuel des 100 entreprises marocaines",
  description:
    "Le classement mensuel des 100 entreprises marocaines les mieux perçues. Score de réputation IA basé sur 30+ sources médias, sentiment Darija/FR/AR, visibilité sur 9 LLM.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/harch-100" },
  openGraph: {
    title: "Harch 100 — Le classement mensuel des 100 entreprises marocaines",
    description:
      "Score de réputation IA basé sur 30+ sources médias, sentiment Darija/FR/AR et visibilité sur 9 LLM. Mis à jour mensuellement.",
    url: "https://atelier.harchcorp.com/atelier/harch-100",
    type: "website",
  },
};

// ─── JSON-LD: ItemList (top 10 published companies) ────────────
// Static schema for SEO crawlers — describes the Harch 100 ranking.
// Detailed positions populate dynamically when a snapshot is published.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Harch 100 — Classement mensuel des entreprises marocaines",
  description:
    "Le classement mensuel des 100 entreprises marocaines les mieux perçues, calculé à partir de 30+ sources médias, d'analyse de sentiment Darija/FR/AR et de la visibilité sur 9 moteurs IA.",
  url: "https://atelier.harchcorp.com/atelier/harch-100",
  itemListOrder: "https://schema.org/ItemListOrderDescending",
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
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

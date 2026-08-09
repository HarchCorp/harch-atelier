import type { Metadata } from "next";
import PricingPage from "./PricingPage";

export const metadata: Metadata = {
  title: "Tarifs — Harch Atelier",
  description:
    "Quatre plans sur devis : Essentiel, Pro, Grandes Entreprises, Agences. Matrice de comparaison 24 critères × 4 plans. Conformité CNDP, Loi 09-08, SHA-256.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/pricing",
  },
};

export default function Page() {
  return <PricingPage />;
}

import type { Metadata } from "next";
import SolutionsPage from "./SolutionsPage";

export const metadata: Metadata = {
  title: "Solutions — Harch Atelier",
  description:
    "Quatre problèmes. Une plateforme. Veille médiatique, social listening, visibilité IA, relations médias, marketing d'influence. Cas d'usage et comparatif Harch vs RP traditionnel.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/solutions",
  },
};

export default function Page() {
  return <SolutionsPage />;
}

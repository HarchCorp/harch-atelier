import type { Metadata } from "next";
import ProductHubPage from "./ProductHubPage";

export const metadata: Metadata = {
  title: "Produits — Harch Atelier",
  description:
    "Choisissez votre plan. Quatre offres sur devis : Essentiel, Pro, Grandes Entreprises, Agences. Lien direct vers le Harch 100 et le contact commercial.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/products",
  },
};

export default function Page() {
  return <ProductHubPage />;
}

import type { Metadata } from "next";
import AboutPage from "./AboutPage";

export const metadata: Metadata = {
  title: "About — Harch Atelier",
  description:
    "Harch Atelier — L'intelligence réputationnelle pour le Maroc. 20+ sources, 7 753 articles analysés, 8 crises documentées, 9 LLM testés. Basés à Casablanca, building in public depuis 2026.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/about",
  },
};

export default function Page() {
  return <AboutPage />;
}

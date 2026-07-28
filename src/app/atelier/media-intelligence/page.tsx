import type { Metadata } from "next";
import MediaIntelligencePage from "./MediaIntelligencePage";

export const metadata: Metadata = {
  title: { absolute: "2026 Media Intelligence Report — Moroccan Corporate Reputation | Harch Atelier" },
  description: "The state of Moroccan corporate reputation in 2026. 61,218 articles analyzed across 30+ media sources. Top 10 trends, 6 industry profiles, 3 company spotlights.",
  alternates: { canonical: "https://atelier.harchcorp.com/media-intelligence" },
  openGraph: {
    title: "2026 Media Intelligence Report | Harch Atelier",
    description: "The state of Moroccan corporate reputation in 2026.",
    url: "https://atelier.harchcorp.com/media-intelligence",
    type: "article",
  },
};

export default function Page() {
  return <MediaIntelligencePage />;
}

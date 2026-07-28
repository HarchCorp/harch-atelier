import type { Metadata } from "next";
import AviationIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Aviation Industry Reputation Report — Royal Air Maroc | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's aviation sector: Royal Air Maroc tracked across 892 data points and 32 risk categories. RAM scores 76/100 — Tier 2, lifted by oneworld alliance and African expansion, weighed by labour disputes.",
  keywords: [
    "Royal Air Maroc reputation",
    "RAM reputation score",
    "Morocco aviation industry",
    "RAM oneworld alliance",
    "Royal Air Maroc safety",
    "RAM labour dispute cabin crew",
    "Morocco aviation ESG SAF",
    "RAM African expansion",
    "Casablanca aviation hub",
    "Harch aviation industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/industries/aviation" },
  openGraph: {
    title: "Aviation Industry Reputation Report — Royal Air Maroc",
    description:
      "892 data points, 32 risk categories. Royal Air Maroc scores 76/100 — Tier 2, lifted by oneworld alliance and African expansion, weighed by labour disputes.",
    type: "article",
    url: "https://atelier.harchcorp.com/industries/aviation",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aviation Industry Reputation Report — Morocco",
    description:
      "892 data points. Royal Air Maroc scores 76/100 — Tier 2. Safety incident (70) and labour dispute (57) top the risk register.",
  },
};

export default function Page() {
  return <AviationIndustryPage />;
}

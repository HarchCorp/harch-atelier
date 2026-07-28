import type { Metadata } from "next";
import RetailIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Retail Industry Reputation Report — Marjane, Label'Vie | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's retail sector: 2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat (70) and product recall (62) top the risk register.",
  keywords: [
    "Marjane Group reputation",
    "Label'Vie reputation",
    "Morocco retail reputation",
    "Carrefour Maroc reputation",
    "Morocco retail boycott risk",
    "Morocco retail ESG",
    "Morocco supermarket industry",
    "Marjane digital transformation",
    "Morocco retail consumer protection",
    "Harch retail industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/industries/retail" },
  openGraph: {
    title: "Retail Industry Reputation Report — Marjane, Label'Vie",
    description:
      "2 majors, 1,256 data points, 32 risk categories. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat and product recall top the risk register.",
    type: "article",
    url: "https://atelier.harchcorp.com/industries/retail",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Retail Industry Reputation Report — Morocco",
    description:
      "2 majors, 1,256 data points. Industry avg 58/100 — the lowest in our Moroccan universe. Brand reputation threat (70) and product recall (62) top the risk register.",
  },
};

export default function Page() {
  return <RetailIndustryPage />;
}

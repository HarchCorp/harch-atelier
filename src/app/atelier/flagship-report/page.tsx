import type { Metadata } from "next";
import FlagshipReportPage from "./FlagshipReportPage";

export const metadata: Metadata = {
  title: { absolute: "Morocco Reputation Intelligence Report 2026 — The Biggest Report | Harch Atelier" },
  description:
    "The most comprehensive analysis of Moroccan corporate reputation ever produced. 8 companies, 20 real people, 1,858 articles, 416 weekly sentiment snapshots, 3,726 BVC price records, 25 risk assessments — across a full 365-day window.",
  keywords: [
    "Morocco reputation intelligence report 2026",
    "Harch Atelier flagship report",
    "OCP Group reputation",
    "Attijariwafa Bank reputation",
    "Bank of Africa reputation",
    "Maroc Telecom reputation",
    "Royal Air Maroc reputation",
    "Moroccan corporate reputation ranking",
    "Harch 100 ranking 2026",
    "BVC market performance 2026",
    "Moroccan media sentiment analysis",
    "AI visibility Morocco",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/flagship-report" },
  openGraph: {
    title: "Morocco Reputation Intelligence Report 2026",
    description:
      "The most comprehensive analysis of Moroccan corporate reputation ever produced. 8 companies, 20 real people, 1,858 articles, 365-day window.",
    type: "article",
    url: "https://atelier.harchcorp.com/atelier/flagship-report",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Morocco Reputation Intelligence Report 2026",
    description: "8 companies · 20 real people · 1,858 articles · 416 sentiment snapshots · 3,726 BVC prices",
  },
};

export default function Page() {
  return <FlagshipReportPage />;
}

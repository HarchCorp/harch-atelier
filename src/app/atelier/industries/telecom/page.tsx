import type { Metadata } from "next";
import TelecomIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Telecom Industry Reputation Report — 3 Moroccan Operators Tracked | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's telecom sector: 3 operators, 1,124 data points, 32 risk categories. Maroc Telecom leads at 79/100. Cyber attack (80) and data breach (70) top the risk register.",
  keywords: [
    "Morocco telecom reputation",
    "Maroc Telecom reputation score",
    "Inwi reputation",
    "Orange Maroc reputation",
    "Morocco 5G rollout",
    "Morocco telecom cyber risk",
    "ANRT regulation telecom",
    "Morocco telecom ESG digital inclusion",
    "telecom data breach Morocco",
    "Harch telecom industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/industries/telecom" },
  openGraph: {
    title: "Telecom Industry Reputation Report — 3 Moroccan Operators Tracked",
    description:
      "3 operators, 1,124 data points, 32 risk categories. Maroc Telecom leads at 79/100. Cyber attack and data breach are the top reputational risks for Moroccan telecom.",
    type: "article",
    url: "https://atelier.harchcorp.com/industries/telecom",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Telecom Industry Reputation Report — Morocco",
    description:
      "3 operators, 1,124 data points. Maroc Telecom leads at 79/100. Cyber attack (80) and data breach (70) top the risk register.",
  },
};

export default function Page() {
  return <TelecomIndustryPage />;
}

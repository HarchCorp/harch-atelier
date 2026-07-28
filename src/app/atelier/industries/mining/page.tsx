import type { Metadata } from "next";
import MiningIndustryPage from "./IndustryPage";

export const metadata: Metadata = {
  title: { absolute: "Mining & Phosphates Industry Reputation Report — OCP, Managem | Harch Atelier" },
  description:
    "Real-time reputation intelligence for Morocco's mining & phosphates sector: 2 majors, 1,486 data points, 32 risk categories. OCP Group leads at 91/100. Operational accident (78) and pollution incident (70) top the risk register.",
  keywords: [
    "OCP Group reputation score",
    "Morocco mining reputation",
    "Managem reputation",
    "Morocco phosphate industry",
    "green ammonia Morocco OCP",
    "sustainable phosphate Morocco",
    "Morocco mining ESG",
    "CBAM fertilizer Morocco",
    "OCP Group Jorf Lasfar",
    "Harch mining industry report",
  ],
  alternates: { canonical: "https://atelier.harchcorp.com/industries/mining" },
  openGraph: {
    title: "Mining & Phosphates Industry Reputation Report — Morocco",
    description:
      "2 majors, 1,486 data points, 32 risk categories. OCP Group leads at 91/100 — the highest in our Moroccan corporate universe. Operational accident and pollution incident top the risk register.",
    type: "article",
    url: "https://atelier.harchcorp.com/industries/mining",
    siteName: "Harch Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mining & Phosphates Industry Reputation Report — Morocco",
    description:
      "2 majors, 1,486 data points. OCP Group leads at 91/100. Operational accident (78) and pollution incident (70) top the risk register.",
  },
};

export default function Page() {
  return <MiningIndustryPage />;
}

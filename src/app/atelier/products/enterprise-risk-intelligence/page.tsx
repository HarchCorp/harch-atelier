import type { Metadata } from "next";
import EnterpriseRiskIntelligencePage from "./EnterpriseRiskIntelligencePage";

export const metadata: Metadata = {
  title: { absolute: "Enterprise Risk Intelligence — Anticipate. Protect. Act. | Harch Atelier" },
  description: "Improve business resilience with structured external risk sensing. 32 risk categories, 226+ markets, real-time alerts. Early warning, ongoing surveillance, strategic planning.",
  alternates: { canonical: "https://atelier.harchcorp.com/products/enterprise-risk-intelligence" },
  openGraph: {
    title: "Enterprise Risk Intelligence — Harch Atelier",
    description: "AI-powered external risk sensing and monitoring. Anticipate, protect, act.",
    url: "https://atelier.harchcorp.com/products/enterprise-risk-intelligence",
    type: "website",
  },
};

export default function Page() {
  return <EnterpriseRiskIntelligencePage />;
}

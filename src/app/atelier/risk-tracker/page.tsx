import type { Metadata } from "next";
import RiskTrackerPage from "./RiskTrackerPage";

export const metadata: Metadata = {
  title: { absolute: "Risk Tracker — Industry Risk Dashboard | Harch Atelier" },
  description: "Real-time risk monitoring across industries. Track 32 risk event categories — geopolitical, operational, financial, environmental, legal, consumer, technology — with AI-powered predictive scoring.",
  alternates: { canonical: "https://atelier.harchcorp.com/risk-tracker" },
  openGraph: {
    title: "Risk Tracker — Industry Risk Dashboard | Harch Atelier",
    description: "Real-time risk monitoring across industries. 32 risk categories, predictive scoring (Frequency × Impact × Velocity).",
    url: "https://atelier.harchcorp.com/risk-tracker",
    type: "website",
  },
};

export default function Page() {
  return <RiskTrackerPage />;
}

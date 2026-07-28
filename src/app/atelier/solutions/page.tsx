import type { Metadata } from "next";
import SolutionsPage from "./SolutionsPage";

export const metadata: Metadata = {
  title: { absolute: "Solutions — Corporate Narrative, Threat Sensing, Benchmarking, Media Monitoring | Harch Atelier" },
  description: "Actionable insights that answer big PR questions. Four AI-powered solutions: Corporate Narrative Planning, Reputational Threat Sensing, Benchmarking & Measurement, Media Monitoring.",
  alternates: { canonical: "https://atelier.harchcorp.com/solutions" },
  openGraph: {
    title: "Solutions — Harch Atelier",
    description: "Four AI-powered reputation intelligence solutions for Comms leaders.",
    url: "https://atelier.harchcorp.com/solutions",
    type: "website",
  },
};

export default function Page() {
  return <SolutionsPage />;
}

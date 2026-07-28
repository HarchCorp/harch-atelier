import type { Metadata } from "next";
import ComparePage from "./ComparePage";

export const metadata: Metadata = {
  title: { absolute: "Company Comparison Tool — Side-by-Side | Harch Atelier" },
  description: "Compare up to 3 Moroccan companies side-by-side across reputation score, sentiment, risk profile, pillars, and quarterly trends. Interactive radar charts and metrics table.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/compare" },
  openGraph: {
    title: "Company Comparison Tool — Harch Atelier",
    description: "Compare Moroccan companies side-by-side across all reputation metrics.",
    url: "https://atelier.harchcorp.com/atelier/compare",
    type: "website",
  },
};

export default function Page() {
  return <ComparePage />;
}

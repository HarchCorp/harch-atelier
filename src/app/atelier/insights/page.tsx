import type { Metadata } from "next";
import InsightsPage from "./InsightsPage";

export const metadata: Metadata = {
  title: { absolute: "Insights — Whitepapers, Reports, Tools | Harch Atelier" },
  description: "Whitepapers, media intelligence reports, case studies, methodology, and interactive tools for Comms leaders who put reputation first.",
  alternates: { canonical: "https://atelier.harchcorp.com/insights" },
};

export default function Page() {
  return <InsightsPage />;
}

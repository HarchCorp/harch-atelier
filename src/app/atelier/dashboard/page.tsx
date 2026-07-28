import type { Metadata } from "next";
import DashboardPage from "./DashboardPage";

export const metadata: Metadata = {
  title: "Live Dashboard — AI Reputation Monitoring",
  description: "Real-time reputation dashboard. Sentiment trends, media coverage, AI visibility, competitor benchmarking, crisis alerts.",
  alternates: { canonical: "https://atelier.harchcorp.com/dashboard" },
};

export default function Page() {
  return <DashboardPage />;
}

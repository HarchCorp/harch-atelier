import type { Metadata } from "next";
import ReputationDashboardsPage from "./ReputationDashboardsPage";

export const metadata: Metadata = {
  title: { absolute: "Reputation Dashboards — AI-Powered Brand Health | Harch Atelier" },
  description: "AI-powered interactive dashboards for monitoring brand reputation and competitive analysis. Scoring methodology, materiality matrix, anomaly detection, industry rankings.",
  alternates: { canonical: "https://atelier.harchcorp.com/products/reputation-dashboards" },
  openGraph: {
    title: "Reputation Dashboards — Harch Atelier",
    description: "AI-powered interactive dashboards for brand health and competitive analysis.",
    url: "https://atelier.harchcorp.com/products/reputation-dashboards",
    type: "website",
  },
};

export default function Page() {
  return <ReputationDashboardsPage />;
}

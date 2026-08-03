import type { Metadata } from "next";
import HealthDashboardPage from "./HealthDashboardPage";

export const metadata: Metadata = {
  title: { absolute: "System Health — Harch Atelier" },
  description: "Real-time platform health monitoring for Harch Atelier.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/health" },
};

export default function Page() {
  return <HealthDashboardPage />;
}

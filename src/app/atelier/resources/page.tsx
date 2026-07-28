import type { Metadata } from "next";
import ResourcesPage from "./ResourcesPage";

export const metadata: Metadata = {
  title: { absolute: "Resources — Whitepapers, Reports, Tools | Harch Atelier" },
  description: "Whitepapers, media intelligence reports, case studies, methodology deep-dives, and interactive tools for Comms leaders.",
  alternates: { canonical: "https://atelier.harchcorp.com/resources" },
};

export default function Page() {
  return <ResourcesPage />;
}

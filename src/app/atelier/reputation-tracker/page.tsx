import type { Metadata } from "next";
import ReputationTrackerPage from "./ReputationTrackerPage";

export const metadata: Metadata = {
  title: { absolute: "Reputation Tracker — Top Moroccan Companies Ranked | Harch Atelier" },
  description: "Real-time reputation tracking of Morocco's top companies. Sort by score, sentiment, AI visibility, share of voice. Daily refresh, 100 companies tracked.",
  alternates: { canonical: "https://atelier.harchcorp.com/reputation-tracker" },
};

export default function Page() {
  return <ReputationTrackerPage />;
}

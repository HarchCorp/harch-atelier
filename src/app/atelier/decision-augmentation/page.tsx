import type { Metadata } from "next";
import DecisionAugmentationPage from "./DecisionAugmentationPage";

export const metadata: Metadata = {
  title: { absolute: "Decision Augmentation — The New Era of Reputation-Based Decision Making | Harch Atelier" },
  description: "85% of C-suite leaders prioritize reputation over profit margin. HarchIQ augments Comms leaders' decision-making by making sense of vast data volumes — surfacing insights, warnings, and opportunities before you have to ask.",
  alternates: { canonical: "https://atelier.harchcorp.com/decision-augmentation" },
  openGraph: {
    title: "Decision Augmentation | Harch Atelier",
    description: "The new era of reputation-based decision making. Powered by HarchIQ.",
    url: "https://atelier.harchcorp.com/decision-augmentation",
    type: "website",
  },
};

export default function Page() {
  return <DecisionAugmentationPage />;
}

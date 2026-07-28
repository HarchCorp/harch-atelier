import type { Metadata } from "next";
import AskHarchIQPage from "./AskHarchIQPage";

export const metadata: Metadata = {
  title: { absolute: "Ask HarchIQ — Conversational Reputation Intelligence | Harch Atelier" },
  description: "Ask HarchIQ anything about Moroccan or African company reputation. Instant answers on scores, sentiment, risks, narratives, AI visibility, and competitor benchmarks.",
  alternates: { canonical: "https://atelier.harchcorp.com/ask-harchiq" },
};

export default function Page() {
  return <AskHarchIQPage />;
}

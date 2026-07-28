import type { Metadata } from "next";
import OurDataPage from "./OurDataPage";

export const metadata: Metadata = {
  title: { absolute: "Our Data — 30+ Sources, 5M+ Articles/Day | Harch Atelier" },
  description: "The most comprehensive Moroccan & African media dataset. 30+ sources, 5M+ articles/day, 100M+ entities labeled daily. FR/AR/EN trilingual NLP.",
  alternates: { canonical: "https://atelier.harchcorp.com/approach/our-data" },
};

export default function Page() {
  return <OurDataPage />;
}

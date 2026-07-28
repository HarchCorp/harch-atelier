import type { Metadata } from "next";
import { ExpertisePage } from "../ExpertisePageTemplate";
import { EXPERTISE_DATA } from "../expertiseData";

export const metadata: Metadata = {
  title: { absolute: "Reputation Risk Expertise | Harch Atelier" },
  description: "Monitor narrative drift, sentiment swings, and emerging threats to your reputation. 5 narratives tracked per company, 10 topic clusters, trilingual sentiment analysis.",
  alternates: { canonical: "https://atelier.harchcorp.com/expertise/reputation-risk" },
};

export default function Page() {
  return <ExpertisePage data={EXPERTISE_DATA["reputation-risk"]} />;
}

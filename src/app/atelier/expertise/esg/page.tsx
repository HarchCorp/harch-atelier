import type { Metadata } from "next";
import { ExpertisePage } from "../ExpertisePageTemplate";
import { EXPERTISE_DATA } from "../expertiseData";

export const metadata: Metadata = {
  title: { absolute: "ESG Expertise | Harch Atelier" },
  description: "Track sustainability narratives, greenwashing risks, and investor sentiment. 3 ESG pillars, 9 themes, real-time greenwashing risk alerts, quarterly ESG perception reports.",
  alternates: { canonical: "https://atelier.harchcorp.com/expertise/esg" },
};

export default function Page() {
  return <ExpertisePage data={EXPERTISE_DATA["esg"]} />;
}

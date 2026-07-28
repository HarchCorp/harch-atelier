import type { Metadata } from "next";
import { ExpertisePage } from "../ExpertisePageTemplate";
import { EXPERTISE_DATA } from "../expertiseData";

export const metadata: Metadata = {
  title: { absolute: "Enterprise Risk Expertise | Harch Atelier" },
  description: "32 risk categories. 6 industries. Real-time detection with Frequency × Impact × Velocity scoring. Predictive, not reactive — identify emerging threats before they materialize.",
  alternates: { canonical: "https://atelier.harchcorp.com/expertise/enterprise-risk" },
};

export default function Page() {
  return <ExpertisePage data={EXPERTISE_DATA["enterprise-risk"]} />;
}

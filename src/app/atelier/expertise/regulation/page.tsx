import type { Metadata } from "next";
import { ExpertisePage } from "../ExpertisePageTemplate";
import { EXPERTISE_DATA } from "../expertiseData";

export const metadata: Metadata = {
  title: { absolute: "Regulation Expertise | Harch Atelier" },
  description: "Stay ahead of regulatory changes across Morocco & Africa. 12+ Moroccan regulators tracked, 8 African jurisdictions, real-time change alerts, quarterly compliance impact reports.",
  alternates: { canonical: "https://atelier.harchcorp.com/expertise/regulation" },
};

export default function Page() {
  return <ExpertisePage data={EXPERTISE_DATA["regulation"]} />;
}

import type { Metadata } from "next";
import { ExpertisePage } from "../ExpertisePageTemplate";
import { EXPERTISE_DATA } from "../expertiseData";

export const metadata: Metadata = {
  title: { absolute: "PR & Comms Expertise | Harch Atelier" },
  description: "Augment your Comms team with real-time intelligence. 40 hours saved per week. Board-ready PDF reports. Daily WhatsApp digests. From tactical delivery to strategic influence.",
  alternates: { canonical: "https://atelier.harchcorp.com/expertise/pr-comms" },
};

export default function Page() {
  return <ExpertisePage data={EXPERTISE_DATA["pr-comms"]} />;
}

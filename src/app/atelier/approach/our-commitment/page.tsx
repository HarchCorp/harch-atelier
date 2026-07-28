import type { Metadata } from "next";
import OurCommitmentPage from "./OurCommitmentPage";

export const metadata: Metadata = {
  title: { absolute: "Our Commitment — Security, Compliance, Customer Success | Harch Atelier" },
  description: "GDPR & Loi 09-08 compliant. 99.9% uptime SLA. 24/7 incident response. Money-back guarantee. 7-day onboarding. Quarterly business reviews.",
  alternates: { canonical: "https://atelier.harchcorp.com/approach/our-commitment" },
};

export default function Page() {
  return <OurCommitmentPage />;
}

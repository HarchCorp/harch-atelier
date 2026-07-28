import type { Metadata } from "next";
import LegalPage from "./LegalPage";

export const metadata: Metadata = {
  title: { absolute: "Legal — Terms, Privacy, DPA, SLA | Harch Atelier" },
  description: "Terms of Service, Privacy Policy, DPA, Sub-Processor List, Acceptable Use, SLA, Cookie Policy. All legal documents in one place.",
  alternates: { canonical: "https://atelier.harchcorp.com/legal" },
};

export default function Page() {
  return <LegalPage />;
}

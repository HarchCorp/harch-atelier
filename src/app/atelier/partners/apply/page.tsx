import type { Metadata } from "next";
import PartnerRegistration from "../PartnerRegistration";

export const metadata: Metadata = {
  title: "Devenir partenaire — Harch Atelier",
  robots: { index: false, follow: false },
};

export default function ApplyPage() {
  return <PartnerRegistration />;
}

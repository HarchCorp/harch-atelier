import type { Metadata } from "next";
import PartnersPage from "./PartnersPage";

export const metadata: Metadata = {
  title: { absolute: "Partners — Agencies, Tech, Strategic, Referral | Harch Atelier" },
  description: "Four partnership models: PR agencies (20% commission), tech partners (API + MCP), strategic allies (research), referral partners (15% commission).",
  alternates: { canonical: "https://atelier.harchcorp.com/partners" },
};

export default function Page() {
  return <PartnersPage />;
}

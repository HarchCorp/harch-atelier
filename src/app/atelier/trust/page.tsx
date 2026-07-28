import type { Metadata } from "next";
import TrustPage from "./TrustPage";

export const metadata: Metadata = {
  title: { absolute: "Trust Center — Security & Compliance | Harch Atelier" },
  description: "GDPR, Loi 09-08 compliant. SOC 2 in progress. 99.9% uptime SLA. 24/7 incident response. How Harch AI protects your reputation data.",
  alternates: { canonical: "https://atelier.harchcorp.com/trust" },
  openGraph: {
    title: "Trust Center | Harch Atelier",
    description: "Security and compliance at Harch AI.",
    url: "https://atelier.harchcorp.com/trust",
    type: "website",
  },
};

export default function Page() {
  return <TrustPage />;
}

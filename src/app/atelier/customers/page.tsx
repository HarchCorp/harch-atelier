import type { Metadata } from "next";
import CustomersPage from "./CustomersPage";

export const metadata: Metadata = {
  title: { absolute: "Customers — Case Studies | Harch Atelier" },
  description: "Trusted by Comms leaders across Morocco & Africa. Banking, Telco, Mining, Public Sector. Real customers, real results.",
  alternates: { canonical: "https://atelier.harchcorp.com/customers" },
  openGraph: {
    title: "Customers — Harch Atelier",
    description: "Case studies from Moroccan and African enterprises using Harch AI.",
    url: "https://atelier.harchcorp.com/customers",
    type: "website",
  },
};

export default function Page() {
  return <CustomersPage />;
}

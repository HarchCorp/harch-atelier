import type { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: { absolute: "Contact — Sales, Support, Security, Press | Harch Atelier" },
  description: "Talk to our team. Sales demos, customer support, security inquiries, press, partnerships, and careers. Offices in Casablanca, Rabat, and Paris.",
  alternates: { canonical: "https://atelier.harchcorp.com/contact" },
};

export default function Page() {
  return <ContactPage />;
}

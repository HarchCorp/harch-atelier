import type { Metadata } from "next";
import ContactPage from "./ContactPage";

export const metadata: Metadata = {
  title: { absolute: "Contact — Sales, Support, Security, Press | Harch Atelier" },
  description:
    "Talk to our team. Sales demos, customer support, security inquiries, press, partnerships, and careers. Offices in Casablanca, Rabat, and Paris.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/contact" },
  openGraph: {
    title: "Contact — Sales, Support, Security, Press | Harch Atelier",
    description:
      "Talk to our team. Sales demos, customer support, security inquiries, press, partnerships, and careers. Offices in Casablanca, Rabat, and Paris.",
    type: "website",
    url: "https://atelier.harchcorp.com/atelier/contact",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Sales, Support, Security, Press | Harch Atelier",
    description:
      "Talk to our team. Sales demos, customer support, security inquiries, press, partnerships, and careers.",
  },
};

// ─── JSON-LD: ContactPage + Organization (LocalBusiness) ─────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ContactPage",
      name: "Contact Harch Atelier",
      url: "https://atelier.harchcorp.com/atelier/contact",
      description:
        "Sales demos, customer support, security inquiries, press, partnerships, and careers.",
      mainEntity: {
        "@type": "Organization",
        "@id": "https://atelier.harchcorp.com/#organization",
        name: "Harch Atelier",
        url: "https://atelier.harchcorp.com",
        email: "atelier@harchcorp.com",
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "sales",
            email: "atelier@harchcorp.com",
            areaServed: ["Morocco", "Africa"],
            availableLanguage: ["English", "French", "Arabic"],
          },
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "support@harchcorp.com",
            availableLanguage: ["English", "French", "Arabic"],
          },
          {
            "@type": "ContactPoint",
            contactType: "press",
            email: "press@harchcorp.com",
          },
        ],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Casablanca",
          addressCountry: "MA",
        },
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactPage />
    </>
  );
}

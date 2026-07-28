import type { Metadata } from "next";
import AuditPage from "./AuditPage";

// ─── AUDIT PAGE SEO ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "Free Reputation Audit — 5 Minutes, No Credit Card | Harch Atelier",
  },
  description:
    "Get a free 15-page reputation audit. 200+ media articles analyzed, sentiment breakdown, AI visibility check, competitor benchmark. Delivered in 7 days.",
  keywords: [
    "free reputation audit",
    "reputation report Morocco",
    "AI visibility check",
    "media sentiment audit",
    "competitor benchmark",
    "board-ready PDF",
    "no credit card required",
    "7-day audit delivery",
    "WhatsApp digest trial",
    "Harch Atelier audit",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/audit",
  },
  openGraph: {
    title: "Free Reputation Audit — 5 Minutes, No Credit Card | Harch Atelier",
    description:
      "Get a free 15-page reputation audit. 200+ media articles analyzed, sentiment breakdown, AI visibility check, competitor benchmark. Delivered in 7 days.",
    type: "website",
    url: "https://atelier.harchcorp.com/audit",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Reputation Audit — 5 Minutes, No Credit Card | Harch Atelier",
    description:
      "Get a free 15-page reputation audit. 200+ media articles analyzed, sentiment breakdown, AI visibility check. Delivered in 7 days.",
  },
};

// ─── JSON-LD: ContactPage ────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Free Reputation Audit — Harch Atelier",
  url: "https://atelier.harchcorp.com/audit",
  description:
    "Request a free 15-page reputation audit. 200+ media articles analyzed, sentiment breakdown, AI visibility check, competitor benchmark, plus three sample WhatsApp digests. Delivered in 7 days. No credit card required.",
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
        description:
          "Request a free reputation audit. Our team responds within 1 hour by email and WhatsApp to schedule the onboarding call.",
      },
    ],
  },
  isAccessibleForFree: true,
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AuditPage />
    </>
  );
}

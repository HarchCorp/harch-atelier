import type { Metadata } from "next";
import AboutPage from "./AboutPage";

// ─── ABOUT PAGE SEO ──────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "About Harch Atelier — Building in Public Since 2026",
  },
  description:
    "AI reputation intelligence for African enterprises. Founded by Amine Harch El Korane. Building in Public from Casablanca, Morocco.",
  keywords: [
    "about Harch Atelier",
    "Amine Harch El Korane",
    "AI reputation company",
    "Casablanca startup",
    "Morocco AI company",
    "building in public",
    "Harch Corp subsidiary",
    "reputation intelligence founder",
    "African AI startup",
    "solo founder Morocco",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/about",
  },
  openGraph: {
    title: "About Harch Atelier — Building in Public Since 2026",
    description:
      "AI reputation intelligence for African enterprises. Founded by Amine Harch El Korane. Building in Public from Casablanca, Morocco.",
    type: "profile",
    url: "https://atelier.harchcorp.com/about",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Harch Atelier — Building in Public Since 2026",
    description:
      "AI reputation intelligence for African enterprises. Founded by Amine Harch El Korane. Casablanca, Morocco.",
  },
};

// ─── JSON-LD: AboutPage ──────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About Harch Atelier",
  url: "https://atelier.harchcorp.com/about",
  description:
    "AI reputation intelligence for African enterprises. Founded by Amine Harch El Korane. Building in Public from Casablanca, Morocco since 2026.",
  mainEntity: {
    "@type": "Organization",
    "@id": "https://atelier.harchcorp.com/#organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
    description:
      "AI reputation intelligence division of Harch Corp. We monitor 30+ media sources and 8 AI engines, powered by HarchIQ, our trainable AI, and deliver insights via WhatsApp, dashboard, and monthly PDF.",
    email: "atelier@harchcorp.com",
    foundingDate: "2026",
    founder: {
      "@type": "Person",
      name: "Amine Harch El Korane",
      jobTitle: "Founder",
      worksFor: {
        "@id": "https://atelier.harchcorp.com/#organization",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Casablanca",
        addressCountry: "MA",
      },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Casablanca",
      addressCountry: "MA",
    },
    areaServed: ["Morocco", "Africa"],
    parentOrganization: {
      "@type": "Organization",
      name: "Harch Corp",
      url: "https://www.harchcorp.com",
    },
    knowsAbout: [
      "AI Reputation Intelligence",
      "Sentiment Analysis",
      "Media Monitoring",
      "AI Visibility",
      "Crisis Alerts",
      "WhatsApp Intelligence Delivery",
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutPage />
    </>
  );
}

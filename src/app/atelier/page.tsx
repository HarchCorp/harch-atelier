import type { Metadata } from "next";
import AtelierHome from "./AtelierHome";

// ─── HOME PAGE SEO ───────────────────────────────────────────────
// Absolute title to bypass the layout template and avoid
// "| Harch Atelier | Harch Atelier" duplication.

export const metadata: Metadata = {
  title: {
    absolute: "Harch Atelier — AI Reputation Intelligence for Africa",
  },
  description:
    "Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports. 30+ Moroccan and African media sources.",
  keywords: [
    "AI reputation intelligence",
    "reputation monitoring Morocco",
    "sentiment analysis",
    "media monitoring Africa",
    "crisis alerts",
    "AI visibility",
    "brand reputation",
    "WhatsApp alerts",
    "Harch Atelier",
    "reputation score",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com",
  },
  openGraph: {
    title: "Harch Atelier — AI Reputation Intelligence for Africa",
    description:
      "Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports. 30+ Moroccan and African media sources.",
    type: "website",
    url: "https://atelier.harchcorp.com",
    siteName: "Harch Atelier",
    locale: "en_US",
    images: [
      {
        url: "/public/images/og-harch-corp.png",
        width: 1200,
        height: 630,
        alt: "Harch Atelier — AI Reputation Intelligence for Africa",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harch Atelier — AI Reputation Intelligence for Africa",
    description:
      "Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports.",
    images: ["/public/images/og-harch-corp.png"],
  },
};

// ─── JSON-LD: Organization + WebSite ─────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://atelier.harchcorp.com/#organization",
      name: "Harch Atelier",
      url: "https://atelier.harchcorp.com",
      logo: "https://atelier.harchcorp.com/logo.png",
      description:
        "AI Reputation Intelligence for African enterprises. Monitor 30+ media sources and 8 AI engines, powered by HarchIQ, our trainable AI, deliver insights via WhatsApp and PDF.",
      email: "atelier@harchcorp.com",
      foundingDate: "2026",
      founder: {
        "@type": "Person",
        name: "Amine Harch El Korane",
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Casablanca",
        addressCountry: "MA",
      },
      areaServed: ["Morocco", "Africa"],
      knowsAbout: [
        "AI Reputation Intelligence",
        "Sentiment Analysis",
        "Media Monitoring",
        "AI Visibility",
        "Crisis Alerts",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://atelier.harchcorp.com/#website",
      name: "Harch Atelier",
      url: "https://atelier.harchcorp.com",
      publisher: {
        "@id": "https://atelier.harchcorp.com/#organization",
      },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://atelier.harchcorp.com/faq?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
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
      <AtelierHome />
    </>
  );
}

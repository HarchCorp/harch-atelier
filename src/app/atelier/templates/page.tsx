import type { Metadata } from "next";
import TemplatesGallery from "./TemplatesGallery";

// ─── TEMPLATES PAGE SEO ──────────────────────────────────────────
// page.tsx is a server component (no "use client") so it can export
// metadata. The interactive gallery lives in ./TemplatesGallery.tsx.

export const metadata: Metadata = {
  title: {
    absolute: "Report Templates — PDF, WhatsApp, Email | Harch Atelier",
  },
  description:
    "Reusable templates for reputation reports, WhatsApp digests, and outreach emails. Teaser mode with blur for prospecting.",
  keywords: [
    "reputation report templates",
    "PDF report templates",
    "WhatsApp digest template",
    "cold outreach email template",
    "board-ready PDF",
    "report gallery",
    "teaser mode prospecting",
    "AI reputation deliverables",
    "Harch Atelier templates",
    "monitoring report format",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/templates",
  },
  openGraph: {
    title: "Report Templates — PDF, WhatsApp, Email | Harch Atelier",
    description:
      "Reusable templates for reputation reports, WhatsApp digests, and outreach emails. Teaser mode with blur for prospecting.",
    type: "website",
    url: "https://atelier.harchcorp.com/templates",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Report Templates — PDF, WhatsApp, Email | Harch Atelier",
    description:
      "Reusable templates for reputation reports, WhatsApp digests, and outreach emails. Teaser mode with blur for prospecting.",
  },
};

// ─── JSON-LD: CollectionPage ─────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Report Templates — Harch Atelier",
  url: "https://atelier.harchcorp.com/templates",
  description:
    "Reusable templates for every Harch Atelier deliverable: reputation audit PDF, cold outreach email, and daily WhatsApp digest. Data flows in from monitoring agents; templates render with real numbers. Teaser mode shows partial data with blur for prospecting.",
  isPartOf: {
    "@id": "https://atelier.harchcorp.com/#website",
  },
  publisher: {
    "@id": "https://atelier.harchcorp.com/#organization",
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Harch Atelier Template Gallery",
    numberOfItems: 3,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Reputation Audit PDF",
        description:
          "Board-ready 15-page reputation audit. Sections: executive summary, sentiment breakdown, AI visibility check, competitor benchmark, recommended actions. Renders with real client data.",
        url: "https://atelier.harchcorp.com/templates#reputation-audit",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cold Outreach Email",
        description:
          "Prospecting email template with personalized reputation score, sentiment split, emerging risk, and competitor benchmark. Designed for high reply rates with Moroccan and African enterprise comms teams.",
        url: "https://atelier.harchcorp.com/templates#cold-email",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "WhatsApp Daily Digest",
        description:
          "Structured morning digest delivered at 7:00 Casa time. Header with reputation score + delta, mention count, top topics color-coded by sentiment, and active crisis alerts. Read in 30 seconds.",
        url: "https://atelier.harchcorp.com/templates#whatsapp-daily",
      },
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
      <TemplatesGallery />
    </>
  );
}

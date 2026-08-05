import type { Metadata } from "next";
import { ResiliencePage } from "./ResiliencePage";

// ─── RESILIENCE PAGE SEO ─────────────────────────────────────────

export const metadata: Metadata = {
  title: { absolute: "Resilience Matrix — 100 Stress-Cases | Harch Atelier" },
  description:
    "Transparent catalog of the 100 critical edge cases Harch Atelier handles — Darija sarcasm, OFAC fuzzy matching, alert-storm collapse, deleted-article archival, astroturfing detection. Interactive live demos.",
  keywords: [
    "reputation intelligence edge cases",
    "Darija sentiment analysis",
    "OFAC sanctions fuzzy matching",
    "alert storm collapse",
    "astroturfing detection",
    "deleted article archival",
    "Harch Atelier resilience",
    "Moroccan media monitoring robustness",
    "reputation monitoring stress test",
    "AI reputation failure modes",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier/resilience",
  },
  openGraph: {
    title: "Resilience Matrix — 100 Stress-Cases | Harch Atelier",
    description:
      "Transparent catalog of the 100 critical edge cases Harch Atelier handles — Darija sarcasm, OFAC fuzzy matching, alert-storm collapse, deleted-article archival, astroturfing detection.",
    type: "website",
    url: "https://atelier.harchcorp.com/atelier/resilience",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resilience Matrix — 100 Stress-Cases | Harch Atelier",
    description:
      "100 critical edge cases handled: Darija sarcasm, OFAC fuzzy matching, alert-storm collapse, astroturfing detection. Interactive live demos.",
  },
};

// ─── JSON-LD: ItemList of resilience test cases ──────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Harch Atelier Resilience Matrix — 100 Stress-Cases",
  url: "https://atelier.harchcorp.com/atelier/resilience",
  description:
    "Transparent catalog of 100 critical edge cases Harch Atelier handles: Darija sarcasm, OFAC fuzzy matching, alert-storm collapse, deleted-article archival, astroturfing detection.",
  publisher: {
    "@type": "Organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
  },
  mainEntity: {
    "@type": "WebPage",
    "@id": "https://atelier.harchcorp.com/atelier/resilience",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ResiliencePage />
    </>
  );
}

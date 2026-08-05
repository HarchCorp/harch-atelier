import type { Metadata } from "next";
import BlogIndexPage from "./BlogIndexPage";

export const metadata: Metadata = {
  title: { absolute: "Blog — Insights on Reputation Intelligence | Harch Atelier" },
  description:
    "Field notes, methodology deep-dives and case studies on Moroccan and African reputation intelligence. 15 articles on reputation risk, ESG, AI visibility, regulation and PR & Comms.",
  alternates: { canonical: "https://atelier.harchcorp.com/atelier/blog" },
  openGraph: {
    title: "Harch Atelier Blog — Insights on reputation intelligence",
    description:
      "15 in-depth articles on Moroccan and African reputation intelligence: banking, ESG, AI visibility, regulation, crisis comms and methodology.",
    type: "website",
    url: "https://atelier.harchcorp.com/atelier/blog",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Harch Atelier Blog — Insights on reputation intelligence",
    description:
      "15 in-depth articles on Moroccan and African reputation intelligence: banking, ESG, AI visibility, regulation, crisis comms and methodology.",
  },
};

// ─── JSON-LD: Blog + publisher Organization ──────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Harch Atelier Blog",
  url: "https://atelier.harchcorp.com/atelier/blog",
  description:
    "Field notes, methodology deep-dives and case studies on Moroccan and African reputation intelligence.",
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    "@id": "https://atelier.harchcorp.com/#organization",
    name: "Harch Atelier",
    url: "https://atelier.harchcorp.com",
    logo: {
      "@type": "ImageObject",
      url: "https://atelier.harchcorp.com/logo.png",
    },
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogIndexPage />
    </>
  );
}

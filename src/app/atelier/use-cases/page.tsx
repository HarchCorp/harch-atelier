import type { Metadata } from "next";
import UseCasesPage from "./UseCasesPage";

// ─── USE CASES PAGE SEO ──────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "Industries We Serve — Banking, Telecom, Energy | Harch Atelier",
  },
  description:
    "AI reputation intelligence for 6 sectors: banking, telecom, energy, mining, agriculture, hospitality. Sector-specific monitoring and alerts.",
  keywords: [
    "banking reputation",
    "telecom monitoring",
    "energy sector reputation",
    "mining PR",
    "agriculture media monitoring",
    "hospitality reputation",
    "Morocco sector monitoring",
    "Africa industry intelligence",
    "sentiment analysis by sector",
    "corporate reputation",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/use-cases",
  },
  openGraph: {
    title: "Industries We Serve — Banking, Telecom, Energy | Harch Atelier",
    description:
      "AI reputation intelligence for 6 sectors: banking, telecom, energy, mining, agriculture, hospitality. Sector-specific monitoring and alerts.",
    type: "website",
    url: "https://atelier.harchcorp.com/use-cases",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Industries We Serve — Banking, Telecom, Energy | Harch Atelier",
    description:
      "AI reputation intelligence for 6 sectors: banking, telecom, energy, mining, agriculture, hospitality.",
  },
};

// ─── JSON-LD: ItemList (6 sectors) ───────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Industries Served by Harch Atelier",
  description:
    "Six sectors where AI reputation intelligence delivers measurable value: banking, telecom, energy, mining, agriculture, hospitality.",
  url: "https://atelier.harchcorp.com/use-cases",
  numberOfItems: 6,
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Banking",
      description:
        "Track media and AI engine sentiment on fees, customer service, mobile app, credit rates, and branch network across Moroccan and African banking media.",
      url: "https://atelier.harchcorp.com/use-cases#banking",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Telecom",
      description:
        "Monitor network coverage, data offers, customer service, 5G launches, and roaming reputation across regional telecom press.",
      url: "https://atelier.harchcorp.com/use-cases#telecom",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Energy",
      description:
        "Track sentiment on electricity tariffs, renewable energy, outages, solar projects, and nuclear programs across energy and business media.",
      url: "https://atelier.harchcorp.com/use-cases#energy",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Mining",
      description:
        "Monitor financial results, environmental impact, Africa expansion, CSR, and phosphate pricing narratives across mining and commodity press.",
      url: "https://atelier.harchcorp.com/use-cases#mining",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Agriculture",
      description:
        "Track sentiment on oil prices, exports, product quality, local supply chains, and drought narratives across agricultural and trade media.",
      url: "https://atelier.harchcorp.com/use-cases#agriculture",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Hospitality",
      description:
        "Monitor service quality, value-for-money, location, breakfast, and wifi reputation across travel, tourism, and lifestyle media.",
      url: "https://atelier.harchcorp.com/use-cases#hospitality",
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
      <UseCasesPage />
    </>
  );
}

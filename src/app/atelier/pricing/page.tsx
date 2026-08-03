import type { Metadata } from "next";
import PricingPage from "./PricingPage";

// ─── PRICING PAGE SEO ────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "Pricing — 15K to 75K MAD/month | Harch Atelier",
  },
  description:
    "Émergence 15K MAD/mo, Corporate 40K MAD/mo, Sovereign 75K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer. No Stripe.",
  keywords: [
    "reputation monitoring pricing",
    "AI reputation cost",
    "media monitoring Morocco price",
    "Émergence tier 15000 MAD",
    "Corporate tier 40000 MAD",
    "Sovereign tier 75000 MAD",
    "bank transfer B2B Morocco",
    "no Stripe payment",
    "monthly subscription",
    "reputation intelligence plans",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/pricing",
  },
  openGraph: {
    title: "Pricing — 15K to 75K MAD/month | Harch Atelier",
    description:
      "Émergence 15K MAD/mo, Corporate 40K MAD/mo, Sovereign 75K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer. No Stripe.",
    type: "website",
    url: "https://atelier.harchcorp.com/pricing",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — 15K to 75K MAD/month | Harch Atelier",
    description:
      "Émergence 15K MAD/mo, Corporate 40K MAD/mo, Sovereign 75K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer.",
  },
};

// ─── JSON-LD: Product with 3 tier offers ─────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Harch Atelier — AI Reputation Intelligence",
  description:
    "Monitor 30+ media sources and 8 AI engines, powered by HarchIQ, our trainable AI, deliver insights via WhatsApp, dashboard, and monthly PDF. Three tiers: Émergence, Corporate, Sovereign. Paid by bank transfer in MAD.",
  url: "https://atelier.harchcorp.com/pricing",
  brand: {
    "@type": "Brand",
    name: "Harch Atelier",
  },
  category: "AI Reputation Intelligence",
  offers: [
    {
      "@type": "Offer",
      name: "Émergence",
      price: "15000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "15000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#emergence",
      description:
        "3 brands, 30+ media sources, 8 AI engines, 60-sec crawl, daily WhatsApp digest, dashboard with 90-day history, 32-page monthly PDF, crisis alerts under 5 min, 3-competitor benchmark. No commitment.",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Corporate",
      price: "40000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "40000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#corporate",
      description:
        "All sources (Maroc + Afrique francophone + FR), 8 AI engines + custom crawl, multi-destinataires WhatsApp + Comex escalade, dashboard 365j + API, PDF mensuels + trimestriels, crise < 5min + comms playbook, sanctions screening, account manager dédié. SLA 99.5%.",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Sovereign",
      price: "75000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "75000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#sovereign",
      description:
        "Couverture globale + sources souveraines, 8 AI engines + custom fine-tune Darija/Arabe, WhatsApp souverain dédié + Comex 24/7, console illimitée + API + SSO + on-prem, rapports stratégiques sur-mesure, cellule de crise dédiée, sanctions + ESG + supply-chain, conformité Loi 09-08 + RGPD + ISO 27001. SLA 99.9%.",
      availability: "https://schema.org/InStock",
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
      <PricingPage />
    </>
  );
}

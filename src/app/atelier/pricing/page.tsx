import type { Metadata } from "next";
import PricingPage from "./PricingPage";

// ─── PRICING PAGE SEO ────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    absolute: "Pricing — 5K to 50K MAD/month | Harch Atelier",
  },
  description:
    "Starter 5K MAD/mo, Pro 15K MAD/mo, Enterprise 50K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer. No Stripe.",
  keywords: [
    "reputation monitoring pricing",
    "AI reputation cost",
    "media monitoring Morocco price",
    "Starter tier 5000 MAD",
    "Pro tier 15000 MAD",
    "Enterprise tier 50000 MAD",
    "bank transfer B2B Morocco",
    "no Stripe payment",
    "monthly subscription",
    "reputation intelligence plans",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/pricing",
  },
  openGraph: {
    title: "Pricing — 5K to 50K MAD/month | Harch Atelier",
    description:
      "Starter 5K MAD/mo, Pro 15K MAD/mo, Enterprise 50K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer. No Stripe.",
    type: "website",
    url: "https://atelier.harchcorp.com/pricing",
    siteName: "Harch Atelier",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — 5K to 50K MAD/month | Harch Atelier",
    description:
      "Starter 5K MAD/mo, Pro 15K MAD/mo, Enterprise 50K MAD/mo. WhatsApp alerts, dashboard, PDF reports. Bank transfer.",
  },
};

// ─── JSON-LD: Product with 3 tier offers ─────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Harch Atelier — AI Reputation Intelligence",
  description:
    "Monitor 30+ media sources and 8 AI engines, powered by HarchIQ, our trainable AI, deliver insights via WhatsApp, dashboard, and monthly PDF. Three tiers: Starter, Pro, Enterprise. Paid by bank transfer in MAD.",
  url: "https://atelier.harchcorp.com/pricing",
  brand: {
    "@type": "Brand",
    name: "Harch Atelier",
  },
  category: "AI Reputation Intelligence",
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "5000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "5000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#starter",
      description:
        "1 brand, 10 media sources, 3 AI engines, 5-min crawl interval, daily WhatsApp digest, live dashboard, 8-page monthly PDF, crisis alerts under 1 hour. No commitment.",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "15000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "15000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#pro",
      description:
        "3 brands, 30+ media sources, 8 AI engines, 60-sec crawl, daily WhatsApp digest, dashboard with 90-day history, 32-page monthly PDF, crisis alerts under 5 min, 3-competitor benchmark. SLA 99.5%.",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Enterprise",
      price: "50000",
      priceCurrency: "MAD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "50000",
        priceCurrency: "MAD",
        billingDuration: "P1M",
        unitCode: "MON",
      },
      url: "https://atelier.harchcorp.com/pricing#enterprise",
      description:
        "Unlimited brands and sources, custom taxonomy, 60-sec crawl, custom WhatsApp digests, dashboard with 365-day history + API, 32-page monthly + quarterly PDF, crisis alerts under 5 min + comms playbook, dedicated account manager, SLA 99.9%, on-prem option. Annual contract.",
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

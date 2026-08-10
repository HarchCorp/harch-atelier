import type { Metadata } from "next";
import FAQPage from "./FAQPage";
import { FAQS } from "./faq-data";

// ─── FAQ PAGE SEO (FR — CRAZY-8-FAQ, 52 questions) ───────────────

export const metadata: Metadata = {
  title: {
    absolute:
      "FAQ — Intelligence Réputationnelle IA | Harch Atelier",
  },
  description:
    "52 questions sur Harch Atelier : plateforme, sécurité, tarifs, méthodologie, conformité CNDP et comptes. Recherchez, filtrez par catégorie, parcourez les réponses rédigées par notre équipe produit.",
  keywords: [
    "FAQ Harch Atelier",
    "intelligence réputationnelle Maroc",
    "veille médiatique Maroc",
    "analyse sentiment darija",
    "visibilité IA ChatGPT Maroc",
    "conformité CNDP Loi 09-08",
    "hébergement souverain Maroc",
    "Harch 100 classement",
    "audit trail SHA-256",
    "tarifs veille réputationnelle",
    "alertes crise WhatsApp Maroc",
    "partenaire agence RP Maroc",
    "white-label agence",
    "annulation abonnement SaaS",
    "passkeys WebAuthn Maroc",
  ],
  alternates: {
    canonical: "https://atelier.harchcorp.com/faq",
  },
  openGraph: {
    title: "FAQ — Intelligence Réputationnelle IA | Harch Atelier",
    description:
      "52 questions sur Harch Atelier : plateforme, sécurité, tarifs, méthodologie, conformité CNDP et comptes. Réponses rédigées par notre équipe produit.",
    type: "website",
    url: "https://atelier.harchcorp.com/faq",
    siteName: "Harch Atelier",
    locale: "fr_FR",
    images: [
      {
        url: "https://atelier.harchcorp.com/images/og-harch-atelier.png",
        width: 1344,
        height: 768,
        alt: "Harch Atelier — FAQ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQ — Intelligence Réputationnelle IA | Harch Atelier",
    description:
      "52 questions sur Harch Atelier : plateforme, sécurité, tarifs, méthodologie, conformité CNDP et comptes.",
    images: ["https://atelier.harchcorp.com/images/og-harch-atelier.png"],
  },
};

// ─── JSON-LD: FAQPage (52 questions — for SEO rich results) ──────

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  name: "Harch Atelier — FAQ Intelligence Réputationnelle IA",
  url: "https://atelier.harchcorp.com/faq",
  inLanguage: "fr-FR",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    category: f.category,
    acceptedAnswer: {
      "@type": "Answer",
      text: [
        f.intro,
        f.detail?.bullets ? f.detail.bullets.join(" ") : "",
        f.detail?.note ? f.detail.note : "",
      ]
        .filter(Boolean)
        .join(" — "),
    },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQPage />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { CursorGlow } from "@/components/CursorGlow";
import { ClientLayout } from "@/components/ClientLayout";
import { LanguageDetector } from "@/components/LanguageDetector";
import { TopNavBarWithSidebar } from "@/components/TopNavBarWithSidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

// Generate locale-aware metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isFr = locale === 'fr';

  const title = isFr
    ? "Harch Corp | IA, Infrastructure et Logiciel — Maroc"
    : "Harch Corp | AI, Infrastructure & Software — Morocco";
  const description = isFr
    ? "Harch Corp build l'infrastructure digitale de l'Afrique depuis Casablanca. Visibilité IA (GEO/AEO), logiciel sur mesure propulsé par GLM-4, cloud GPU souverain, énergie renouvelable. Building in Public depuis 2024."
    : "Harch Corp builds Africa's digital infrastructure from Casablanca. AI search visibility (GEO/AEO), custom software powered by GLM-4, sovereign GPU cloud, renewable energy. Building in Public since 2024.";
  const ogDescription = isFr
    ? "Harch Corp — Casablanca, Maroc. Visibilité IA (GEO/AEO), logiciel GLM-4, cloud GPU souverain. Building in Public depuis 2024. Contactez-nous au +212 684 440 682."
    : "Harch Corp — Casablanca, Morocco. AI search visibility (GEO/AEO), GLM-4 software, sovereign GPU cloud. Building in Public since 2024. Contact us at +212 684 440 682.";
  const twitterDescription = isFr
    ? "Visibilité IA (GEO/AEO) | Logiciel GLM-4 | Cloud GPU souverain | Building in Public | Casablanca, Maroc"
    : "AI search visibility (GEO/AEO) | GLM-4 software | Sovereign GPU cloud | Building in Public | Casablanca, Morocco";

  return {
    metadataBase: new URL("https://www.harchcorp.com"),
    title: {
      default: title,
      template: `%s | Harch Corp`,
    },
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
      shortcut: [{ url: "/favicon.ico" }],
    },
    robots: {
      index: true,
      follow: true,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    },
    other: {
      ...(process.env.GOOGLE_SITE_VERIFICATION
        ? { 'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION }
        : {}),
    },
    keywords: isFr
      ? ["Harch Corp", "souveraineté industrielle Afrique", "centre de données Afrique", "IA souveraine", "centre de données IA Maroc", "cloud GPU conscient du carbone", "planification consciente du carbone", "énergie renouvelable Maroc", "infrastructure industrielle", "conglomérat Maroc", "énergie renouvelable Afrique", "fabrication ciment Gambie", "mines stratégiques Maroc", "agriculture de précision Sahel", "dessalement eau Afrique", "technologie souveraine", "cloud GPU vert", "calcul faible intensité carbone", "centre de données Dakhla", "Dakhla 500 MW", "centre de données vert Afrique"]
      : ["Harch Corp", "Africa industrial sovereignty", "Data Center Africa", "Sovereign AI", "AI data center Morocco", "carbon-aware GPU cloud", "carbon-aware scheduling", "Renewable Energy Morocco", "Industrial Infrastructure", "Morocco conglomerate", "renewable energy Africa", "cement manufacturing Gambia", "strategic mining Morocco", "precision agriculture Sahel", "water desalination Africa", "sovereign technology", "green GPU cloud", "low carbon intensity compute", "Dakhla data center", "Dakhla 500MW", "500 MW data center Morocco", "green data center Africa"],
    authors: [{ name: "Harch Corp" }],
    applicationName: "Harch Corp",
    creator: "Harch Corp",
    publisher: "Harch Corp",
    alternates: {
      canonical: isFr ? "https://www.harchcorp.com/fr" : "https://www.harchcorp.com",
      languages: {
        en: "https://www.harchcorp.com",
        fr: "https://www.harchcorp.com/fr",
        "x-default": "https://www.harchcorp.com",
      },
    },
    openGraph: {
      title,
      description: ogDescription,
      url: isFr ? "https://www.harchcorp.com/fr" : "https://www.harchcorp.com",
      siteName: "Harch Corp",
      type: "website",
      locale: isFr ? "fr_MA" : "en_US",
      alternateLocale: isFr ? ["en_US"] : ["fr_MA"],
      images: [
        {
          url: "/images/og-harch-corp.png",
          width: 1200,
          height: 630,
          alt: title,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: twitterDescription,
      images: ["/images/og-harch-corp.png"],
      site: "@harchcorp",
      creator: "@harchcorp",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tRss = await getTranslations({ locale, namespace: 'rss' });

  // ═══ JSON-LD: Organization Schema ═══
  const schemaOrg = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Corporation"],
        "@id": "https://www.harchcorp.com/#organization",
        name: "Harch Corp",
        alternateName: [
          "HarchCorp",
          "Harch Corporation",
          "HarchCorp Group",
        ],
        legalName: "Harch Corp",
        url: "https://www.harchcorp.com",
        logo: {
          "@type": "ImageObject",
          "@id": "https://www.harchcorp.com/#logo",
          url: "https://www.harchcorp.com/logo-512x512.png",
          contentUrl: "https://www.harchcorp.com/logo-512x512.png",
          caption: "Harch Corp — Moroccan Industrial Conglomerate",
          inLanguage: locale,
          width: 512,
          height: 512,
        },
        image: [
          {
            "@type": "ImageObject",
            "@id": "https://www.harchcorp.com/#og-image",
            url: "https://www.harchcorp.com/images/og-harch-corp.png",
            contentUrl:
              "https://www.harchcorp.com/images/og-harch-corp.png",
            caption: "HarchCorp — Africa's Sovereign Infrastructure OS",
            inLanguage: locale,
            width: 1200,
            height: 630,
          },
          {
            "@type": "ImageObject",
            "@id": "https://www.harchcorp.com/#logo-square",
            url: "https://www.harchcorp.com/logo-512x512.png",
            contentUrl: "https://www.harchcorp.com/logo-512x512.png",
            caption: "Harch Corp Logo",
            inLanguage: locale,
            width: 512,
            height: 512,
          },
        ],
        description:
          "Harch Corp is a Moroccan multi-sector industrial conglomerate and holding company building Africa's industrial sovereignty across 8 verticals: AI data centers, renewable energy, cement manufacturing, sovereign technology, strategic mining, precision agriculture, water infrastructure, and finance. $2.37B investment pipeline across 5 countries.",
        foundingDate: "2024-01-01",
        founder: { "@id": "https://www.harchcorp.com/#founder" },
        numberOfEmployees: {
          "@type": "QuantitativeValue",
          minValue: 50,
          maxValue: 200,
          value: "50-200",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "123 Boulevard Mohammed V",
          addressLocality: "Casablanca",
          addressRegion: "Casablanca-Settat",
          postalCode: "20000",
          addressCountry: "MA",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 33.5731,
          longitude: -7.5898,
        },
        // telephone: to be added when a real business number is available
        email: "info@harchcorp.com",
        areaServed: [
          { "@type": "Country", name: "Morocco" },
          { "@type": "Country", name: "Gambia" },
          { "@type": "Country", name: "Senegal" },
          { "@type": "Place", name: "Africa" },
          { "@type": "Place", name: "MENA Region" },
        ],
        industry: "Conglomerate",
        naics: "551112",
        slogan: "Africa's Sovereign Infrastructure OS",
        knowsLanguage: ["en", "fr", "ar"],
        // Social profile URLs removed — none are verified to exist.
        // Re-enable sameAs only when actual profiles are confirmed.
        // sameAs: [],
        subOrganization: [
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/intelligence/#organization",
            name: "Harch Intelligence",
            url: "https://www.harchcorp.com/subsidiaries/intelligence",
            description:
              "Carbon-Aware GPU Cloud — 1,798 GPUs across 5 Moroccan hubs at 48.2 gCO2/kWh",
            industry: "AI Infrastructure",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/cement/#organization",
            name: "Harch Cement",
            url: "https://www.harchcorp.com/subsidiaries/cement",
            description: "500kT/yr cement production in Gambia",
            industry: "Cement Manufacturing",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/energy/#organization",
            name: "Harch Energy",
            url: "https://www.harchcorp.com/subsidiaries/energy",
            description:
              "2GW+ renewable energy pipeline — solar, wind, and green hydrogen",
            industry: "Renewable Energy",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/technology/#organization",
            name: "Harch Technology",
            url: "https://www.harchcorp.com/subsidiaries/technology",
            description:
              "Sovereign technology stack — carbon-aware GPU cloud, cybersecurity, satellite communications",
            industry: "Technology",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/mining/#organization",
            name: "Harch Mining",
            url: "https://www.harchcorp.com/subsidiaries/mining",
            description:
              "Strategic mineral extraction — phosphates, cobalt, and rare earths",
            industry: "Mining",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/agriculture/#organization",
            name: "Harch Agri",
            url: "https://www.harchcorp.com/subsidiaries/agriculture",
            description:
              "Precision agriculture — IoT, drone monitoring, vertical farming",
            industry: "Agriculture",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/water/#organization",
            name: "Harch Water",
            url: "https://www.harchcorp.com/subsidiaries/water",
            description:
              "200M m³/yr desalination with AI-optimized distribution",
            industry: "Water Infrastructure",
          },
          {
            "@type": "Organization",
            "@id": "https://www.harchcorp.com/subsidiaries/finance/#organization",
            name: "Harch Finance",
            url: "https://www.harchcorp.com/subsidiaries/finance",
            description:
              "Green bonds, project finance, trade finance, and Islamic finance for sovereign infrastructure",
            industry: "Financial Services",
          },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "investor relations",
            email: "investors@harchcorp.com",
            // telephone removed — placeholder was fake
            availableLanguage: ["English", "French", "Arabic"],
          },
          {
            "@type": "ContactPoint",
            contactType: "media relations",
            email: "press@harchcorp.com",
            // telephone removed — placeholder was fake
            availableLanguage: ["English", "French", "Arabic"],
          },
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            email: "support@harchcorp.com",
            // telephone removed — placeholder was fake
            availableLanguage: ["English", "French", "Arabic"],
          },
        ],
      },
      {
        "@type": "Person",
        "@id": "https://www.harchcorp.com/#founder",
        name: "Amine Harch El Korane",
        jobTitle: "Founder & CEO",
        worksFor: { "@id": "https://www.harchcorp.com/#organization" },
        description:
          "Founder and CEO of Harch Corp, a Moroccan multi-sector industrial conglomerate building Africa's industrial sovereignty across 8 verticals with a $2.37B investment pipeline.",
        url: "https://www.harchcorp.com",
      },
      {
        "@type": "WebSite",
        "@id": "https://www.harchcorp.com/#website",
        url: "https://www.harchcorp.com",
        name: "Harch Corp",
        alternateName: [
          "HarchCorp",
          "Harch Corp",
          "Harch Corporation",
        ],
        publisher: { "@id": "https://www.harchcorp.com/#organization" },
        inLanguage: ["en", "fr"],
        image: [
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/og-harch-corp.png",
            contentUrl:
              "https://www.harchcorp.com/images/og-harch-corp.png",
            caption: "Harch Corp — Africa's Sovereign Infrastructure OS",
            width: 1200,
            height: 630,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/sovereign-ai-infrastructure.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/sovereign-ai-infrastructure.jpg",
            caption:
              "Sovereign AI Infrastructure by Harch Intelligence",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/renewable-data-center-north-africa.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/renewable-data-center-north-africa.jpg",
            caption:
              "Renewable-powered data center in North Africa by Harch Energy",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/dakhla-data-center-construction.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/dakhla-data-center-construction.jpg",
            caption:
              "Dakhla AI Data Center under construction by Harch Intelligence",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/green-hydrogen-morocco.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/green-hydrogen-morocco.jpg",
            caption:
              "Green hydrogen production in Morocco by Harch Energy",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/precision-agriculture-senegal.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/precision-agriculture-senegal.jpg",
            caption:
              "Precision agriculture in Senegal by Harch Agri",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/blog/solar-energy-benchmark-morocco.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/blog/solar-energy-benchmark-morocco.jpg",
            caption:
              "Solar energy benchmark in Morocco by Harch Energy",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/company/hq-casablanca.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/company/hq-casablanca.jpg",
            caption:
              "Harch Corp headquarters in Casablanca, Morocco",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/company/industrial-portfolio.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/company/industrial-portfolio.jpg",
            caption: "Harch Corp industrial portfolio across Africa",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/finance/green-bonds-africa.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/finance/green-bonds-africa.jpg",
            caption:
              "Green bonds for African infrastructure by Harch Finance",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/esg/esg-report-2025.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/esg/esg-report-2025.jpg",
            caption: "Harch Corp ESG sustainability report 2025",
            width: 1344,
            height: 768,
          },
          {
            "@type": "ImageObject",
            url: "https://www.harchcorp.com/images/case-studies/casablanca-water-optimization.jpg",
            contentUrl:
              "https://www.harchcorp.com/images/case-studies/casablanca-water-optimization.jpg",
            caption:
              "AI-optimized water distribution in Casablanca by Harch Water",
            width: 1344,
            height: 768,
          },
        ],
        // SearchAction removed — no /search page exists yet.
        // Re-enable when a search endpoint is implemented.
        // potentialAction: {
        //   "@type": "SearchAction",
        //   target: {
        //     "@type": "EntryPoint",
        //     urlTemplate:
        //       "https://www.harchcorp.com/search?q={search_term_string}",
        //   },
        //   "query-input": "required name=search_term_string",
        // },
      },
    ],
  };

  return (
    <NextIntlClientProvider messages={messages}>
      <a href="#main-content" className="skip-link">
        {tCommon('skipToContent')}
      </a>
      <TopNavBarWithSidebar />
      <Sidebar />
      <div className="flex-1 flex flex-col w-full pt-14">
        <main id="main-content" className="flex-1 pb-6">
          <ClientLayout>{children}</ClientLayout>
        </main>
        <Footer />
      </div>
      <CookieConsent />
      <LanguageDetector />
      <CursorGlow />
    </NextIntlClientProvider>
  );
}

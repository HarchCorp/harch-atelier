import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { CursorGlow } from "@/components/CursorGlow";
import { ClientLayout } from "@/components/ClientLayout";


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
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.harchcorp.com'),
  title: {
    default: "Harch Corp | Africa's Sovereign Infrastructure OS",
    template: "%s | Harch Corp",
  },
  description:
    "Harch Corp is a Moroccan industrial conglomerate building Africa's industrial sovereignty. Carbon-Aware GPU Cloud (1,798 GPUs target), 2GW+ Renewable Energy, Cement, Technology, Mining, Agriculture, Water, Finance.",
  keywords: [
    "Harch Corp",
    "Africa industrial sovereignty",
    "Data Center Africa",
    "Sovereign AI",
    "AI data center Morocco",
    "carbon-aware GPU cloud",
    "carbon-aware scheduling",
    "Renewable Energy Morocco",
    "Industrial Infrastructure",
    "Morocco conglomerate",
    "renewable energy Africa",
    "cement manufacturing Gambia",
    "strategic mining Morocco",
    "precision agriculture Sahel",
    "water desalination Africa",
    "sovereign technology",
    "green GPU cloud",
    "low carbon intensity compute",
    "Dakhla data center",
    "Dakhla 500MW",
    "Igoudar Dakhla",
    "500 MW data center Morocco",
    "green data center Africa",
  ],
  authors: [{ name: "Harch Corp" }],
  applicationName: "Harch Corp",
  creator: "Harch Corp",
  publisher: "Harch Corp",
  alternates: {
    canonical: 'https://www.harchcorp.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: [
      { url: '/favicon.ico' },
    ],
  },
  openGraph: {
    title: "Harch Corp | Africa's Sovereign Infrastructure OS",
    description:
      "Moroccan industrial conglomerate — $2.37B investment pipeline across 8 verticals. Carbon-Aware GPU Cloud (1,798 GPUs target), 2GW+ Renewable Energy, Cement, Mining, Agriculture, Water, Finance. Building Africa's industrial sovereignty.",
    url: "https://www.harchcorp.com",
    siteName: "Harch Corp",
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_MA", "ar_MA"],
    images: [
      {
        url: "/images/og-harch-corp.png",
        width: 1200,
        height: 630,
        alt: "Harch Corp | Africa's Sovereign Infrastructure OS",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harch Corp | Africa's Sovereign Infrastructure OS",
    description:
      "Carbon-Aware GPU Cloud | 1,798 GPUs at 48.2 gCO2/kWh. 2GW+ Renewable Energy Pipeline. Sovereign AI from Morocco.",
    images: ["/images/og-harch-corp.png"],
    site: "@harchcorp",
    creator: "@harchcorp",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
  other: {
    ...(process.env.GOOGLE_SITE_VERIFICATION ? { 'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION } : {}),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization JSON-LD is emitted by the [locale] layout (which renders
  // <html>/<body> and a comprehensive @graph schema). The root layout is a
  // pass-through that only wraps children, so emitting a second Organization
  // schema here would create a duplicate JSON-LD block in the rendered HTML.
  return <>{children}</>;
}

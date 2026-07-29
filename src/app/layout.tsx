import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";

// ═══════════════════════════════════════════════════════════════
//  ROOT LAYOUT — Harch Atelier (atelier.harchcorp.com)
//
//  This repo deploys ONLY the Atelier product. The Harch Corp
//  conglomerate site lives in a separate repo (harch-corp) deployed
//  on harchcorp.com. Do NOT mix the two.
//
//  Fonts: Inter (body) + Space Mono (data) — per Design System V2
//  Canonical: https://atelier.harchcorp.com
// ═══════════════════════════════════════════════════════════════

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
  metadataBase: new URL('https://atelier.harchcorp.com'),
  title: {
    default: "Harch Atelier — AI Reputation Intelligence for Africa",
    template: "%s | Harch Atelier",
  },
  description:
    "Harch Atelier monitors what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports. 30+ Moroccan and African media sources, 8 AI engines.",
  keywords: [
    "AI reputation intelligence",
    "reputation monitoring Morocco",
    "sentiment analysis",
    "media monitoring Africa",
    "crisis alerts WhatsApp",
    "AI visibility",
    "brand reputation",
    "Harch Atelier",
    "HarchIQ",
    "reputation score",
  ],
  authors: [{ name: "Harch Atelier" }],
  applicationName: "Harch Atelier",
  creator: "Harch Atelier",
  publisher: "Harch Atelier",
  alternates: {
    canonical: 'https://atelier.harchcorp.com',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: "Harch Atelier — AI Reputation Intelligence for Africa",
    description:
      "Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports. 30+ Moroccan and African media sources.",
    url: "https://atelier.harchcorp.com",
    siteName: "Harch Atelier",
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_MA", "ar_MA"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Harch Atelier — AI Reputation Intelligence for Africa",
    description:
      "Monitor what media and AI say about your company. Sentiment analysis, crisis alerts on WhatsApp, monthly board-ready PDF reports.",
    site: "@harchatelier",
    creator: "@harchatelier",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

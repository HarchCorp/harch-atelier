import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AtelierSessionProvider } from "./AtelierSessionProvider";
import { Toaster } from "@/components/ui/sonner";
import "./atelier.css";

// ─── ATELIER LAYOUT ──────────────────────────────────────────────
// Shared layout for all /atelier/* pages.
// Includes: skip link, metadata, NextIntlClientProvider (FR/EN),
// SessionProvider (via client wrapper).
//
// i18n: the layout is a server component. It reads messages via
// `getMessages()` (which delegates to `getRequestConfig` in
// src/i18n/request.ts — itself driven by the locale detected in
// src/middleware.ts). Those messages are passed to
// `NextIntlClientProvider` so client components like
// `LanguageSwitcher` can call `useTranslations()` / `useLocale()`.

export const metadata: Metadata = {
  metadataBase: new URL("https://atelier.harchcorp.com"),
  title: {
    default: "Harch Atelier — AI Reputation Intelligence for Africa",
    template: "%s | Harch Atelier",
  },
  description:
    "Harch Atelier — AI Reputation Intelligence for Morocco & Africa. Monitor 30+ media sources and 8 AI engines, analyze sentiment with HarchIQ, and deliver insights via WhatsApp, dashboard, and monthly PDF.",
  alternates: {
    canonical: "https://atelier.harchcorp.com/atelier",
  },
  openGraph: {
    siteName: "Harch Atelier",
    locale: "en_US",
    type: "website",
    url: "https://atelier.harchcorp.com/atelier",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo-512x512.svg",
  },
};

export default async function AtelierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load the messages bundle for the locale detected by the middleware.
  // `getMessages()` reads from `getRequestConfig` (src/i18n/request.ts)
  // which itself is driven by the `x-next-intl-locale` request header
  // set by `createMiddleware` in src/middleware.ts.
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AtelierSessionProvider>
        <a
          href="#main-content"
          className="atelier-skip-link"
          style={{
            position: "absolute",
            top: "-100px",
            left: "0",
            padding: "8px 16px",
            background: "#0a0a0a",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 600,
            textDecoration: "none",
            zIndex: 9999,
            transition: "top 0.2s",
          }}
        >
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
        <Toaster position="bottom-right" richColors closeButton />
      </AtelierSessionProvider>
    </NextIntlClientProvider>
  );
}

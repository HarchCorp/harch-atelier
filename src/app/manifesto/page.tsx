import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ManifestoClient from './ManifestoClient';
import { routing } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Manifesto — Building in Public | Harch Corp',
  description:
    "Harch Corp manifesto: why we build sovereign infrastructure for Africa, why we publish in open data, and why transparency is our competitive moat.",
  keywords: [
    'Harch Corp manifesto',
    'building in public',
    'sovereign infrastructure Africa',
    'Morocco investment thesis',
  ],
  alternates: { canonical: 'https://www.harchcorp.com/manifesto' },
};

/**
 * Root (non-locale-prefixed) manifesto page.
 *
 * The middleware excludes `/manifesto` from i18n routing, so this route is
 * rendered with the default locale. We wrap the client in
 * `NextIntlClientProvider` so `useTranslations('manifesto')` resolves correctly
 * on both `/manifesto` (here) and `/fr/manifesto` (via [locale]/manifesto).
 */
export default async function ManifestoPage() {
  const messages = await getMessages({ locale: routing.defaultLocale });
  return (
    <NextIntlClientProvider locale={routing.defaultLocale} messages={messages}>
      <ManifestoClient />
    </NextIntlClientProvider>
  );
}

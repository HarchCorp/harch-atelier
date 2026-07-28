import { redirect } from 'next/navigation';

/**
 * Non-locale /harchos route.
 *
 * The locale-aware route lives at /src/app/[locale]/harchos/page.tsx and is
 * registered in src/i18n/routing.ts. With `localePrefix: 'as-needed'`,
 * the English locale is served at `/harchos` directly — this file simply
 * routes the request into the [locale] segment so next-intl can negotiate
 * the language.
 */
export const dynamic = 'force-static';

export default function HarchOSRedirect() {
  redirect('/en/harchos');
}

'use client';

import { useEffect } from 'react';

/**
 * DocumentLang — Sets the `lang` attribute on <html> dynamically
 * based on the current locale. This is needed because the root layout
 * owns the <html> element but doesn't know the locale at build time.
 */
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return null;
}

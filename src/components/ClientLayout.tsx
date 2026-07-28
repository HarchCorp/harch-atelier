'use client';

import { ReactNode } from 'react';

/**
 * ClientLayout — Thin client wrapper for the main content area.
 * Page transitions removed — they caused a "PowerPoint" effect
 * that made the site feel sluggish and blocked carousel interactions.
 */
export function ClientLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

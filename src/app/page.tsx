// ═══════════════════════════════════════════════════════════════
//  ROOT PAGE — fallback
//
//  The actual / → /atelier redirect is handled by next.config.ts
//  (redirects() with permanent: true → 308). This page.tsx exists
//  only as a fallback in case the redirect config is bypassed.
//
//  In normal operation, this file is never rendered.
// ═══════════════════════════════════════════════════════════════

import { permanentRedirect } from 'next/navigation';

export default function RootPage() {
  permanentRedirect('/atelier');
}

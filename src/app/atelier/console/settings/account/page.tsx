"use client";

// Account Settings page — thin wrapper around AccountSettings component.
// Route: /atelier/console/settings/account
//
// The AccountSettings component owns all the UX (tabs, forms, API calls).
// This wrapper only exists because Next.js App Router requires a `page.tsx`
// for a route to be reachable.

import AccountSettings from "./AccountSettings";

export default function AccountSettingsPage() {
  return <AccountSettings />;
}

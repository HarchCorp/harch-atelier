import type { Metadata } from "next";
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </NextIntlClientProvider>
  );
}

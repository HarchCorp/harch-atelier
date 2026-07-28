import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/auth.config';
import { AuthSessionProvider } from "@/components/AuthSessionProvider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthSessionProvider>{children}</AuthSessionProvider>
    </NextIntlClientProvider>
  );
}

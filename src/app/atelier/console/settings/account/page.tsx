import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import AccountSettings from "./AccountSettings";

export const metadata: Metadata = {
  title: "Paramètres du compte | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/settings/account");
  }
  return <AccountSettings />;
}

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { Dashboard } from "../Dashboard";

export const metadata: Metadata = {
  title: "Console — Grandes Entreprises | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EnterpriseConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/enterprise");
  }
  return <Dashboard plan="enterprise" />;
}

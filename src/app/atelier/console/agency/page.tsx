import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { Dashboard } from "../Dashboard";

export const metadata: Metadata = {
  title: "Console — Agences | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AgencyConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/agency");
  }
  return <Dashboard plan="agency" />;
}

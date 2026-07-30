import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Enterprise Console — HarchIQ",
  robots: { index: false, follow: false },
};

export default async function EnterpriseConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console/enterprise");
  }
  // Admin CAN visit this console (to see what users see)
  // But non-enterprise users are redirected to their own console
  if (session.user?.role !== "admin" && session.user?.accountType !== "enterprise") {
    redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
  }

  return <ConsoleShell accountType="enterprise" />;
}

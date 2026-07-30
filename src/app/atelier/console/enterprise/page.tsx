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
  // STRICT GATE: only enterprise accounts can access this console
  // Admins are redirected to their own admin dashboard
  if (session.user?.role === "admin") {
    redirect("/atelier/admin");
  }
  if (session.user?.accountType !== "enterprise") {
    // Cross-access attempt — redirect to their own console
    redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
  }

  return <ConsoleShell accountType="enterprise" />;
}

import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Investor Console — HarchIQ",
  robots: { index: false, follow: false },
};

export default async function InvestorConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console/investor");
  }
  // Admin CAN visit this console (to see what investors see)
  // But non-investor users are redirected to their own console
  if (session.user?.role !== "admin" && session.user?.accountType !== "investor") {
    redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
  }

  return <ConsoleShell accountType="investor" />;
}

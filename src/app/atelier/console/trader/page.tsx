import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trader Console — HarchIQ",
  robots: { index: false, follow: false },
};

export default async function TraderConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console/trader");
  }
  // Admin CAN visit this console (to see what traders see)
  // But non-trader users are redirected to their own console
  if (session.user?.role !== "admin" && session.user?.accountType !== "trader") {
    redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
  }

  return <ConsoleShell accountType="trader" />;
}

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
  if (session.user?.role === "admin") {
    redirect("/atelier/admin");
  }
  // STRICT GATE: only investor accounts can access this console
  if (session.user?.accountType !== "investor") {
    redirect(`/atelier/console/${session.user?.accountType || "enterprise"}`);
  }

  return <ConsoleShell accountType="investor" />;
}

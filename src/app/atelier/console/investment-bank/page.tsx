import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Investment Bank & M&A — HarchIQ Console",
  robots: { index: false, follow: false },
};

export default async function InvestmentBankConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/atelier/login?callbackUrl=/atelier/console/investment-bank");
  if (session.user?.role !== "admin" && session.user?.accountType !== "investment-bank") {
    redirect(`/atelier/console/${session.user?.accountType || "brand-monitor"}`);
  }
  return <ConsoleShell accountType="investment-bank" />;
}

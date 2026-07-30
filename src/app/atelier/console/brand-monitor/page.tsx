import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Brand Monitor — HarchIQ Console",
  robots: { index: false, follow: false },
};

export default async function BrandMonitorConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/atelier/login?callbackUrl=/atelier/console/brand-monitor");
  if (session.user?.role !== "admin" && session.user?.accountType !== "brand-monitor") {
    redirect(`/atelier/console/${session.user?.accountType || "brand-monitor"}`);
  }
  return <ConsoleShell accountType="brand-monitor" />;
}

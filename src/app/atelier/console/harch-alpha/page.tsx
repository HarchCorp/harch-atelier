import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Harch Alpha — Trader Console",
  robots: { index: false, follow: false },
};

export default async function HarchAlphaConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/atelier/login?callbackUrl=/atelier/console/harch-alpha");
  if (session.user?.role !== "admin" && session.user?.accountType !== "harch-alpha") {
    redirect(`/atelier/console/${session.user?.accountType || "brand-monitor"}`);
  }
  return <ConsoleShell accountType="harch-alpha" userName={session.user.name} userEmail={session.user.email} />;
}

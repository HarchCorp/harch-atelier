import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Market & Competitor Intel — HarchIQ Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/market-competitor
//
//  Auth + onboarding gate. See brand-monitor/page.tsx for full
//  comment — same pattern.
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function MarketCompetitorConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console/market-competitor");
  }

  const email = session.user.email ?? "";
  const isDemo = email.startsWith("demo-") && email.endsWith("@harch.atelier");

  if (session.user.role !== "admin" && session.user.accountType !== "market-competitor") {
    redirect(`/atelier/console/${session.user.accountType || "brand-monitor"}`);
  }

  if (!isDemo && session.user.role !== "admin") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true },
    });
    if (!user?.onboardingCompleted) {
      redirect("/atelier/onboarding");
    }
  }

  return (
    <ConsoleShell
      accountType="market-competitor"
      userName={session.user.name}
      userEmail={session.user.email}
    />
  );
}

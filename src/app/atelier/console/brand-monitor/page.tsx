import type { Metadata } from "next";
import { ConsoleShell } from "../ConsoleShell";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Brand Monitor — HarchIQ Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/brand-monitor
//
//  Auth + onboarding gate. Renders ConsoleShell only when:
//    1. User is signed in
//    2. accountType === "brand-monitor" (or role === "admin")
//    3. onboardingCompleted === true (else → /atelier/onboarding)
//
//  Demo users (demo-*@harch.atelier) are auto-onboarded in
//  /api/auth/demo so they skip the wizard too.
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function BrandMonitorConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console/brand-monitor");
  }

  // Demo users bypass the onboarding check (they're auto-onboarded).
  const email = session.user.email ?? "";
  const isDemo = email.startsWith("demo-") && email.endsWith("@harch.atelier");

  if (session.user.role !== "admin" && session.user.role !== "super_admin" && session.user.accountType !== "brand-monitor") {
    redirect(`/atelier/console/${session.user.accountType || "brand-monitor"}`);
  }

  if (!isDemo && session.user.role !== "admin" && session.user.role !== "super_admin") {
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
      accountType="brand-monitor"
      userName={session.user.name}
      userEmail={session.user.email}
    />
  );
}

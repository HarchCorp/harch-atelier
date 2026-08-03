import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { StandbyBanner } from "../StandbyBanner";

export const metadata: Metadata = {
  title: "Investment Bank & M&A — HarchIQ Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/investment-bank
//
//  STANDBY (Task ID: 5-standby). The Investment Bank & M&A desk is
//  on hold while the team focuses on the core Brand Monitor console.
//  Authenticated users see a clean banner; anonymous users are sent
//  to login. No Prisma call — the previous onboarding gate would
//  crash with PrismaClientInitializationError against the current
//  SQLite/PostgreSQL schema mismatch.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function InvestmentBankConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console/investment-bank");
  }

  return <StandbyBanner featureName="Investment Bank Desk" />;
}

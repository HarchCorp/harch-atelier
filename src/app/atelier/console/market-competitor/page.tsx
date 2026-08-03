import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { StandbyBanner } from "../StandbyBanner";

export const metadata: Metadata = {
  title: "Market & Competitor Intel — HarchIQ Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/market-competitor
//
//  STANDBY (Task ID: 5-standby). The Market & Competitor Intel desk
//  is on hold while the team focuses on the core Brand Monitor
//  console. Authenticated users see a clean banner; anonymous users
//  are sent to login. No Prisma call — the previous onboarding gate
//  would crash with PrismaClientInitializationError against the
//  current SQLite/PostgreSQL schema mismatch.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function MarketCompetitorConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console/market-competitor");
  }

  return <StandbyBanner featureName="Market Competitor Intelligence" />;
}

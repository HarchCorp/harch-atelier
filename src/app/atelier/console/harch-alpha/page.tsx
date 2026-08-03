import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { StandbyBanner } from "../StandbyBanner";

export const metadata: Metadata = {
  title: "Harch Alpha — Trader Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/harch-alpha
//
//  STANDBY (Task ID: 5-standby). The Harch Alpha trader desk is on
//  hold while the team focuses on the core Brand Monitor console.
//  Authenticated users see a clean banner; anonymous users are sent
//  to login. No Prisma call — the previous onboarding gate would
//  crash with PrismaClientInitializationError against the current
//  SQLite/PostgreSQL schema mismatch.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function HarchAlphaConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console/harch-alpha");
  }

  return <StandbyBanner featureName="Harch Alpha — Trader Desk" />;
}

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AgencyDashboard from "./AgencyDashboard";

export const metadata: Metadata = {
  title: "Console — Agences | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════
//  /atelier/console/agency
//
//  P0-1 FIX (KAEL — Protocole Leverage Maximal):
//  Previously mounted <Dashboard> (shared) + <AgencyConsole> (2302 lines,
//  5 sections). The 16 898-line AgencyDashboard.tsx (43 sections, all ENV/
//  R2/R3/R4 features) was dead code — never imported.
//
//  Now: AgencyDashboard is self-sufficient (own sidebar, nav, 43 sections,
//  108 React hooks, fetches its own data via /api/agency/clients + 12
//  console API routes). Single-component mount = zero redundancy.
//
//  Auth gate: session required. agency-admin role check happens upstream
//  in middleware; this page just needs the user's name/email for greeting.
// ═══════════════════════════════════════════════════════════════════════

export default async function AgencyConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/agency");
  }

  const user = await prisma.user
    .findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, accountType: true, role: true },
    })
    .catch(() => null);

  if (!user) {
    redirect("/atelier/login?error=user_not_found");
  }

  return <AgencyDashboard userName={user.name} userEmail={user.email} />;
}

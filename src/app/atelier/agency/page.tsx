import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { AgencyDashboard } from "./AgencyDashboard";
import { getAgencyContext } from "@/lib/agency/agency-session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Agency — HarchIQ White-Label Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  /atelier/agency
//
//  Master dashboard for agency-admin users. Lists their sub-clients,
//  lets them create new ones, switch workspaces, and configure
//  branding + quota per sub-client.
//
//  Auth gate:
//    1. Must be signed in
//    2. role must be "agency-admin" (super-admins allowed too)
//    3. Must have an agencyId linked to their account
//
//  Non-agency users are redirected to their normal console.
// ═══════════════════════════════════════════════════════════════

export default async function AgencyPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/agency");
  }

  const role = session.user.role;
  if (role !== "agency-admin" && role !== "admin" && role !== "super_admin") {
    redirect("/atelier/console");
  }

  // Verify the user actually has an agency linked.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      agencyId: true,
      agency: {
        select: {
          id: true,
          name: true,
          slug: true,
          commissionPct: true,
          primaryColor: true,
          logoUrl: true,
          status: true,
        },
      },
    },
  });

  if (!user || !user.agencyId || !user.agency) {
    // Admin without agency → not an agency-admin; bounce them.
    redirect("/atelier/console");
  }
  if (user.agency.status !== "active") {
    redirect(`/atelier/login?error=agency_${user.agency.status}`);
  }

  const ctx = await getAgencyContext(session);

  return (
    <AgencyDashboard
      agency={user.agency}
      userName={user.name ?? user.email ?? "Agency Admin"}
      activeAgencyClientId={ctx?.activeAgencyClientId ?? null}
    />
  );
}

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/settings/users
//
//  Server page for user management. Renders the UserManagement
//  client component with the current user's plan + identity.
//
//  Auth is enforced by src/middleware.ts on /atelier/console/* —
//  this page only enriches the client component with the caller's
//  identity (used for the "VOUS" badge + plan-aware UI).
//
//  Task ID: POSTLOGIN-5-USERS
// ═══════════════════════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { UserManagement } from "./UserManagement";

export const dynamic = "force-dynamic";

type Plan = "essential" | "pro" | "enterprise" | "agency";

// Derive the user's "plan" from their accountType + role.
//   - essential → users on a basic / solo plan
//   - pro → company users with role admin / company-admin
//   - enterprise → enterprise dashboard users
//   - agency → agency admin users
function derivePlan(accountType: string | undefined, role: string | undefined): Plan {
  if (role === "agency-admin") return "agency";
  if (accountType === "investment-bank") return "enterprise";
  if (accountType === "market-competitor") return "pro";
  if (role === "admin" || role === "company-admin" || role === "super_admin") return "pro";
  return "essential";
}

export default async function UsersSettingsPage() {
  const session = await getServerSession(authOptions);

  // Defaults — middleware ensures we have a session in production,
  // but be defensive for the preview / demo environment.
  let currentUserId: string | undefined;
  let currentUserEmail: string | null = null;
  let currentUserName: string | null = null;
  let plan: Plan = "pro";

  if (session?.user) {
    currentUserId = session.user.id;
    currentUserEmail = session.user.email ?? null;
    currentUserName = session.user.name ?? null;
    const accountType = (session.user as { accountType?: string }).accountType;
    plan = derivePlan(accountType, session.user.role);

    // Try to get the user's display name from the DB if missing
    if (currentUserId && !currentUserName) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: currentUserId },
          select: { name: true },
        });
        if (dbUser?.name) currentUserName = dbUser.name;
      } catch {
        // ignore — name stays null, UI falls back to email
      }
    }
  }

  return (
    <UserManagement
      plan={plan}
      currentUserId={currentUserId}
      currentUserEmail={currentUserEmail}
      currentUserName={currentUserName}
    />
  );
}

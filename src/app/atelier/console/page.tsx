import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════════
//  /atelier/console — Smart redirector
//
//  Does NOT render anything. Reads the session and redirects:
//    1. No session                → /atelier/login
//    2. Admin/super_admin         → /atelier/admin (Bat Cave)
//    3. Commercial                → /atelier/admin (restricted tabs)
//    4. Demo user (demo-*@harch.atelier) → their per-offer console
//       (auto-onboarded in /api/auth/demo — skips the wizard)
//    5. onboardingCompleted=false → /atelier/onboarding (wizard)
//    6. Else                      → their per-offer console
//       (essential/pro/enterprise/agency)
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function ConsoleRedirect() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/console");
  }

  // Admins + super_admins + commercials go to the Bat Cave
  if (
    session.user.role === "admin" ||
    session.user.role === "super_admin" ||
    session.user.role === "commercial"
  ) {
    redirect("/atelier/admin");
  }

  // Demo accounts are auto-onboarded in /api/auth/demo — skip the wizard.
  const email = session.user.email ?? "";
  if (email.startsWith("demo-") && email.endsWith("@harch.atelier")) {
    redirect(getConsolePath(session.user.accountType, session.user.role));
  }

  // Fetch onboarding state — the JWT doesn't carry onboardingCompleted
  // (kept the token lean), so we hit the DB once per redirect. This is
  // fine because the redirect only fires on initial navigation, not on
  // every API call.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, accountType: true },
  });

  if (!user) {
    redirect("/atelier/login?error=user_not_found");
  }

  if (!user.onboardingCompleted) {
    redirect("/atelier/onboarding");
  }

  // For regular users: go to their own console
  redirect(getConsolePath(user.accountType, session.user.role));
}

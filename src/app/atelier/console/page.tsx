import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════════
//  /atelier/console — Smart redirector
//
//  Does NOT render anything. Reads the session and redirects to the
//  correct console based on accountType:
//    - brand-monitor      → /atelier/console/brand-monitor
//    - market-competitor  → /atelier/console/market-competitor
//    - investment-bank    → /atelier/console/investment-bank
//    - harch-alpha        → /atelier/console/harch-alpha
//
//  Admins go to brand-monitor console by default (they can navigate
//  to others manually). Admin dashboard is at /atelier/admin.
//
//  If no session → /atelier/login
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function ConsoleRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console");
  }

  // For admin: go to brand-monitor console (they can navigate to others manually)
  if (session.user?.role === "admin") {
    redirect("/atelier/console/brand-monitor");
  }

  // For regular users: go to their own console
  redirect(getConsolePath(session.user?.accountType, session.user?.role));
}

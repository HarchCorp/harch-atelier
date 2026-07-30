import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════════
//  /atelier/console — Smart redirector
//
//  Does NOT render anything. Reads the session and redirects to the
//  correct console based on accountType:
//    - trader      → /atelier/console/trader
//    - investor    → /atelier/console/investor
//    - enterprise  → /atelier/console/enterprise (default)
//
//  Admins are NOT redirected to /atelier/admin here (they can visit
//  any console). Instead they go to the enterprise console by default.
//  The admin dashboard is accessible directly at /atelier/admin.
//
//  If no session → /atelier/login
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function ConsoleRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console");
  }

  // For admin: go to enterprise console (they can navigate to others manually)
  // Admin dashboard is at /atelier/admin (separate URL)
  if (session.user?.role === "admin") {
    redirect("/atelier/console/enterprise");
  }

  // For regular users: go to their own console
  redirect(getConsolePath(session.user?.accountType, session.user?.role));
}

import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════════════════════
//  /atelier/console — Smart redirector
//
//  Does NOT render anything. Reads the session and redirects to the
//  correct console based on accountType:
//    - admin       → /atelier/admin
//    - trader      → /atelier/console/trader
//    - investor    → /atelier/console/investor
//    - enterprise  → /atelier/console/enterprise (default)
//
//  If no session → /atelier/login
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function ConsoleRedirect() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console");
  }

  redirect(getConsolePath(session.user?.accountType, session.user?.role));
}

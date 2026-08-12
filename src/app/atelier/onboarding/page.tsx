import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "./OnboardingWizard";

// ═══════════════════════════════════════════════════════════════
//  /atelier/onboarding — Onboarding wizard (first-run experience)
//
//  Server component. Auth-gates the route (redirect to /atelier/login
//  if no session), then renders the client-side 4-step wizard.
//
//  The wizard itself reads the session via useSession() to get the
//  user's name + accountType + companyId, and persists completion
//  via POST /api/user/onboard.
//
//  Task: ONBOARDING-WIZARD
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/onboarding");
  }
  return <OnboardingWizard />;
}

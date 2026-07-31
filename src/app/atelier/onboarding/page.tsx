import { getServerSession } from "next-auth";
import { authOptions, getConsolePath } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { OnboardingWizard } from "./OnboardingWizard";
import type { Metadata } from "next";

// ═══════════════════════════════════════════════════════════════
//  /atelier/onboarding — first-login wizard
//
//  Server component:
//    1. Checks session (redirect → /atelier/login if not signed in)
//    2. Checks onboardingCompleted (redirect → console if already done)
//    3. Renders the OnboardingWizard client component
//
//  Admins skip onboarding entirely — they have access to /atelier/admin
//  and don't need a personal company scope.
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding — HarchIQ Console",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/atelier/login?callbackUrl=/atelier/onboarding");
  }

  // Admins don't need to onboard — they go straight to their console.
  if (session.user.role === "admin") {
    redirect("/atelier/console/brand-monitor");
  }

  // Demo accounts are auto-onboarded in /api/auth/demo (they share
  // the seeded demo company). Skip the wizard for them too.
  const email = session.user.email ?? "";
  if (email.startsWith("demo-") && email.endsWith("@harch.atelier")) {
    redirect(getConsolePath(session.user.accountType, session.user.role));
  }

  // Fetch the user's current onboarding state.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      accountType: true,
      companyId: true,
      jobTitle: true,
      onboardingCompleted: true,
      topics: true,
      competitors: true,
      trackedAssets: true,
      useCaseNote: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          sector: true,
          website: true,
          description: true,
          iceNumber: true,
          rcNumber: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/atelier/login?error=user_not_found");
  }

  // Already onboarded — go to console.
  if (user.onboardingCompleted) {
    redirect(getConsolePath(user.accountType, session.user.role));
  }

  return <OnboardingWizard />;
}

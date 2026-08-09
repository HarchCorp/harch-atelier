import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import EssentialDashboard from "./EssentialDashboard";

export const metadata: Metadata = {
  title: "Console — Essentiel | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function EssentialConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/essential");
  }

  // Fetch user info for the dashboard
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      accountType: true,
      role: true,
      companyId: true,
      onboardingCompleted: true,
    },
  }).catch(() => null);

  if (!user) {
    redirect("/atelier/login?error=user_not_found");
  }

  if (!user.onboardingCompleted) {
    redirect("/atelier/onboarding");
  }

  return (
    <EssentialDashboard
      userName={user.name}
      userEmail={user.email}
      userPlan={user.accountType}
      userRole={user.role}
    />
  );
}

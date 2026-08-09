import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProDashboard from "./ProDashboard";

export const metadata: Metadata = {
  title: "Console — Pro | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/pro");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, accountType: true, role: true, onboardingCompleted: true },
  }).catch(() => null);

  if (!user) redirect("/atelier/login?error=user_not_found");
  if (!user.onboardingCompleted) redirect("/atelier/onboarding");

  return <ProDashboard userName={user.name} userEmail={user.email} />;
}

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Dashboard } from "../Dashboard";
import AgencyConsole from "./AgencyConsole";

export const metadata: Metadata = {
  title: "Console — Agences | Harch Atelier",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AgencyConsolePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/atelier/login?callbackUrl=/atelier/console/agency");
  }

  // Fetch the user's display name + email so we can pass them to both the
  // shared Dashboard and the agency-specific sections below.
  const user = await prisma.user
    .findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, accountType: true, role: true },
    })
    .catch(() => null);

  if (!user) {
    redirect("/atelier/login?error=user_not_found");
  }

  return (
    <>
      {/* Shared dashboard (sidebar + KPIs + topics + AI visibility) */}
      <Dashboard plan="agency" userName={user.name} userEmail={user.email} />
      {/* Agency-specific rich sections: client switcher, portfolio table,
          ROI calculator, pitch deck generator, automated reports */}
      <div className="agency-console-wrapper">
        <AgencyConsole userName={user.name} userEmail={user.email} />
      </div>
    </>
  );
}

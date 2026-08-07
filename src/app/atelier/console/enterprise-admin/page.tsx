import type { Metadata } from "next";
import { EnterpriseAdminPanel } from "../views/EnterpriseAdminPanel";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Enterprise Admin — HarchIQ Console",
  robots: { index: false, follow: false },
};

// ═══════════════════════════════════════════════════════════════
//  /atelier/console/enterprise-admin
//
//  Server-side gate: only role=company-admin (or super-admin) can
//  view this page. The actual UI is rendered by EnterpriseAdminPanel
//  (client component) which calls the company-scoped APIs.
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/atelier/login?callbackUrl=/atelier/console/enterprise-admin");
  }

  // Super-admin can also access (useful for previewing/auditing)
  if (session.user?.role !== "company-admin" && session.user?.role !== "admin" && session.user?.role !== "super_admin") {
    redirect("/atelier/console");
  }

  return <EnterpriseAdminPanel />;
}

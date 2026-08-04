import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { AgencyClientDetail } from "./AgencyClientDetail";

export const metadata: Metadata = {
  title: "Sub-client — HarchIQ Agency Console",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  /atelier/agency/clients/[id]
//
//  Detail page for a single sub-client. Renders tabs:
//    • Branding — logo, colors, fonts, login title, footer
//    • Quota    — max limits per resource + plan tier + price
//    • Usage    — historical usage rows by month
//
//  Auth gate:
//    1. Must be signed in
//    2. role must be "agency-admin" (or "admin")
//    3. The sub-client must belong to the caller's agency
//       (verified via requireAgencyClientOwnership in the API route;
//        here we just pre-fetch for SSR and let the client component
//        re-fetch on mount).
// ═══════════════════════════════════════════════════════════════

export default async function AgencyClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/atelier/login?callbackUrl=/atelier/agency/clients/${id}`);
  }

  const role = session.user.role;
  if (role !== "agency-admin" && role !== "admin") {
    redirect("/atelier/console");
  }

  // Verify ownership server-side (defense in depth — the API route
  // re-checks ownership on every PATCH, so a forged URL alone can't
  // mutate data).
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { agencyId: true },
  });
  if (!user?.agencyId) {
    redirect("/atelier/console");
  }

  const client = await prisma.agencyClient.findFirst({
    where: { id, agencyId: user.agencyId },
    select: {
      id: true,
      displayName: true,
      subdomain: true,
      customDomain: true,
      status: true,
      company: { select: { id: true, name: true, slug: true, sector: true } },
    },
  });

  if (!client) {
    notFound();
  }

  return <AgencyClientDetail clientId={id} initialClient={client} />;
}

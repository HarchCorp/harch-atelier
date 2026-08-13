// ═══════════════════════════════════════════════════════════════
//  GET /api/console/company-dossier
//
//  Returns the complete company dossier for the logged-in user's
//  company: aliases, stats, matching status, recommendations.
//
//  Used by dashboards to show "Collecte en cours" vs real data
//  and to let the user add aliases.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { buildCompanyDossier } from "@/lib/harchiq/company-matching";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json(
      { error: "No company linked to your account" },
      { status: 400 },
    );
  }

  const dossier = await buildCompanyDossier(companyId);

  if (!dossier) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  return NextResponse.json(dossier);
}

// ─── PATCH: Add an alias ───────────────────────────────────────

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { action, alias } = body as { action: "add-alias" | "remove-alias"; alias?: string };

    if (!alias || alias.trim().length < 2) {
      return NextResponse.json({ error: "Alias must be at least 2 characters" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { aliases: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const currentAliases = company.aliases ?? [];

    if (action === "add-alias") {
      if (currentAliases.includes(alias.trim())) {
        return NextResponse.json({ error: "Alias already exists" }, { status: 409 });
      }
      const newAliases = [...currentAliases, alias.trim()];
      await prisma.company.update({
        where: { id: companyId },
        data: { aliases: newAliases },
      });

      // Re-run matching with the new alias
      try {
        const { matchArticlesForCompany } = await import("@/lib/harchiq/company-matching");
        void matchArticlesForCompany(companyId); // fire-and-forget
      } catch {}

      return NextResponse.json({ success: true, aliases: newAliases });
    }

    if (action === "remove-alias") {
      const newAliases = currentAliases.filter((a) => a !== alias);
      await prisma.company.update({
        where: { id: companyId },
        data: { aliases: newAliases },
      });
      return NextResponse.json({ success: true, aliases: newAliases });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}


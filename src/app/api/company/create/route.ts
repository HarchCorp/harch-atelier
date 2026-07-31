import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import {
  findOrCreateCompany,
  findDuplicateCandidates,
} from "@/lib/harchiq/company-dedup";

// ═══════════════════════════════════════════════════════════════
//  POST /api/company/create
//
//  Super-admin only. Creates a new company (or returns an existing
//  one if dedup hits) with ICE/RC. Used by the inline "create
//  company" form in the AdminDashboard invitation modal.
//
//  Body: {
//    name: string,
//    sector?: string,
//    iceNumber?: string,
//    rcNumber?: string,
//    website?: string,
//    headquarters?: string,
//    ticker?: string,
//  }
//
//  Returns: {
//    company: { id, name, slug, sector, iceNumber, rcNumber, website },
//    created: boolean,
//    duplicates?: DedupResult  // present when created=false
//  }
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json(
      { error: "Forbidden — admin only" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, sector, iceNumber, rcNumber, website, headquarters, ticker } =
      body as {
        name?: string;
        sector?: string;
        iceNumber?: string;
        rcNumber?: string;
        website?: string;
        headquarters?: string;
        ticker?: string;
      };

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 },
      );
    }

    // Pre-flight duplicate check (read-only) — surfaces candidates
    // so the admin UI can warn "Looks like X already exists" before
    // we actually create the row.
    const duplicates = await findDuplicateCandidates({
      name: name.trim(),
      iceNumber: iceNumber?.trim() || undefined,
      rcNumber: rcNumber?.trim() || undefined,
      website: website?.trim() || undefined,
      sector,
    });

    // findOrCreateCompany does its own dedup internally — if a match
    // is found, `created` will be false and we return the existing row.
    const { company, created } = await findOrCreateCompany({
      name: name.trim(),
      sector,
      iceNumber: iceNumber?.trim() || undefined,
      rcNumber: rcNumber?.trim() || undefined,
      website: website?.trim() || undefined,
      headquarters: headquarters?.trim() || undefined,
      ticker: ticker?.trim() || undefined,
    });

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        sector: company.sector,
        iceNumber: company.iceNumber,
        rcNumber: company.rcNumber,
        website: company.website,
      },
      created,
      duplicates: created
        ? null
        : {
            exactMatch: duplicates.exactMatch
              ? {
                  id: duplicates.exactMatch.id,
                  name: duplicates.exactMatch.name,
                  slug: duplicates.exactMatch.slug,
                  iceNumber: duplicates.exactMatch.iceNumber,
                }
              : null,
            fuzzyMatches: duplicates.fuzzyMatches.slice(0, 5).map((m) => ({
              id: m.company.id,
              name: m.company.name,
              slug: m.company.slug,
              iceNumber: m.company.iceNumber,
              similarity: m.similarity,
            })),
          },
    });
  } catch (err) {
    console.error("[/api/company/create] error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

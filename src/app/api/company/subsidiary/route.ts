import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireCompanyAdmin,
  toErrorResponse,
} from "@/lib/auth/company-scope";
import { findOrCreateCompany, slugify } from "@/lib/harchiq/company-dedup";

// ═══════════════════════════════════════════════════════════════
//  POST /api/company/subsidiary
//
//  Adds a subsidiary to the caller's company. Two modes:
//
//    A) Create a brand-new subsidiary company:
//       Body: {
//         mode: "create",
//         name: string,
//         sector?: string,
//         iceNumber?: string,
//         rcNumber?: string,
//         website?: string,
//         headquarters?: string,
//       }
//       → findOrCreateCompany dedupes by ICE/slug/fuzzy-name before
//         creating. The created/existing company is then linked as a
//         subsidiary (parentId = caller's companyId).
//
//    B) Link an existing company as a subsidiary:
//       Body: {
//         mode: "link",
//         subsidiaryId: string,  // existing Company.id
//       }
//       → verifies the target exists, is not already a parent of the
//         caller (no cycles), and is not the caller itself.
//
//  DELETE /api/company/subsidiary?subsidiaryId=XXX
//    Unlinks a subsidiary (sets parentId = null). Does NOT delete the
//    subsidiary row — preserves its history.
//
//  PATCH /api/company/subsidiary
//    Body: { linkToParentId: string }
//    Sets the caller's own parentId — used by the "Link to parent"
//    form in the EnterpriseAdminPanel. Refuses to create a cycle.
//
//  Auth: company-admin only (scoped to their own companyId).
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const scope = await requireCompanyAdmin();

    const body = await req.json().catch(() => ({}));
    const mode = body.mode as "create" | "link" | undefined;

    if (mode === "create") {
      const { name, sector, iceNumber, rcNumber, website, headquarters } =
        body as {
          name?: string;
          sector?: string;
          iceNumber?: string;
          rcNumber?: string;
          website?: string;
          headquarters?: string;
        };

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: "Subsidiary name is required" },
          { status: 400 },
        );
      }

      // Dedup-first: find or create the subsidiary company
      const { company: sub, created } = await findOrCreateCompany({
        name: name.trim(),
        sector,
        iceNumber: iceNumber?.trim() || undefined,
        rcNumber: rcNumber?.trim() || undefined,
        website: website?.trim() || undefined,
        headquarters: headquarters?.trim() || undefined,
      });

      // Refuse to link a company to itself as its own subsidiary
      if (sub.id === scope.companyId) {
        return NextResponse.json(
          { error: "A company cannot be its own subsidiary" },
          { status: 400 },
        );
      }

      // Cycle check: if `sub` already has the caller as a subsidiary
      // (transitively), linking would create a cycle. We do a
      // shallow check (1 level) — the schema doesn't enforce deeper.
      if (sub.parentId === scope.companyId) {
        // Already a subsidiary — idempotent, return success.
        return NextResponse.json({
          subsidiary: sub,
          created,
          alreadyLinked: true,
        });
      }
      if (sub.parentId) {
        return NextResponse.json(
          {
            error:
              "Company is already linked to another parent. Unlink it first.",
          },
          { status: 409 },
        );
      }

      // Cycle check: don't let a parent become its child's subsidiary
      const caller = await prisma.company.findUnique({
        where: { id: scope.companyId },
        select: { parentId: true },
      });
      if (caller?.parentId === sub.id) {
        return NextResponse.json(
          {
            error:
              "Cycle detected — this company is already your parent. Cannot also make it a subsidiary.",
          },
          { status: 400 },
        );
      }

      // Link
      const updated = await prisma.company.update({
        where: { id: sub.id },
        data: { parentId: scope.companyId },
      });

      return NextResponse.json({
        subsidiary: updated,
        created,
        alreadyLinked: false,
      });
    }

    if (mode === "link") {
      const { subsidiaryId } = body as { subsidiaryId?: string };
      if (!subsidiaryId) {
        return NextResponse.json(
          { error: "subsidiaryId is required" },
          { status: 400 },
        );
      }

      if (subsidiaryId === scope.companyId) {
        return NextResponse.json(
          { error: "A company cannot be its own subsidiary" },
          { status: 400 },
        );
      }

      const target = await prisma.company.findUnique({
        where: { id: subsidiaryId },
        select: { id: true, parentId: true, name: true },
      });
      if (!target) {
        return NextResponse.json(
          { error: "Subsidiary not found" },
          { status: 404 },
        );
      }
      if (target.parentId) {
        return NextResponse.json(
          {
            error: `"${target.name}" is already linked to another parent. Unlink it first.`,
          },
          { status: 409 },
        );
      }

      // Cycle check
      const caller = await prisma.company.findUnique({
        where: { id: scope.companyId },
        select: { parentId: true },
      });
      if (caller?.parentId === subsidiaryId) {
        return NextResponse.json(
          { error: "Cycle detected — this company is already your parent." },
          { status: 400 },
        );
      }

      const updated = await prisma.company.update({
        where: { id: subsidiaryId },
        data: { parentId: scope.companyId },
      });

      return NextResponse.json({ subsidiary: updated });
    }

    return NextResponse.json(
      { error: 'Invalid mode — use "create" or "link"' },
      { status: 400 },
    );
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const scope = await requireCompanyAdmin();

    const url = new URL(req.url);
    const subsidiaryId = url.searchParams.get("subsidiaryId");
    if (!subsidiaryId) {
      return NextResponse.json(
        { error: "subsidiaryId query param is required" },
        { status: 400 },
      );
    }

    const target = await prisma.company.findUnique({
      where: { id: subsidiaryId },
      select: { id: true, parentId: true, name: true },
    });
    if (!target) {
      return NextResponse.json(
        { error: "Subsidiary not found" },
        { status: 404 },
      );
    }
    if (target.parentId !== scope.companyId) {
      return NextResponse.json(
        {
          error:
            "Forbidden — this company is not a subsidiary of your company",
        },
        { status: 403 },
      );
    }

    const updated = await prisma.company.update({
      where: { id: subsidiaryId },
      data: { parentId: null },
      select: { id: true, name: true, parentId: true },
    });

    return NextResponse.json({ subsidiary: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const scope = await requireCompanyAdmin();

    const body = await req.json().catch(() => ({}));
    const { linkToParentId } = body as { linkToParentId?: string };

    if (!linkToParentId) {
      return NextResponse.json(
        { error: "linkToParentId is required" },
        { status: 400 },
      );
    }
    if (linkToParentId === scope.companyId) {
      return NextResponse.json(
        { error: "A company cannot be its own parent" },
        { status: 400 },
      );
    }

    // Cycle check: walk up the proposed parent's parent chain to
    // make sure we don't end up creating a loop back to the caller.
    const visited = new Set<string>();
    let cursor: string | null = linkToParentId;
    while (cursor && !visited.has(cursor)) {
      if (cursor === scope.companyId) {
        return NextResponse.json(
          {
            error:
              "Cycle detected — this company is already a subsidiary of yours (transitively).",
          },
          { status: 400 },
        );
      }
      visited.add(cursor);
      const node = await prisma.company.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = node?.parentId ?? null;
    }

    const parent = await prisma.company.findUnique({
      where: { id: linkToParentId },
      select: { id: true, name: true },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "Parent company not found" },
        { status: 404 },
      );
    }

    const updated = await prisma.company.update({
      where: { id: scope.companyId },
      data: { parentId: linkToParentId },
      select: {
        id: true,
        name: true,
        parentId: true,
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ company: updated });
  } catch (err) {
    return toErrorResponse(err);
  }
}

// ═══════════════════════════════════════════════════════════════
//  Helper: slugify is re-exported for the API route tree-shaker —
//  imported above from company-dedup.ts. Kept here as a no-op
//  reference so future contributors know where the slug rules live.
// ═══════════════════════════════════════════════════════════════
void slugify;

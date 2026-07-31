import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireCompanyAdmin,
  toErrorResponse,
} from "@/lib/auth/company-scope";

// ═══════════════════════════════════════════════════════════════
//  GET /api/company/settings
//    Returns company settings (topics, competitors, monitored sources,
//    alert thresholds) + the company's own info (name, sector, ICE, RC,
//    website, hierarchy).
//
//  PATCH /api/company/settings
//    Body: {
//      company?: { name?, sector?, iceNumber?, rcNumber?, website?, headquarters? },
//      settings?: { topics?, competitors?, monitoredSources?, alertThresholds? }
//    }
//    Updates either the company row OR the CompanySettings row (or both).
//    Settings row is lazily created on first PATCH.
//
//  Auth: company-admin only (scoped to their own companyId).
//
//  Task: company-dedup-enterprise-admin
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const DEFAULT_THRESHOLDS = {
  sentimentDrop: -0.3, // alert when 1-day sentiment drops by 0.3+
  riskLevel: "high", // alert when risk reaches "high" or above
  minMentions: 5, // alert when mention volume exceeds 5 in 1h
};

export async function GET() {
  try {
    const scope = await requireCompanyAdmin();

    const company = await prisma.company.findUnique({
      where: { id: scope.companyId },
      include: {
        settings: true,
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            iceNumber: true,
            sector: true,
          },
        },
        subsidiaries: {
          select: {
            id: true,
            name: true,
            slug: true,
            iceNumber: true,
            sector: true,
            createdAt: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 },
      );
    }

    // Parse JSON-encoded settings fields (with safe defaults)
    const settings = company.settings;
    const parseArray = (raw: string | null | undefined): string[] => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    };
    const parseObject = <T,>(raw: string | null | undefined, fallback: T): T => {
      if (!raw) return fallback;
      try {
        return { ...fallback, ...(JSON.parse(raw) as T) };
      } catch {
        return fallback;
      }
    };

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        sector: company.sector,
        website: company.website,
        headquarters: company.headquarters,
        iceNumber: company.iceNumber,
        rcNumber: company.rcNumber,
        foundedYear: company.foundedYear,
        description: company.description,
        parentId: company.parentId,
        parent: company.parent,
        subsidiaries: company.subsidiaries,
      },
      settings: {
        topics: parseArray(settings?.topics),
        competitors: parseArray(settings?.competitors),
        monitoredSources: parseArray(settings?.monitoredSources),
        alertThresholds: parseObject(
          settings?.alertThresholds,
          DEFAULT_THRESHOLDS,
        ),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const scope = await requireCompanyAdmin();

    const body = await req.json().catch(() => ({}));
    const { company: companyPatch, settings: settingsPatch } = body as {
      company?: {
        name?: string;
        sector?: string;
        iceNumber?: string | null;
        rcNumber?: string | null;
        website?: string | null;
        headquarters?: string | null;
        description?: string | null;
      };
      settings?: {
        topics?: string[];
        competitors?: string[];
        monitoredSources?: string[];
        alertThresholds?: Record<string, unknown>;
      };
    };

    // ─── Update company row ──────────────────────────────────────
    if (companyPatch && Object.keys(companyPatch).length > 0) {
      // If ICE is being changed, verify it doesn't collide with
      // another company (uniqueness is enforced at the DB level but
      // we want a friendlier error than a Prisma P2002).
      if (
        companyPatch.iceNumber &&
        companyPatch.iceNumber.trim() !== ""
      ) {
        const collision = await prisma.company.findFirst({
          where: {
            iceNumber: companyPatch.iceNumber,
            NOT: { id: scope.companyId },
          },
          select: { id: true, name: true },
        });
        if (collision) {
          return NextResponse.json(
            {
              error: `ICE number already in use by "${collision.name}"`,
            },
            { status: 409 },
          );
        }
      }

      // Build a clean update payload (drop undefined keys, allow nulls
      // for explicitly-cleared fields).
      const data: Record<string, string | null> = {};
      for (const [k, v] of Object.entries(companyPatch)) {
        if (v !== undefined) data[k] = v;
      }
      if (Object.keys(data).length > 0) {
        await prisma.company.update({
          where: { id: scope.companyId },
          data,
        });
      }
    }

    // ─── Upsert company settings ────────────────────────────────
    if (settingsPatch && Object.keys(settingsPatch).length > 0) {
      // Stringify JSON fields — Prisma stores them as TEXT (no native
      // JSON column on this table — see schema comment).
      const data: Record<string, string> = {};
      if (Array.isArray(settingsPatch.topics)) {
        data.topics = JSON.stringify(settingsPatch.topics);
      }
      if (Array.isArray(settingsPatch.competitors)) {
        data.competitors = JSON.stringify(settingsPatch.competitors);
      }
      if (Array.isArray(settingsPatch.monitoredSources)) {
        data.monitoredSources = JSON.stringify(settingsPatch.monitoredSources);
      }
      if (
        settingsPatch.alertThresholds &&
        typeof settingsPatch.alertThresholds === "object"
      ) {
        data.alertThresholds = JSON.stringify(settingsPatch.alertThresholds);
      }

      if (Object.keys(data).length > 0) {
        const existing = await prisma.companySettings.findUnique({
          where: { companyId: scope.companyId },
        });
        if (existing) {
          await prisma.companySettings.update({
            where: { companyId: scope.companyId },
            data,
          });
        } else {
          await prisma.companySettings.create({
            data: { companyId: scope.companyId, ...data },
          });
        }
      }
    }

    // Re-fetch the full state so the client gets the new values
    const company = await prisma.company.findUnique({
      where: { id: scope.companyId },
      include: {
        settings: true,
        parent: {
          select: { id: true, name: true, slug: true, iceNumber: true },
        },
        subsidiaries: {
          select: { id: true, name: true, slug: true, iceNumber: true },
        },
      },
    });

    const parseArray = (raw: string | null | undefined): string[] => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    };
    const parseObject = <T,>(raw: string | null | undefined, fallback: T): T => {
      if (!raw) return fallback;
      try {
        return { ...fallback, ...(JSON.parse(raw) as T) };
      } catch {
        return fallback;
      }
    };

    return NextResponse.json({
      company: {
        id: company?.id,
        name: company?.name,
        slug: company?.slug,
        sector: company?.sector,
        website: company?.website,
        headquarters: company?.headquarters,
        iceNumber: company?.iceNumber,
        rcNumber: company?.rcNumber,
        parentId: company?.parentId,
        parent: company?.parent,
        subsidiaries: company?.subsidiaries,
      },
      settings: {
        topics: parseArray(company?.settings?.topics),
        competitors: parseArray(company?.settings?.competitors),
        monitoredSources: parseArray(company?.settings?.monitoredSources),
        alertThresholds: parseObject(
          company?.settings?.alertThresholds,
          DEFAULT_THRESHOLDS,
        ),
      },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

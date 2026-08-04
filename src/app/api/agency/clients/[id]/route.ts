import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  requireAgencyClientOwnership,
  AgencyAuthError,
} from "@/lib/agency/agency-session";
import { getUsageStats } from "@/lib/agency/quota";

// ═══════════════════════════════════════════════════════════════
//  /api/agency/clients/[id]
//
//  GET    — sub-client detail (branding + quota + current usage)
//  PATCH  — update sub-client (branding, quota, status, displayName)
//
//  Auth: agency-admin + the client must belong to the admin's agency
//  (verified by requireAgencyClientOwnership).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// ─── GET — detail ───────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { clientId } = await requireAgencyClientOwnership(id);

    const [client, stats] = await Promise.all([
      prisma.agencyClient.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          agencyId: true,
          companyId: true,
          displayName: true,
          subdomain: true,
          customDomain: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: { id: true, name: true, slug: true, sector: true, ticker: true },
          },
          branding: true,
          quota: true,
        },
      }),
      getUsageStats(clientId),
    ]);

    if (!client) {
      return NextResponse.json({ error: "AgencyClient not found" }, { status: 404 });
    }

    return NextResponse.json({ client, stats });
  } catch (err) {
    return agencyError(err);
  }
}

// ─── PATCH — update ─────────────────────────────────────────────────

interface PatchBody {
  displayName?: string;
  subdomain?: string | null;
  customDomain?: string | null;
  status?: "active" | "suspended" | "terminated";
  branding?: {
    logoUrl?: string | null;
    primaryColor?: string | null;
    accentColor?: string | null;
    fontFamily?: string | null;
    faviconUrl?: string | null;
    loginTitle?: string | null;
    loginSubtitle?: string | null;
    footerText?: string | null;
    hideHarchBadge?: boolean;
  };
  quota?: {
    maxApiRequests?: number;
    maxWhatsAppAlerts?: number;
    maxKeywords?: number;
    maxSources?: number;
    maxUsers?: number;
    planTier?: string;
    monthlyPriceMAD?: number;
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { clientId } = await requireAgencyClientOwnership(id);

    let body: PatchBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    // Subdomain uniqueness check (if changing).
    if (body.subdomain) {
      const sub = body.subdomain.toLowerCase().trim();
      const taken = await prisma.agencyClient.findFirst({
        where: { subdomain: sub, NOT: { id: clientId } },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { error: `Subdomain "${sub}" is already taken` },
          { status: 409 },
        );
      }
    }
    if (body.customDomain) {
      const dom = body.customDomain.toLowerCase().trim();
      const taken = await prisma.agencyClient.findFirst({
        where: { customDomain: dom, NOT: { id: clientId } },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { error: `Custom domain "${dom}" is already taken` },
          { status: 409 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      // 1. AgencyClient core fields.
      const clientPatch: Record<string, unknown> = {};
      if (body.displayName !== undefined) clientPatch.displayName = body.displayName;
      if (body.subdomain !== undefined) clientPatch.subdomain = body.subdomain?.toLowerCase().trim() || null;
      if (body.customDomain !== undefined) clientPatch.customDomain = body.customDomain?.toLowerCase().trim() || null;
      if (body.status !== undefined) clientPatch.status = body.status;
      if (Object.keys(clientPatch).length > 0) {
        await tx.agencyClient.update({ where: { id: clientId }, data: clientPatch });
      }

      // 2. Branding.
      if (body.branding) {
        const b = body.branding;
        const brandingPatch: Record<string, unknown> = {};
        if (b.logoUrl !== undefined) brandingPatch.logoUrl = b.logoUrl;
        if (b.primaryColor !== undefined) brandingPatch.primaryColor = b.primaryColor;
        if (b.accentColor !== undefined) brandingPatch.accentColor = b.accentColor;
        if (b.fontFamily !== undefined) brandingPatch.fontFamily = b.fontFamily;
        if (b.faviconUrl !== undefined) brandingPatch.faviconUrl = b.faviconUrl;
        if (b.loginTitle !== undefined) brandingPatch.loginTitle = b.loginTitle;
        if (b.loginSubtitle !== undefined) brandingPatch.loginSubtitle = b.loginSubtitle;
        if (b.footerText !== undefined) brandingPatch.footerText = b.footerText;
        if (b.hideHarchBadge !== undefined) brandingPatch.hideHarchBadge = b.hideHarchBadge;
        if (Object.keys(brandingPatch).length > 0) {
          // Upsert — the branding row might not exist yet if the client
          // was created before the branding auto-create logic shipped.
          await tx.agencyBranding.upsert({
            where: { agencyClientId: clientId },
            create: { agencyClientId: clientId, ...brandingPatch },
            update: brandingPatch,
          });
        }
      }

      // 3. Quota.
      if (body.quota) {
        const q = body.quota;
        const quotaPatch: Record<string, unknown> = {};
        if (q.maxApiRequests !== undefined) quotaPatch.maxApiRequests = q.maxApiRequests;
        if (q.maxWhatsAppAlerts !== undefined) quotaPatch.maxWhatsAppAlerts = q.maxWhatsAppAlerts;
        if (q.maxKeywords !== undefined) quotaPatch.maxKeywords = q.maxKeywords;
        if (q.maxSources !== undefined) quotaPatch.maxSources = q.maxSources;
        if (q.maxUsers !== undefined) quotaPatch.maxUsers = q.maxUsers;
        if (q.planTier !== undefined) quotaPatch.planTier = q.planTier;
        if (q.monthlyPriceMAD !== undefined) quotaPatch.monthlyPriceMAD = q.monthlyPriceMAD;
        if (Object.keys(quotaPatch).length > 0) {
          await tx.agencyQuota.upsert({
            where: { agencyClientId: clientId },
            create: { agencyClientId: clientId, ...quotaPatch },
            update: quotaPatch,
          });
        }
      }
    });

    const fresh = await prisma.agencyClient.findUnique({
      where: { id: clientId },
      include: { company: true, branding: true, quota: true },
    });

    return NextResponse.json({ client: fresh });
  } catch (err) {
    return agencyError(err);
  }
}

// ─── Error helper ───────────────────────────────────────────────────

function agencyError(err: unknown): NextResponse {
  if (err instanceof AgencyAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  console.error("[/api/agency/clients/[id]] error:", err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Unknown error" },
    { status: 500 },
  );
}

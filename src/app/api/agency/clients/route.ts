import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAgencyAdmin, AgencyAuthError } from "@/lib/agency/agency-session";
import { getQuota, currentPeriod, getPlanDefaults } from "@/lib/agency/quota";
import { getBranding } from "@/lib/agency/branding";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  /api/agency/clients
//
//  GET    — list all sub-clients for the agency admin's agency
//           (with branding + quota + current-period usage summary)
//  POST   — create a new sub-client (auto-creates AgencyBranding +
//           AgencyQuota rows based on planTier defaults)
//
//  Auth: requires session + role="agency-admin" (or super-admin).
//  Sub-clients are ALWAYS scoped to the caller's agency — a request
//  body with a foreign agencyId is silently ignored.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// ─── GET — list ─────────────────────────────────────────────────────

export async function GET() {
  try {
    const ctx = await requireAgencyAdmin();

    const clients = await prisma.agencyClient.findMany({
      where: { agencyId: ctx.agencyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        companyId: true,
        displayName: true,
        subdomain: true,
        customDomain: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: { id: true, name: true, slug: true, sector: true },
        },
        branding: {
          select: {
            logoUrl: true,
            primaryColor: true,
            hideHarchBadge: true,
            loginTitle: true,
          },
        },
        quota: {
          select: {
            planTier: true,
            monthlyPriceMAD: true,
            maxApiRequests: true,
            maxWhatsAppAlerts: true,
            maxKeywords: true,
            maxSources: true,
            maxUsers: true,
          },
        },
      },
    });

    // Augment with current-period usage summary in a single query.
    const period = currentPeriod();
    const usageRows = await prisma.agencyUsage.findMany({
      where: {
        agencyClientId: { in: clients.map((c) => c.id) },
        period,
      },
      select: {
        agencyClientId: true,
        apiRequests: true,
        whatsappAlerts: true,
        keywordsUsed: true,
        sourcesUsed: true,
        usersActive: true,
      },
    });
    const usageByClient = new Map(usageRows.map((u) => [u.agencyClientId, u]));

    const enriched = clients.map((c) => {
      const usage = usageByClient.get(c.id);
      const q = c.quota;
      const pct = (used: number, max: number) =>
        max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0;
      return {
        ...c,
        usage: {
          period,
          apiRequests: usage?.apiRequests ?? 0,
          whatsappAlerts: usage?.whatsappAlerts ?? 0,
          keywordsUsed: usage?.keywordsUsed ?? 0,
          sourcesUsed: usage?.sourcesUsed ?? 0,
          usersActive: usage?.usersActive ?? 0,
        },
        bars: q
          ? {
              apiRequests: { used: usage?.apiRequests ?? 0, max: q.maxApiRequests, pct: pct(usage?.apiRequests ?? 0, q.maxApiRequests) },
              whatsappAlerts: { used: usage?.whatsappAlerts ?? 0, max: q.maxWhatsAppAlerts, pct: pct(usage?.whatsappAlerts ?? 0, q.maxWhatsAppAlerts) },
              keywords: { used: usage?.keywordsUsed ?? 0, max: q.maxKeywords, pct: pct(usage?.keywordsUsed ?? 0, q.maxKeywords) },
              sources: { used: usage?.sourcesUsed ?? 0, max: q.maxSources, pct: pct(usage?.sourcesUsed ?? 0, q.maxSources) },
              users: { used: usage?.usersActive ?? 0, max: q.maxUsers, pct: pct(usage?.usersActive ?? 0, q.maxUsers) },
            }
          : null,
      };
    });

    return NextResponse.json({
      agency: ctx.agency,
      clients: enriched,
      count: enriched.length,
    });
  } catch (err) {
    return agencyError(err);
  }
}

// ─── POST — create ──────────────────────────────────────────────────

interface CreateClientBody {
  companyId: string;
  displayName?: string;
  subdomain?: string;
  customDomain?: string;
  planTier?: "emergence" | "corporate" | "sovereign";
  // Optional quota overrides — if absent, planTier defaults are used.
  maxApiRequests?: number;
  maxWhatsAppAlerts?: number;
  maxKeywords?: number;
  maxSources?: number;
  maxUsers?: number;
  monthlyPriceMAD?: number;
  // Optional branding overrides.
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  loginTitle?: string;
}

export async function POST(req: Request) {
  try {
    const ctx = await requireAgencyAdmin();

    let body: CreateClientBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.companyId || typeof body.companyId !== "string") {
      return NextResponse.json({ error: "companyId is required" }, { status: 400 });
    }

    // Verify the company exists.
    const company = await prisma.company.findUnique({
      where: { id: body.companyId },
      select: { id: true, name: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Verify the agency doesn't already have a client for this company.
    const existing = await prisma.agencyClient.findFirst({
      where: { agencyId: ctx.agencyId, companyId: body.companyId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "AgencyClient already exists for this company" },
        { status: 409 },
      );
    }

    // Subdomain uniqueness check (if provided).
    if (body.subdomain) {
      const sub = body.subdomain.toLowerCase().trim();
      const taken = await prisma.agencyClient.findUnique({
        where: { subdomain: sub },
        select: { id: true },
      });
      if (taken) {
        return NextResponse.json(
          { error: `Subdomain "${sub}" is already taken` },
          { status: 409 },
        );
      }
    }

    const planTier = body.planTier ?? "emergence";
    const defaults = getPlanDefaults(planTier);

    // Create the AgencyClient + branding + quota + current-month usage
    // in a single transaction so we never have an orphan client.
    const client = await prisma.$transaction(async (tx) => {
      const created = await tx.agencyClient.create({
        data: {
          agencyId: ctx.agencyId,
          companyId: body.companyId,
          displayName: body.displayName ?? company.name,
          subdomain: body.subdomain?.toLowerCase().trim() ?? null,
          customDomain: body.customDomain?.toLowerCase().trim() ?? null,
          status: "active",
        },
      });

      await tx.agencyBranding.create({
        data: {
          agencyClientId: created.id,
          logoUrl: body.logoUrl ?? null,
          primaryColor: body.primaryColor ?? null,
          accentColor: body.accentColor ?? null,
          loginTitle: body.loginTitle ?? `${company.name} — Console`,
        },
      });

      await tx.agencyQuota.create({
        data: {
          agencyClientId: created.id,
          maxApiRequests: body.maxApiRequests ?? defaults.maxApiRequests,
          maxWhatsAppAlerts: body.maxWhatsAppAlerts ?? defaults.maxWhatsAppAlerts,
          maxKeywords: body.maxKeywords ?? defaults.maxKeywords,
          maxSources: body.maxSources ?? defaults.maxSources,
          maxUsers: body.maxUsers ?? defaults.maxUsers,
          planTier,
          monthlyPriceMAD: body.monthlyPriceMAD ?? defaults.monthlyPriceMAD,
        },
      });

      // Seed the current period with zeroed counters so the dashboard
      // has a row to display from day 1.
      await tx.agencyUsage.create({
        data: {
          agencyClientId: created.id,
          period: currentPeriod(),
        },
      });

      return created;
    });

    // Fetch the fully-populated client for the response.
    const fresh = await prisma.agencyClient.findUnique({
      where: { id: client.id },
      include: { company: true, branding: true, quota: true },
    });

    return NextResponse.json({ client: fresh }, { status: 201 });
  } catch (err) {
    return agencyError(err);
  }
}

// ─── Error helper ───────────────────────────────────────────────────

function agencyError(err: unknown): NextResponse {
  if (err instanceof AgencyAuthError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  logError("agency.clients", `[/api/agency/clients] error: ${err}`);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Unknown error" },
    { status: 500 },
  );
}

// Re-export helpers for testing / introspection.
export { getQuota, getBranding };

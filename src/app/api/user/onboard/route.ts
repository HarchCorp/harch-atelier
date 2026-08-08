// ═══════════════════════════════════════════════════════════════
//  POST /api/user/onboard
//
//  Completes the 4-step onboarding wizard. Auth required.
//
//  Body:
//    {
//      companyId:     string | null,        // existing company id (Step 1 — pick)
//      newCompany:    {                     // Step 1 — create (optional)
//        name, website, sector, ice?, rc?, description?
//      } | null,
//      jobTitle:      string,               // Step 2
//      useCase:       string,               // Step 2 (free-form note)
//      topics:        string[],             // Step 3 — brand-monitor
//      competitors:   string[],             // Step 3 — market-competitor
//      portfolioCsv:  string | null,        // Step 3 — investment-bank
//      trackedAssets: string[] | null,      // Step 3 — harch-alpha (tickers)
//      skip:          boolean               // skip onboarding (data will be generic)
//    }
//
//  Returns: { ok: true, redirect: "/atelier/console" }
//
//  Task: user-company-onboarding
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { classifySector, slugify } from "@/lib/harchiq/sector-classifier";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";

interface NewCompanyInput {
  name?: unknown;
  website?: unknown;
  sector?: unknown;
  ice?: unknown;
  rc?: unknown;
  description?: unknown;
}

interface OnboardBody {
  companyId?: unknown;
  newCompany?: NewCompanyInput | null;
  jobTitle?: unknown;
  useCase?: unknown;
  topics?: unknown;
  competitors?: unknown;
  portfolioCsv?: unknown;
  trackedAssets?: unknown;
  skip?: unknown;
}

const VALID_ACCOUNT_TYPES = new Set([
  "brand-monitor",
  "market-competitor",
  "investment-bank",
  "harch-alpha",
]);

const VALID_TOPICS = new Set([
  "earnings",
  "regulation",
  "crisis",
  "leadership",
  "product",
  "esg",
]);

function asString(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  return s.length > max ? s.slice(0, max) : s;
}

function asStringArray(v: unknown, max = 50, itemMax = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((s) => s.length > 0 && s.length <= itemMax)
    .slice(0, max);
}

// ─── Minimal CSV parser ─────────────────────────────────────────
// Accepts: `companyName,weight,sector\n...`. weight is a number 0-1.
// Returns rows typed. Trims whitespace, skips blank/empty lines and
// the header row (case-insensitive).
interface PortfolioRow {
  companyName: string;
  weight: number;
  sector: string;
}

function parsePortfolioCsv(csv: string): PortfolioRow[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  // Detect + drop header row
  const first = lines[0].toLowerCase();
  let startIdx = 0;
  if (
    first.startsWith("companyname") ||
    first.startsWith("company name") ||
    first.startsWith("name,")
  ) {
    startIdx = 1;
  }

  const rows: PortfolioRow[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 2) continue;
    const companyName = cols[0];
    const weightRaw = parseFloat(cols[1]);
    const sector = cols[2] || "Other";
    if (!companyName) continue;
    if (Number.isNaN(weightRaw)) continue;
    const weight = Math.max(0, Math.min(1, weightRaw));
    rows.push({ companyName, weight, sector });
  }
  return rows;
}

// ─── Build a unique slug ────────────────────────────────────────
// If "attijariwafa-bank" is taken, append -2, -3, ... until free.
async function uniqueSlug(base: string): Promise<string> {
  const slug = slugify(base) || `company-${Date.now()}`;
  let candidate = slug;
  let n = 2;
  // Loop with a hard cap to avoid infinite loops under edge cases.
  for (let i = 0; i < 100; i++) {
    const exists = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${slug}-${n}`;
    n++;
  }
  // Fallback — append a short timestamp suffix.
  return `${slug}-${Date.now().toString(36)}`;
}

export async function POST(req: NextRequest) {
  // ─── Auth ──────────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized — sign in first" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  // ─── Parse body ────────────────────────────────────────────────
  let body: OnboardBody;
  try {
    body = (await req.json()) as OnboardBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // ─── Load user (we need accountType + companyId for the upsert) ─
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      accountType: true,
      companyId: true,
      onboardingCompleted: true,
    },
  });
  if (!existingUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const accountType = VALID_ACCOUNT_TYPES.has(existingUser.accountType)
    ? existingUser.accountType
    : "brand-monitor";

  const skip = body.skip === true;

  try {
    // ═════════════════════════════════════════════════════════════
    //  STEP 1 — resolve / create the company
    // ═════════════════════════════════════════════════════════════
    let companyId = existingUser.companyId;

    if (!skip) {
      if (body.companyId && typeof body.companyId === "string") {
        // Existing company pick — verify it exists.
        // Task: domain-matching-demo-isolation — reject demo companies
        // so a real user can't accidentally attach to a demo-created
        // company row (e.g. the demo BCP created by the demo seed).
        const existing = await prisma.company.findUnique({
          where: { id: body.companyId },
          select: { id: true, name: true, isDemo: true },
        });
        if (!existing) {
          return NextResponse.json(
            { error: "Selected company not found" },
            { status: 400 },
          );
        }
        if (existing.isDemo) {
          return NextResponse.json(
            { error: "Cannot attach to a demo company. Pick a real company or create a new one." },
            { status: 400 },
          );
        }
        companyId = existing.id;
      } else if (body.newCompany && typeof body.newCompany === "object") {
        // New company create.
        const nc = body.newCompany;
        const name = asString(nc.name, 200);
        if (!name) {
          return NextResponse.json(
            { error: "Company name is required" },
            { status: 400 },
          );
        }
        const website = asString(nc.website, 500);
        const description = asString(nc.description, 2000);
        const ice = asString(nc.ice, 50);
        const rc = asString(nc.rc, 50);

        // Sector: validate against the 15 known sectors, otherwise
        // auto-classify from name+website.
        const requestedSector = asString(nc.sector, 100);
        const sector = requestedSector && requestedSector !== "Other"
          ? requestedSector
          : classifySector(name, website ?? undefined, description ?? undefined);

        const slug = await uniqueSlug(name);

        // Check ICE uniqueness if provided (ICE has a unique constraint).
        if (ice) {
          const dup = await prisma.company.findUnique({
            where: { iceNumber: ice },
            select: { id: true },
          });
          if (dup) {
            return NextResponse.json(
              { error: `A company with ICE ${ice} already exists` },
              { status: 409 },
            );
          }
        }

        const created = await prisma.company.create({
          data: {
            name,
            slug,
            website: website ?? null,
            description: description ?? null,
            sector,
            iceNumber: ice ?? null,
            rcNumber: rc ?? null,
            aliases: [],
          },
          select: { id: true, name: true, slug: true },
        });
        companyId = created.id;
        logInfo("user.onboard", `New company created: ${created.name} (${created.slug})`);
      } else if (!companyId) {
        // Neither companyId nor newCompany was provided AND skip is false.
        return NextResponse.json(
          { error: "Pick an existing company or create a new one" },
          { status: 400 },
        );
      }
    } else {
      // Skip mode — if the user has no companyId, we still need one
      // because the console APIs hard-403 without it. Attach them to
      // the FIRST company in the DB as a generic placeholder. This
      // matches the previous (buggy) findFirst fallback behaviour
      // for the skip case only.
      if (!companyId) {
        const fallback = await prisma.company.findFirst({
          orderBy: { createdAt: "asc" },
          select: { id: true, name: true },
        });
        if (!fallback) {
          return NextResponse.json(
            { error: "No companies in the database — create one first" },
            { status: 400 },
          );
        }
        companyId = fallback.id;
        logWarn(
          "user.onboard",
          `User ${userId} skipped onboarding — attached to fallback company ${fallback.name}`,
        );
      }
    }

    // ═════════════════════════════════════════════════════════════
    //  STEP 2 — role & use case
    // ═════════════════════════════════════════════════════════════
    const jobTitle = asString(body.jobTitle, 100);
    const useCaseNote = asString(body.useCase, 2000);

    // ═════════════════════════════════════════════════════════════
    //  STEP 3 — monitoring config (per accountType)
    // ═════════════════════════════════════════════════════════════
    const topics = asStringArray(body.topics, 20, 50)
      .filter((t) => VALID_TOPICS.has(t.toLowerCase()));

    const competitorsRaw = asStringArray(body.competitors, 50, 200);
    // For each competitor name, ensure a Company row exists so the
    // neighbors/competitor-intel pipelines can find them. Don't fail
    // the whole onboarding if one competitor can't be created.
    const competitorIds: string[] = [];
    for (const compName of competitorsRaw) {
      try {
        const slug = await uniqueSlug(compName);
        const comp = await prisma.company.upsert({
          where: { slug },
          update: {},
          create: {
            name: compName,
            slug,
            sector: classifySector(compName),
            aliases: [],
          },
          select: { id: true },
        });
        competitorIds.push(comp.id);
      } catch (e) {
        logWarn(
          "user.onboard",
          `Failed to upsert competitor "${compName}": ${e instanceof Error ? e.message : "unknown"}`,
        );
      }
    }

    // harch-alpha: tracked asset tickers (e.g. ["OCP", "IAM", "ATW"]).
    // Stored as the raw ticker strings on the user row.
    const trackedAssets = asStringArray(body.trackedAssets, 100, 20)
      .map((t) => t.toUpperCase());

    // Investment-bank: portfolio CSV upload → Portfolio + Holdings.
    let portfolioId: string | null = null;
    let portfolioRowCount = 0;
    if (typeof body.portfolioCsv === "string" && body.portfolioCsv.trim()) {
      const rows = parsePortfolioCsv(body.portfolioCsv);
      portfolioRowCount = rows.length;
      if (rows.length > 0) {
        const portfolio = await prisma.portfolio.create({
          data: {
            name: `Onboarding portfolio — ${new Date().toISOString().slice(0, 10)}`,
            userId,
            description: `Imported from CSV during onboarding (${rows.length} holdings)`,
          },
          select: { id: true },
        });
        for (const row of rows) {
          // Resolve or create the Company for each holding.
          let holdingCompanyId: string | null = null;
          try {
            const slug = await uniqueSlug(row.companyName);
            const comp = await prisma.company.upsert({
              where: { slug },
              update: {},
              create: {
                name: row.companyName,
                slug,
                sector: row.sector || classifySector(row.companyName),
                aliases: [],
              },
              select: { id: true },
            });
            holdingCompanyId = comp.id;
          } catch (e) {
            logWarn(
              "user.onboard",
              `Portfolio holding company upsert failed for "${row.companyName}": ${e instanceof Error ? e.message : "unknown"}`,
            );
          }
          if (!holdingCompanyId) continue;
          await prisma.portfolioHolding.create({
            data: {
              portfolioId: portfolio.id,
              companyId: holdingCompanyId,
              weight: row.weight,
            },
          });
        }
        portfolioId = portfolio.id;
        logInfo(
          "user.onboard",
          `Portfolio ${portfolio.id} created with ${rows.length} holdings`,
        );
      }
    }

    // ═════════════════════════════════════════════════════════════
    //  STEP 4 — persist the user updates
    // ═════════════════════════════════════════════════════════════
    await prisma.user.update({
      where: { id: userId },
      data: {
        companyId,
        jobTitle,
        useCaseNote,
        topics,
        competitors: competitorsRaw,
        trackedAssets,
        onboardingCompleted: true,
      },
    });

    logInfo(
      "user.onboard",
      `User ${userId} onboarded (company=${companyId}, accountType=${accountType}, competitors=${competitorIds.length}, portfolio=${portfolioId ?? "none"})`,
    );

    // ─── Audit log (Loi 09-08) — portfolio import + onboarding ──
    if (portfolioId) {
      await logAudit({
        userId,
        action: "portfolio_import",
        resource: `portfolio:${portfolioId}`,
        result: "success",
        ipAddress: extractIp(req),
        userAgent: extractUserAgent(req),
        metadata: {
          rowCount: portfolioRowCount,
          accountType,
        },
      });
    }

    await logAudit({
      userId,
      action: "onboarding_complete",
      resource: `user:${userId}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        companyId,
        accountType,
        competitorCount: competitorIds.length,
        portfolioId,
        skip,
      },
    });

    return NextResponse.json({
      ok: true,
      redirect: "/atelier/console",
      companyId,
      accountType,
      competitorCount: competitorIds.length,
      portfolioId,
    });
  } catch (err) {
    logError("user.onboard", `Onboarding API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Onboarding failed" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/user/onboard — returns the current onboarding state
//
//  Used by the wizard to pre-fill fields if the user re-visits
//  onboarding (e.g. they skipped and want to complete it now).
// ═══════════════════════════════════════════════════════════════
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      accountType: true,
      role: true,
      companyId: true,
      jobTitle: true,
      onboardingCompleted: true,
      topics: true,
      competitors: true,
      trackedAssets: true,
      useCaseNote: true,
      company: {
        select: { id: true, name: true, slug: true, sector: true, website: true, description: true, iceNumber: true, rcNumber: true },
      },
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ user });
}

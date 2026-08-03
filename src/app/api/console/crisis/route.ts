// ═══════════════════════════════════════════════════════════════
//  GET /api/console/crisis
//
//  Returns the current crisis score + contributing factors for the
//  logged-in user's company. Computed by `detectCrisis` over the
//  last 24h of alerts vs the 7-day baseline.
//
//  Auth: requires session (any console persona).
//  Cache: in-memory, 5-minute TTL per companyId — re-running the
//  detector on every request would be wasteful and would mask
//  downstream anomalies with stale snapshots. The cache is bypassed
//  by passing `?refresh=1`.
//
//  Query params:
//   • ?refresh=1   — bypass the 5-min cache, force recompute
//   • ?company=slug — admin-only override (resolves a different company)
//
//  Task ID: dataminr-realtime-crisis
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  requireUserCompany,
  demoFilterFromSession,
} from "@/lib/harchiq/company-session";
import {
  detectCrisis,
  articleToCrisisAlert,
  type CrisisDetectorResult,
  type CrisisAlert,
} from "@/lib/harchiq/crisis-detector";
import { isDemoEmail } from "@/lib/demo-session";
import { demoCrisisResponse } from "@/lib/demo-console-api";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ─── 5-minute in-memory cache (per companyId) ──────────────────
interface CacheEntry {
  result: CrisisDetectorResult;
  triggeringAlerts: CrisisAlert[];
  company: { name: string; slug: string };
  cachedAt: number;
}
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

// ─── GET ───────────────────────────────────────────────────────
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── DEMO BYPASS ─────────────────────────────────────────────
  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return demoCrisisResponse();
  }

  const url = new URL(req.url);
  const refresh = url.searchParams.get("refresh") === "1";
  const companySlug = url.searchParams.get("company");

  // Resolve the target company (own company unless admin override)
  let companyId: string;
  let company: { id: string; name: string; slug: string; sector: string; ticker: string | null } | null = null;
  const demoFilter = demoFilterFromSession(session);

  if (companySlug) {
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden — can only view your own company" },
        { status: 403 },
      );
    }
    company = await prisma.company.findUnique({
      where: { slug: companySlug },
      select: { id: true, name: true, slug: true, sector: true, ticker: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    companyId = company.id;
  } else {
    const result = await requireUserCompany();
    if (!result.ok) return result.response;
    companyId = result.data.company.id;
    company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, slug: true, sector: true, ticker: true },
    });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
  }

  // Cache hit?
  if (!refresh) {
    const hit = cache.get(companyId);
    if (hit && Date.now() - hit.cachedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        ...hit.result,
        company: hit.company,
        triggeringAlerts: hit.triggeringAlerts,
        cached: true,
        cachedAt: new Date(hit.cachedAt).toISOString(),
      });
    }
  }

  // ─── Load alerts ────────────────────────────────────────────
  const now = new Date();
  const recentCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const baselineCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Recent = last 24h negative articles + high/critical risks.
  // Baseline = the 7-day window BEFORE the last 24h (so the
  // comparison is "now vs the previous 6 days", not "now vs the
  // whole 7 days including now").
  const [recentArticles, baselineArticles, recentRisks] = await Promise.all([
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: recentCutoff },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: 200,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
    }),
    prisma.article.findMany({
      where: {
        companyId,
        sentimentLabel: "negative",
        publishedAt: { gte: baselineCutoff, lt: recentCutoff },
        ...demoFilter,
      },
      orderBy: { publishedAt: "desc" },
      take: 500,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        sentimentScore: true,
        sentimentLabel: true,
        publishedAt: true,
      },
    }),
    prisma.riskAssessment.findMany({
      where: {
        companyId,
        riskLevel: { in: ["high", "critical"] },
        ...demoFilter,
      },
      orderBy: { riskScore: "desc" },
      take: 10,
      select: {
        id: true,
        category: true,
        riskLevel: true,
        riskScore: true,
        trajectory: true,
        articleCount: true,
        createdAt: true,
      },
    }),
  ]);

  // Convert to CrisisAlert[] for the detector
  const recentAlerts: CrisisAlert[] = recentArticles.map(articleToCrisisAlert);
  const baselineAlerts: CrisisAlert[] = baselineArticles.map(articleToCrisisAlert);

  // Inject high/critical risk assessments as synthetic alerts (they
  // count toward velocity + severity escalation, but NOT toward
  // sentiment/source-spread since they have no sentiment/source).
  const nowMs = Date.now();
  for (const r of recentRisks) {
    const ts = r.createdAt ?? new Date();
    if (nowMs - ts.getTime() < 24 * 60 * 60 * 1000) {
      recentAlerts.push({
        id: r.id,
        title: `${r.category} risk — ${r.riskLevel}`,
        source: "HarchIQ Risk Engine",
        url: null,
        sentimentScore: r.riskLevel === "critical" ? -0.8 : -0.5,
        sentimentLabel: "negative",
        severity: r.riskLevel === "critical" ? "critical" : "high",
        publishedAt: ts,
      });
    }
  }

  // ─── Run the detector ───────────────────────────────────────
  const result = detectCrisis({ recentAlerts, baselineAlerts });

  // Top triggering alerts (full objects, for the UI to render)
  const triggerMap = new Map(recentAlerts.map((a) => [a.id, a]));
  const triggeringAlerts = result.triggeringAlertIds
    .map((id) => triggerMap.get(id))
    .filter((a): a is CrisisAlert => !!a);

  // ─── Cache + respond ────────────────────────────────────────
  const cacheEntry: CacheEntry = {
    result,
    triggeringAlerts,
    company: { name: company.name, slug: company.slug },
    cachedAt: nowMs,
  };
  cache.set(companyId, cacheEntry);

  return NextResponse.json({
    ...result,
    company: { name: company.name, slug: company.slug },
    triggeringAlerts,
    cached: false,
    cachedAt: new Date(nowMs).toISOString(),
  });
}

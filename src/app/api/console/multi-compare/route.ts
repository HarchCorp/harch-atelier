// ═══════════════════════════════════════════════════════════════
//  POST /api/console/multi-compare
//
//  Skill 33 — Multi-Client Comparison Matrix (Agency plan).
//
//  Compares up to 5 sub-clients (AgencyClient rows) side-by-side
//  across 9 metrics so the agency admin can see at a glance who's
//  thriving, who's churning, and who needs an intervention.
//
//  Body:
//    { clientIds: string[] }     // 1-5 AgencyClient IDs (cuid)
//
//  Returns:
//    {
//      clients: [{
//        id, name, companyId, sector, planTier,
//        score, sentiment, mentions, crisisAlerts,
//        health, mrr, plan, retention, harchiqUsage,
//        bestAxis, worstAxis
//      }],
//      bestPerformer: { id, name, health, score } | null,
//      worstPerformer: { id, name, health, score } | null,
//      radarData: Array<{ axis: string; [clientId: string]: number }>,
//      meta: { agencyName, generatedAt, clientCount, source }
//    }
//
//  Auth: session + accountType "agency" (or super-admin bypass) +
//        requireAgencyAdmin() — caller must own a registered Agency
//        and each requested clientId must belong to that agency.
//
//  Design: white / sage / charcoal, Space Mono + Inter, French, NO emojis.
//  Data source: Prisma (Neon Postgres). Real data only — demo rows
//  are filtered out by isDemo:false on every company-scoped query.
//
//  Skill ID: SKILL-33-MULTI-COMPARE
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { requireAgencyAdmin, AgencyAuthError } from "@/lib/agency/agency-session";
import { prisma } from "@/lib/db";
import { logError, logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 20;

// ─── Types ───────────────────────────────────────────────────────

interface ClientMetrics {
  id: string;
  name: string;
  companyId: string;
  sector: string | null;
  planTier: string;
  // 9 metrics
  score: number;           // 0-100 reputation score (0 if no data)
  sentiment: number;       // 0-100 % positive articles (7d)
  mentions: number;        // raw count of articles last 7 days
  crisisAlerts: number;    // count of high/critical risk assessments (30d)
  health: number;          // 0-100 composite (score + sentiment + low crisis)
  mrr: number;             // monthly recurring revenue in MAD
  plan: string;            // emergence | corporate | sovereign
  retention: number;       // 0-100 — based on last HarchIQ activity
  harchiqUsage: number;    // total HarchIQ questions asked by client users
  bestAxis: string | null; // axis name where this client scored highest
  worstAxis: string | null;// axis name where this client scored lowest
}

interface PerformerSummary {
  id: string;
  name: string;
  health: number;
  score: number;
}

interface RadarPoint {
  axis: string;
  // dynamic keys: one per clientId — value is 0-100 normalized
  [clientId: string]: string | number;
}

interface MultiCompareResponse {
  clients: ClientMetrics[];
  bestPerformer: PerformerSummary | null;
  worstPerformer: PerformerSummary | null;
  radarData: RadarPoint[];
  meta: {
    agencyName: string;
    generatedAt: string;
    clientCount: number;
    source: "neon" | "empty";
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/** French label for the AgencyQuota.planTier enum. */
function planLabel(planTier: string): string {
  switch (planTier) {
    case "sovereign":  return "Sovereign";
    case "corporate":  return "Corporate";
    case "emergence":
    default:           return "Emergence";
  }
}

/**
 * Composite health score, 0-100.
 *
 *   50% reputation score (overall signal of brand health)
 *   25% positive sentiment share (how the market feels right now)
 *   15% crisis safety (100 - crisisScore — higher = calmer)
 *   10% mention volume (capped at 100 — visibility proxy)
 *
 * All four components are 0-100 so the weighted average is well-defined.
 * If there's no data at all, health returns 0 (the popup renders "—").
 */
function computeHealth(params: {
  score: number;
  positivePct: number;
  crisisScore: number;
  mentions7d: number;
  maxMentions: number;
}): number {
  if (params.maxMentions <= 0) {
    // No traffic at all → no signal → health is 0.
    return 0;
  }
  const volumeNorm = Math.min(100, Math.round((params.mentions7d / params.maxMentions) * 100));
  const crisisSafety = Math.max(0, 100 - params.crisisScore);
  const raw =
    params.score * 0.5 +
    params.positivePct * 0.25 +
    crisisSafety * 0.15 +
    volumeNorm * 0.10;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Crisis score 0-100, mirrors brand-health calculation.
 *   negativeShare * 60  +  min(25, (articles24h / 50) * 25)
 * Higher = more crisis pressure.
 */
function computeCrisisScore(negativeShare: number, articles24h: number): number {
  return Math.min(
    100,
    Math.round(negativeShare * 60 + Math.min(25, (articles24h / 50) * 25)),
  );
}

/**
 * Retention score 0-100 based on days since the client's last
 * HarchIQ question. A client that hasn't asked anything in 90+ days
 * is at churn risk; one that asked within the week is fully engaged.
 *
 *   ≤7d   → 100
 *   ≤30d  → 85
 *   ≤90d  → 60
 *   ≤180d → 30
 *   else  → 10
 *   never → 0
 */
function computeRetention(daysSinceLastActivity: number | null): number {
  if (daysSinceLastActivity === null) return 0;
  if (daysSinceLastActivity <= 7)   return 100;
  if (daysSinceLastActivity <= 30)  return 85;
  if (daysSinceLastActivity <= 90)  return 60;
  if (daysSinceLastActivity <= 180) return 30;
  return 10;
}

/**
 * For a given client, find the axis (out of 6 radar axes) where
 * this client scored the highest / lowest relative to the others.
 * Returns the French axis label, or null if there's only one client.
 */
function findExtremeAxis(
  clientId: string,
  radarRows: Array<Record<string, number | string>>,
  mode: "best" | "worst",
): string | null {
  if (radarRows.length === 0) return null;
  let bestAxis: string | null = null;
  let bestDelta = mode === "best" ? -Infinity : Infinity;
  for (const row of radarRows) {
    const axis = String(row.axis);
    const mine = typeof row[clientId] === "number" ? (row[clientId] as number) : 0;
    const others = Object.entries(row)
      .filter(([k, v]) => k !== "axis" && k !== clientId && typeof v === "number")
      .map(([, v]) => v as number);
    if (others.length === 0) continue;
    const avgOthers = others.reduce((s, v) => s + v, 0) / others.length;
    const delta = mine - avgOthers;
    if (mode === "best" && delta > bestDelta) {
      bestDelta = delta;
      bestAxis = axis;
    }
    if (mode === "worst" && delta < bestDelta) {
      bestDelta = delta;
      bestAxis = axis;
    }
  }
  return bestAxis;
}

// ─── Per-client metrics fetcher ──────────────────────────────────

/**
 * Fetch all 9 metrics for one client in a single batched round-trip.
 * Returns null if the client can't be loaded (e.g. company missing).
 */
async function fetchClientMetrics(
  client: {
    id: string;
    companyId: string;
    displayName: string;
    company: { name: string; sector: string | null } | null;
    quota: {
      planTier: string;
      monthlyPriceMAD: number;
    } | null;
  },
  maxMentions: number,
): Promise<ClientMetrics | null> {
  const companyId = client.companyId;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const oneDayAgo = new Date(now.getTime() - 86400000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const oneYearAgo = new Date(now.getTime() - 365 * 86400000);

  try {
    const [
      reputationScore,
      articles24hCount,
      articles7dRaw,
      totalArticlesCount,
      crisisAlertsRaw,
      clientUsers,
    ] = await Promise.all([
      // 1. Latest reputation score (0-100)
      prisma.reputationScore.findFirst({
        where: { companyId },
        orderBy: { calculatedAt: "desc" },
        select: { overall: true, trend: true },
      }),
      // 2. Article count in last 24h (for crisis score volume component)
      prisma.article.count({
        where: { companyId, publishedAt: { gte: oneDayAgo }, isDemo: false },
      }),
      // 3. Articles in last 7d (sentiment + mentions metric)
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: sevenDaysAgo }, isDemo: false },
        select: { sentimentLabel: true },
        take: 500,
      }),
      // 4. Total articles ever (status signal: 0 = no data yet)
      prisma.article.count({
        where: { companyId, isDemo: false },
      }),
      // 5. Crisis alerts: high/critical risk assessments in last 30d
      prisma.riskAssessment.count({
        where: {
          companyId,
          riskLevel: { in: ["high", "critical"] },
          assessedAt: { gte: thirtyDaysAgo },
          isDemo: false,
        },
      }),
      // 6. All users linked to this company (for HarchIQ usage)
      prisma.user.findMany({
        where: { companyId },
        select: { id: true },
        take: 200,
      }),
    ]);

    // ── Sentiment (positive % of 7d articles) ───────────────────
    const positive = articles7dRaw.filter((a) => a.sentimentLabel === "positive").length;
    const negative = articles7dRaw.filter((a) => a.sentimentLabel === "negative").length;
    const totalSent = articles7dRaw.length || 1;
    const positivePct = Math.round((positive / totalSent) * 100);
    const negativeShare = negative / totalSent;

    // ── Crisis score (raw, used to derive crisis safety) ─────────
    const crisisScore = computeCrisisScore(negativeShare, articles24hCount);

    // ── Reputation score (0 if no ReputationScore row yet) ───────
    const score = totalArticlesCount === 0 ? 0 : Math.round(reputationScore?.overall ?? 0);

    // ── Health composite ─────────────────────────────────────────
    const health = computeHealth({
      score,
      positivePct,
      crisisScore,
      mentions7d: articles7dRaw.length,
      maxMentions,
    });

    // ── HarchIQ usage + retention ────────────────────────────────
    // Count all "harchiq_ask" audit logs for the company's users +
    // find the most recent timestamp (drives retention score).
    const userIds = clientUsers.map((u) => u.id);
    let harchiqUsage = 0;
    let lastActivityAt: Date | null = null;

    if (userIds.length > 0) {
      // Two tiny queries — count of all HarchIQ questions + the most
      // recent one (drives the retention score). groupBy with an empty
      // `by` is rejected by Prisma's type system, so we use the cleaner
      // count() + findFirst(desc) pattern instead.
      const [harchiqCount, lastLog] = await Promise.all([
        prisma.auditLog.count({
          where: {
            userId: { in: userIds },
            action: "harchiq_ask",
            createdAt: { gte: oneYearAgo },
          },
        }),
        prisma.auditLog.findFirst({
          where: {
            userId: { in: userIds },
            action: "harchiq_ask",
            createdAt: { gte: oneYearAgo },
          },
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
          take: 1,
        }),
      ]);
      harchiqUsage = harchiqCount;
      lastActivityAt = lastLog?.createdAt ?? null;
    }

    let daysSinceLastActivity: number | null = null;
    if (lastActivityAt) {
      daysSinceLastActivity = Math.floor(
        (now.getTime() - lastActivityAt.getTime()) / 86400000,
      );
    }
    const retention = computeRetention(daysSinceLastActivity);

    return {
      id: client.id,
      name: client.displayName || client.company?.name || "Client",
      companyId: client.companyId,
      sector: client.company?.sector ?? null,
      planTier: client.quota?.planTier ?? "emergence",
      score,
      sentiment: totalArticlesCount === 0 ? 0 : positivePct,
      mentions: articles7dRaw.length,
      crisisAlerts: crisisAlertsRaw,
      health,
      mrr: client.quota?.monthlyPriceMAD ?? 0,
      plan: planLabel(client.quota?.planTier ?? "emergence"),
      retention,
      harchiqUsage,
      bestAxis: null,  // filled in pass 2 (needs all clients)
      worstAxis: null, // filled in pass 2
    };
  } catch (err) {
    logError("multi-compare", `[fetchClientMetrics] client=${client.id} err=${err}`);
    return null;
  }
}

// ─── Main POST handler ───────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Auth — session + agency plan + agency context
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, ["agency"])) {
    return NextResponse.json(
      { error: "Plan agence requis — réservé aux comptes agence." },
      { status: 403 },
    );
  }

  let ctx;
  try {
    ctx = await requireAgencyAdmin();
  } catch (err) {
    if (err instanceof AgencyAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  // 2. Parse + validate body
  let body: { clientIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const rawIds = Array.isArray(body.clientIds) ? body.clientIds : [];
  const clientIds = Array.from(
    new Set(
      rawIds
        .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        .map((v) => v.trim()),
    ),
  );

  if (clientIds.length === 0) {
    return NextResponse.json(
      { error: "Sélectionnez au moins un client à comparer." },
      { status: 400 },
    );
  }
  if (clientIds.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 clients comparables simultanément." },
      { status: 400 },
    );
  }

  try {
    // 3. Fetch the requested AgencyClient rows, scoped to the caller's
    //    agency (defence-in-depth: a forged clientId from another agency
    //    is silently filtered out by the where clause).
    const clients = await prisma.agencyClient.findMany({
      where: {
        id: { in: clientIds },
        agencyId: ctx.agencyId,
        status: "active",
      },
      select: {
        id: true,
        companyId: true,
        displayName: true,
        company: { select: { name: true, sector: true } },
        quota: { select: { planTier: true, monthlyPriceMAD: true } },
      },
    });

    if (clients.length === 0) {
      return NextResponse.json(
        {
          clients: [],
          bestPerformer: null,
          worstPerformer: null,
          radarData: [],
          meta: {
            agencyName: ctx.agency.name,
            generatedAt: new Date().toISOString(),
            clientCount: 0,
            source: "empty" as const,
          },
        } satisfies MultiCompareResponse,
        { status: 200 },
      );
    }

    // 4. Pre-compute max mentions across all selected clients (used
    //    to normalize the Volume axis on the radar). We do one batch
    //    count query first, then fetch the full metrics per client.
    const mentionsByClient = await prisma.article.groupBy({
      by: ["companyId"],
      where: {
        companyId: { in: clients.map((c) => c.companyId) },
        publishedAt: { gte: new Date(Date.now() - 7 * 86400000) },
        isDemo: false,
      },
      _count: { _all: true },
    });
    const mentionsMap = new Map<string, number>();
    for (const row of mentionsByClient) {
      // Article.companyId is nullable in the schema, but our where clause
      // filters by `in: [...]` so null rows are excluded at the DB level.
      if (row.companyId) {
        mentionsMap.set(row.companyId, row._count._all);
      }
    }
    const maxMentions = Math.max(1, ...mentionsMap.values());

    // 5. Fetch metrics for each client in parallel.
    const metricsOrNull = await Promise.all(
      clients.map((c) => fetchClientMetrics(c, maxMentions)),
    );
    const metrics = metricsOrNull.filter(
      (m): m is ClientMetrics => m !== null,
    );

    if (metrics.length === 0) {
      return NextResponse.json(
        {
          clients: [],
          bestPerformer: null,
          worstPerformer: null,
          radarData: [],
          meta: {
            agencyName: ctx.agency.name,
            generatedAt: new Date().toISOString(),
            clientCount: 0,
            source: "empty" as const,
          },
        } satisfies MultiCompareResponse,
        { status: 200 },
      );
    }

    // 6. Build radar data — 6 axes, 0-100 normalized per axis.
    //    Each row is one axis; keys are clientIds + an "axis" label.
    const axisDefs: Array<{
      axis: string;
      valueOf: (m: ClientMetrics) => number;
    }> = [
      { axis: "Réputation", valueOf: (m) => m.score },
      { axis: "Sentiment",  valueOf: (m) => m.sentiment },
      {
        axis: "Volume",
        valueOf: (m) => Math.min(100, Math.round((m.mentions / maxMentions) * 100)),
      },
      {
        axis: "Stabilité",
        // higher = fewer crisis alerts (cap at 5 → 0, 0 alerts → 100)
        valueOf: (m) => Math.max(0, 100 - Math.min(100, m.crisisAlerts * 20)),
      },
      { axis: "Santé",      valueOf: (m) => m.health },
      { axis: "Rétention",  valueOf: (m) => m.retention },
    ];

    const radarData: RadarPoint[] = axisDefs.map(({ axis, valueOf }) => {
      const row: RadarPoint = { axis };
      for (const m of metrics) {
        row[m.id] = valueOf(m);
      }
      return row;
    });

    // 7. Per-client best/worst axis (relative to peer average).
    for (const m of metrics) {
      m.bestAxis = findExtremeAxis(m.id, radarData, "best");
      m.worstAxis = findExtremeAxis(m.id, radarData, "worst");
    }

    // 8. Best + worst performer by health (ties broken by score, then mentions).
    let best: ClientMetrics | null = null;
    let worst: ClientMetrics | null = null;
    for (const m of metrics) {
      if (
        best === null ||
        m.health > best.health ||
        (m.health === best.health && m.score > best.score)
      ) {
        best = m;
      }
      if (
        worst === null ||
        m.health < worst.health ||
        (m.health === worst.health && m.score < worst.score)
      ) {
        worst = m;
      }
    }
    // If only one client, best === worst — suppress both badges.
    const bestPerformer: PerformerSummary | null =
      metrics.length >= 2 && best
        ? { id: best.id, name: best.name, health: best.health, score: best.score }
        : null;
    const worstPerformer: PerformerSummary | null =
      metrics.length >= 2 && worst && best && worst.id !== best.id
        ? { id: worst.id, name: worst.name, health: worst.health, score: worst.score }
        : null;

    // 9. Sort clients by health desc for the default view.
    metrics.sort((a, b) => {
      if (b.health !== a.health) return b.health - a.health;
      if (b.score !== a.score) return b.score - a.score;
      return b.mentions - a.mentions;
    });

    logInfo(
      "multi-compare",
      `[POST] agency=${ctx.agency.slug} clients=${metrics.length} best=${bestPerformer?.name ?? "-"}`,
    );

    return NextResponse.json({
      clients: metrics,
      bestPerformer,
      worstPerformer,
      radarData,
      meta: {
        agencyName: ctx.agency.name,
        generatedAt: new Date().toISOString(),
        clientCount: metrics.length,
        source: "neon" as const,
      },
    } satisfies MultiCompareResponse);
  } catch (err) {
    logError("multi-compare", `[POST] unexpected: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur inconnue." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeCron } from "@/lib/auth/cron";
import { logError } from "@/lib/logger";

// ═══════════════════════════════════════════════════════════════
//  /api/cron/notifications
//
//  Scheduled every 10 minutes by Vercel Cron. For each user, scans
//  for new critical/high alerts (negative articles + high/critical
//  risk assessments) that have appeared since the last run and
//  creates Notification records.
//
//  Dedup strategy: before inserting, we check whether a notification
//  with the same (userId, type, title, link) already exists. This
//  makes the job idempotent — re-running it for the same window
//  won't produce duplicates.
//
//  Auth: CRON_SECRET via Authorization: Bearer header (constant-time
//  comparison handled by authorizeCron).
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

// How far back to look for "new" alerts. Matches the cron cadence
// (10 min) plus a 5-min safety overlap so we never miss an alert
// that was published between two runs.
const LOOKBACK_MINUTES = 15;

export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const since = new Date();
    since.setMinutes(since.getMinutes() - LOOKBACK_MINUTES);

    // Resolve every user that belongs to an accountType that has
    // access to the console alerts (brand-monitor, market-competitor,
    // investment-bank). Harch Alpha users monitor assets, not
    // articles — they don't receive article-driven alerts here.
    const users = await prisma.user.findMany({
      where: {
        accountType: { in: ["brand-monitor", "market-competitor", "investment-bank"] },
      },
      select: { id: true, accountType: true, name: true, email: true },
    });

    // Resolve the primary company (same convention as the alerts API:
    // first company by createdAt ascending). All console users share
    // the same primary company for now — when per-user company
    // scoping is added, this becomes a per-user lookup.
    const company = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, slug: true },
    });

    if (!company) {
      return NextResponse.json({ ok: true, created: 0, reason: "no-company" });
    }

    // Fetch the new alerts once — same logic as /api/console/alerts
    const [negativeArticles, highRisks] = await Promise.all([
      prisma.article.findMany({
        where: {
          companyId: company.id,
          sentimentLabel: "negative",
          publishedAt: { gte: since },
        },
        orderBy: { publishedAt: "desc" },
        take: 20,
        select: {
          id: true,
          title: true,
          source: true,
          url: true,
          sentimentScore: true,
          publishedAt: true,
        },
      }),
      prisma.riskAssessment.findMany({
        where: {
          companyId: company.id,
          riskLevel: { in: ["high", "critical"] },
          assessedAt: { gte: since },
        },
        orderBy: { riskScore: "desc" },
        take: 10,
        select: { id: true, category: true, riskLevel: true, riskScore: true, assessedAt: true },
      }),
    ]);

    // Build the candidate notification payloads (per-user fan-out)
    interface CandidateNotif {
      userId: string;
      type: "alert" | "threshold";
      title: string;
      body: string;
      severity: "warning" | "critical";
      link: string;
      dedupKey: string;
    }

    const candidates: CandidateNotif[] = [];

    for (const a of negativeArticles) {
      const severity = (a.sentimentScore ?? 0) < -0.6 ? "critical" : "warning";
      const title = a.title.length > 100 ? `${a.title.slice(0, 100)}…` : a.title;
      const body = `Negative coverage on ${a.source}${a.publishedAt ? ` · ${a.publishedAt.toISOString().slice(0, 10)}` : ""}`;
      const link = a.url ?? `/atelier/console`;
      const dedupKey = `alert:${a.id}`;
      for (const u of users) {
        candidates.push({
          userId: u.id,
          type: "alert",
          title,
          body,
          severity,
          link,
          dedupKey: `${u.id}:${dedupKey}`,
        });
      }
    }

    for (const r of highRisks) {
      const severity = r.riskLevel === "critical" ? "critical" : "warning";
      const title = `${r.category} risk — ${r.riskLevel}`;
      const body = `Risk score ${r.riskScore}/100 on ${company.name}. Trajectory requires review.`;
      const link = `/atelier/console`;
      const dedupKey = `risk:${r.id}`;
      for (const u of users) {
        candidates.push({
          userId: u.id,
          type: "threshold",
          title,
          body,
          severity,
          link,
          dedupKey: `${u.id}:${dedupKey}`,
        });
      }
    }

    if (candidates.length === 0) {
      return NextResponse.json({
        ok: true,
        created: 0,
        scanned: users.length,
        candidates: 0,
        since: since.toISOString(),
      });
    }

    // Dedup — only insert notifications whose (userId, title, link)
    // combination doesn't already exist. This makes the job safe to
    // re-run for the same window.
    const existing = await prisma.notification.findMany({
      where: {
        OR: candidates.map((c) => ({
          userId: c.userId,
          title: c.title,
          link: c.link,
        })),
      },
      select: { userId: true, title: true, link: true },
    });
    const existingKeys = new Set(
      existing.map((e) => `${e.userId}|${e.title}|${e.link ?? ""}`)
    );

    const toCreate = candidates.filter(
      (c) => !existingKeys.has(`${c.userId}|${c.title}|${c.link ?? ""}`)
    );

    if (toCreate.length === 0) {
      return NextResponse.json({
        ok: true,
        created: 0,
        scanned: users.length,
        candidates: candidates.length,
        deduped: candidates.length,
        since: since.toISOString(),
      });
    }

    await prisma.notification.createMany({
      data: toCreate.map((c) => ({
        userId: c.userId,
        type: c.type,
        title: c.title,
        body: c.body,
        severity: c.severity,
        read: false,
        link: c.link,
      })),
    });

    return NextResponse.json({
      ok: true,
      created: toCreate.length,
      scanned: users.length,
      candidates: candidates.length,
      deduped: candidates.length - toCreate.length,
      since: since.toISOString(),
    });
  } catch (err) {
    logError("cron.notifications", `Cron notifications error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

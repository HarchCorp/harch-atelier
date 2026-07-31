// ═══════════════════════════════════════════════════════════════
//  GET /api/cron/generate-reports
//
//  Monthly cron — runs on the 1st of each month at 01:00 UTC.
//  For every user on an enterprise plan (brand-monitor,
//  market-competitor, investment-bank) generates a new Report row
//  covering the PREVIOUS calendar month.
//
//  Auth: CRON_SECRET via `Authorization: Bearer <secret>` header.
//
//  The report's `sections` JSON column is hydrated with:
//    • metrics: { reputationScore, sentimentBreakdown, alertCount, aiVisibilityScore }
//    • alerts: [{ date, source, title, sentiment, severity }]
//    • aiEngines: [{ engine, rank, mentions, sentiment }]
//    • recommendations: string[]
//    • sentimentTrend: [{ date, positive, neutral, negative }]  (daily, last 30d)
//    • sources: [{ source, articles, sentiment }]
//    • topThreats / topOpportunities: subset of alerts
//
//  Idempotent: uses @@unique([userId, period]) so re-running the
//  cron for the same month updates the existing row instead of
//  creating a duplicate.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authorizeCron } from "@/lib/auth/cron";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Period helpers ─────────────────────────────────────────────

function getPreviousMonth(now: Date): { period: string; start: Date; end: Date; label: string } {
  // Previous calendar month.
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth(); // 0-11; current month
  // Start of previous month (UTC)
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  // End of previous month = start of current month
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
  const period = `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`;
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const label = `${months[start.getUTCMonth()]} ${start.getUTCFullYear()}`;
  return { period, start, end, label };
}

function dayKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

// ─── Section builders ───────────────────────────────────────────

interface AlertRow {
  date: string;
  source: string;
  title: string;
  sentiment: string;
  severity: string;
}

interface AiEngineRow {
  engine: string;
  rank: number;
  mentions: number;
  sentiment: string;
}

interface SentimentDayRow {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SourceRow {
  source: string;
  articles: number;
  sentiment: string;
}

function buildRecommendations(opts: {
  reputationScore: number;
  alertCount: number;
  negativePct: number;
  aiVisibilityScore: number;
  criticalAlerts: number;
}): string[] {
  const recs: string[] = [];
  if (opts.criticalAlerts > 0) {
    recs.push(
      `Address ${opts.criticalAlerts} critical alert(s) immediately — convene the crisis comms cell and prepare a holding statement within 24 hours.`
    );
  }
  if (opts.negativePct > 30) {
    recs.push(
      `Negative coverage is elevated at ${opts.negativePct}% of total volume. Prioritise outreach to the top 3 negative sources and prepare a counter-narrative briefing.`
    );
  } else {
    recs.push(
      `Negative coverage is contained at ${opts.negativePct}%. Continue the current media engagement cadence and monitor for emerging risks.`
    );
  }
  if (opts.reputationScore < 50) {
    recs.push(
      `Reputation score (${opts.reputationScore}/100) is below the 50-point threshold. Recommend a structured reputation-recovery programme over the next 90 days.`
    );
  } else if (opts.reputationScore >= 75) {
    recs.push(
      `Reputation score (${opts.reputationScore}/100) is strong. Capitalise on positive momentum with thought-leadership placements in tier-1 outlets.`
    );
  } else {
    recs.push(
      `Reputation score (${opts.reputationScore}/100) is moderate. Focus on the two weakest pillars identified in the radar to lift the index above 75.`
    );
  }
  if (opts.aiVisibilityScore < 30) {
    recs.push(
      `AI visibility is low (${opts.aiVisibilityScore}%). Publish structured, authoritative content (FAQs, schema.org markup, long-form explainers) to increase LLM citation rates.`
    );
  } else if (opts.aiVisibilityScore >= 60) {
    recs.push(
      `AI visibility is healthy (${opts.aiVisibilityScore}%). Maintain the content cadence and monitor for drift in LLM rankings next cycle.`
    );
  } else {
    recs.push(
      `AI visibility is moderate (${opts.aiVisibilityScore}%). Identify the 2 lowest-ranking engines and run targeted probe queries to diagnose the gap.`
    );
  }
  recs.push(
    "Schedule a follow-up review at the start of the next reporting cycle to measure progress against these actions."
  );
  return recs;
}

function buildSummary(opts: {
  label: string;
  companyName: string;
  reputationScore: number;
  positivePct: number;
  negativePct: number;
  alertCount: number;
  criticalCount: number;
  aiVisibilityScore: number;
}): string {
  const tone = opts.positivePct > opts.negativePct ? "net-positive" : "net-negative";
  const criticalNote = opts.criticalCount > 0
    ? ` ${opts.criticalCount} critical alert(s) require immediate attention.`
    : " No critical alerts were recorded.";
  return (
    `Monthly intelligence report for ${opts.companyName}, covering ${opts.label}. ` +
    `Reputation score stands at ${opts.reputationScore}/100, with a ${tone} sentiment profile ` +
    `(${opts.positivePct}% positive, ${opts.negativePct}% negative). ` +
    `${opts.alertCount} alert(s) were flagged during the period.${criticalNote} ` +
    `AI visibility across the 8 monitored LLMs is ${opts.aiVisibilityScore}%.`
  );
}

// ─── Main handler ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

async function handle(req: NextRequest) {
  // 1. CRON_SECRET auth
  if (!authorizeCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { period, start, end, label } = getPreviousMonth(new Date());
  const startedAt = Date.now();
  const results = {
    period,
    label,
    usersProcessed: 0,
    reportsCreated: 0,
    reportsUpdated: 0,
    skipped: 0,
    errors: [] as string[],
  };

  logInfo("cron.generate-reports", `start period=${period} label=${label}`);

  try {
    // 2. Find all enterprise users (exclude harch-alpha traders and admins without a company)
    const users = await prisma.user.findMany({
      where: {
        accountType: { in: ["brand-monitor", "market-competitor", "investment-bank"] },
      },
      select: { id: true, email: true, name: true, accountType: true },
    });

    // 3. Primary company — same heuristic as /api/console/reports
    //    (first company by createdAt). In a multi-tenant future this
    //    would be a user.primaryCompanyId field.
    const primaryCompany = await prisma.company.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!primaryCompany) {
      logInfo("cron.generate-reports", "no companies in DB — nothing to report on");
      return NextResponse.json({ status: "no-op", ...results });
    }

    for (const user of users) {
      results.usersProcessed++;
      try {
        // 4. Pull all telemetry for the period
        const [articles, reputationScore, aiVisibilityRows, highRisks] = await Promise.all([
          prisma.article.findMany({
            where: {
              companyId: primaryCompany.id,
              publishedAt: { gte: start, lt: end },
            },
            select: {
              title: true,
              source: true,
              sentimentLabel: true,
              sentimentScore: true,
              publishedAt: true,
            },
          }),
          prisma.reputationScore.findFirst({
            where: {
              companyId: primaryCompany.id,
              calculatedAt: { gte: start, lt: end },
            },
            orderBy: { calculatedAt: "desc" },
          }),
          prisma.aIVisibility.findMany({
            where: {
              companyId: primaryCompany.id,
              checkedAt: { gte: start, lt: end },
            },
            orderBy: { checkedAt: "desc" },
            select: { platform: true, cited: true, position: true, sentiment: true },
          }),
          prisma.riskAssessment.findMany({
            where: {
              companyId: primaryCompany.id,
              assessedAt: { gte: start, lt: end },
              riskLevel: { in: ["high", "critical"] },
            },
            orderBy: { riskScore: "desc" },
            take: 10,
            select: { category: true, riskLevel: true, riskScore: true, trajectory: true },
          }),
        ]);

        // 5. Compute metrics
        const positive = articles.filter((a) => a.sentimentLabel === "positive").length;
        const negative = articles.filter((a) => a.sentimentLabel === "negative").length;
        const neutral = articles.filter((a) => a.sentimentLabel === "neutral").length;
        const total = articles.length;
        const positivePct = total > 0 ? Math.round((positive / total) * 100) : 0;
        const neutralPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
        const negativePct = total > 0 ? Math.round((negative / total) * 100) : 0;

        // 6. Build alert rows (negative articles + high/critical risks)
        const alertRows: AlertRow[] = [];
        for (const a of articles) {
          if (a.sentimentLabel !== "negative") continue;
          const sev = (a.sentimentScore ?? 0) < -0.6 ? "critical" : "high";
          alertRows.push({
            date: a.publishedAt ? dayKey(a.publishedAt) : dayKey(start),
            source: a.source,
            title: a.title,
            sentiment: "negative",
            severity: sev,
          });
        }
        for (const r of highRisks) {
          alertRows.push({
            date: dayKey(start),
            source: "HarchIQ Risk Engine",
            title: `${r.category} risk — ${r.riskLevel}`,
            sentiment: "negative",
            severity: r.riskLevel === "critical" ? "critical" : "high",
          });
        }
        // Cap the alerts log to the most recent 50 rows (keeps the PDF manageable)
        const alertsCapped = alertRows.slice(0, 50);
        const criticalCount = alertRows.filter((a) => a.severity === "critical").length;

        // 7. Build AI engine rows (latest per platform)
        const platformMap = new Map<string, (typeof aiVisibilityRows)[number]>();
        for (const av of aiVisibilityRows) {
          if (!platformMap.has(av.platform)) platformMap.set(av.platform, av);
        }
        const knownEngines = [
          "ChatGPT", "Perplexity", "Gemini", "Claude",
          "Copilot", "Grok", "Meta AI", "Mistral",
        ];
        const aiEngines: AiEngineRow[] = knownEngines.map((engine, idx) => {
          const row = platformMap.get(engine);
          const cited = row?.cited ?? false;
          return {
            engine,
            rank: cited && row?.position ? parseInt(row.position, 10) || (idx + 1) : 0,
            mentions: cited ? 1 : 0,
            sentiment: row?.sentiment ?? "—",
          };
        });
        // Add any platforms present in DB but not in our known list
        for (const [platform, row] of platformMap.entries()) {
          if (!knownEngines.includes(platform)) {
            aiEngines.push({
              engine: platform,
              rank: row.cited && row.position ? parseInt(row.position, 10) || 0 : 0,
              mentions: row.cited ? 1 : 0,
              sentiment: row.sentiment ?? "—",
            });
          }
        }
        const citedEngines = aiEngines.filter((e) => e.mentions > 0).length;
        const aiVisibilityScore = aiEngines.length > 0
          ? Math.round((citedEngines / aiEngines.length) * 100)
          : 0;

        // 8. Build 30-day sentiment trend (bucket articles by day)
        const sentimentTrend: SentimentDayRow[] = [];
        const trendWindowStart = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        const articlesInTrendWindow = await prisma.article.findMany({
          where: {
            companyId: primaryCompany.id,
            publishedAt: { gte: trendWindowStart, lt: end },
          },
          select: { sentimentLabel: true, publishedAt: true },
        });
        const dayBuckets = new Map<string, { pos: number; neu: number; neg: number }>();
        for (const a of articlesInTrendWindow) {
          if (!a.publishedAt) continue;
          const key = dayKey(a.publishedAt);
          const bucket = dayBuckets.get(key) ?? { pos: 0, neu: 0, neg: 0 };
          if (a.sentimentLabel === "positive") bucket.pos++;
          else if (a.sentimentLabel === "negative") bucket.neg++;
          else bucket.neu++;
          dayBuckets.set(key, bucket);
        }
        const sortedDays = Array.from(dayBuckets.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
        for (const [date, b] of sortedDays) {
          const dayTotal = b.pos + b.neu + b.neg;
          sentimentTrend.push({
            date,
            positive: dayTotal > 0 ? Math.round((b.pos / dayTotal) * 100) : 0,
            neutral: dayTotal > 0 ? Math.round((b.neu / dayTotal) * 100) : 0,
            negative: dayTotal > 0 ? Math.round((b.neg / dayTotal) * 100) : 0,
          });
        }

        // 9. Build source distribution
        const sourceMap = new Map<string, { pos: number; neu: number; neg: number; total: number }>();
        for (const a of articles) {
          const s = sourceMap.get(a.source) ?? { pos: 0, neu: 0, neg: 0, total: 0 };
          s.total++;
          if (a.sentimentLabel === "positive") s.pos++;
          else if (a.sentimentLabel === "negative") s.neg++;
          else s.neu++;
          sourceMap.set(a.source, s);
        }
        const sources: SourceRow[] = Array.from(sourceMap.entries())
          .map(([source, s]) => ({
            source,
            articles: s.total,
            sentiment: s.pos > s.neg && s.pos > s.neu ? "positive" : s.neg > s.neu ? "negative" : "neutral",
          }))
          .sort((a, b) => b.articles - a.articles)
          .slice(0, 12);

        // 10. Top threats / opportunities
        const topThreats = alertRows
          .filter((a) => a.severity === "critical" || a.severity === "high")
          .slice(0, 3);
        const topOpportunities = articles
          .filter((a) => a.sentimentLabel === "positive")
          .slice(0, 3)
          .map<AlertRow>((a) => ({
            date: a.publishedAt ? dayKey(a.publishedAt) : dayKey(start),
            source: a.source,
            title: a.title,
            sentiment: "positive",
            severity: "low",
          }));

        // 11. Reputation score: prefer the period's value, fallback to latest ever
        const reputationScoreValue = reputationScore?.overall
          ?? (await prisma.reputationScore.findFirst({
                where: { companyId: primaryCompany.id },
                orderBy: { calculatedAt: "desc" },
                select: { overall: true },
              }))?.overall
          ?? 0;

        // 12. Recommendations
        const recommendations = buildRecommendations({
          reputationScore: Math.round(reputationScoreValue),
          alertCount: alertRows.length,
          negativePct,
          aiVisibilityScore,
          criticalAlerts: criticalCount,
        });

        // 13. Summary
        const summary = buildSummary({
          label,
          companyName: primaryCompany.name,
          reputationScore: Math.round(reputationScoreValue),
          positivePct,
          negativePct,
          alertCount: alertRows.length,
          criticalCount,
          aiVisibilityScore,
        });

        // 14. Sections JSON
        const sections = {
          metrics: {
            reputationScore: Math.round(reputationScoreValue),
            sentimentBreakdown: { positive, neutral, negative },
            alertCount: alertRows.length,
            aiVisibilityScore,
          },
          alerts: alertsCapped,
          aiEngines,
          recommendations,
          sentimentTrend,
          sources,
          topThreats,
          topOpportunities,
          user: { company: primaryCompany.name },
        };

        // 15. Upsert the Report (idempotent on [userId, period])
        const existing = await prisma.report.findUnique({
          where: { userId_period: { userId: user.id, period } },
          select: { id: true },
        });

        if (existing) {
          await prisma.report.update({
            where: { id: existing.id },
            data: {
              title: "Monthly Intelligence Report",
              summary,
              sections: sections as object,
              status: "ready",
              companyId: primaryCompany.id,
            },
          });
          results.reportsUpdated++;
        } else {
          await prisma.report.create({
            data: {
              userId: user.id,
              companyId: primaryCompany.id,
              title: "Monthly Intelligence Report",
              period,
              summary,
              sections: sections as object,
              status: "ready",
            },
          });
          results.reportsCreated++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        results.errors.push(`user ${user.email}: ${msg}`);
        logError("cron.generate-reports", `user ${user.email} failed: ${msg}`);
      }
    }

    const durationMs = Date.now() - startedAt;
    logInfo("cron.generate-reports", `complete in ${durationMs}ms`, results);

    return NextResponse.json({
      status: "ok",
      durationMs,
      ...results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("cron.generate-reports", `fatal: ${msg}`);
    return NextResponse.json(
      { status: "error", error: msg, ...results },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scraperQueue, nlpQueue } from "@/lib/queue";
import { COMPANIES } from "@/lib/scrapers/sources-config";
import { logInfo, logError } from "@/lib/logger";

// AEGIS: Single dispatch endpoint — triggered by GitHub Actions every 4 hours
// Replaces all individual Vercel cron endpoints to stay within Free plan limits

export async function GET(request: NextRequest) {
  return handleDispatch(request);
}

export async function POST(request: NextRequest) {
  return handleDispatch(request);
}

async function handleDispatch(request: NextRequest) {
  // 1. Validate CRON_SECRET
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const startTime = Date.now();
  const results = {
    scrapeJobsQueued: 0,
    nlpJobsQueued: 0,
    jobsCleaned: 0,
    errors: [] as string[],
  };

  try {
    // 2. Queue scrape jobs for all companies
    try {
      const scrapeJobs = COMPANIES.map((company) => ({
        name: `scrape:${company.slug}`,
        data: {
          companyName: company.name,
          companySlug: company.slug,
        },
      }));

      await scraperQueue.addBulk(scrapeJobs);
      results.scrapeJobsQueued = scrapeJobs.length;
      logInfo("cron.dispatch", `Queued ${scrapeJobs.length} scrape jobs`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Scrape queue failed: ${msg}`);
      logError("cron.dispatch", `Scrape queue failed: ${msg}`);
    }

    // 3. Queue NLP jobs for companies with unprocessed articles
    try {
      const companiesWithUnprocessed = await prisma.company.findMany({
        where: {
          articles: {
            some: { processed: false },
          },
        },
        select: { id: true, slug: true, name: true },
      });

      const nlpJobs = companiesWithUnprocessed.map((company) => ({
        name: `nlp:${company.slug}`,
        data: {
          companySlug: company.slug,
          companyId: company.id,
          companyName: company.name,
        },
      }));

      if (nlpJobs.length > 0) {
        await nlpQueue.addBulk(nlpJobs);
        results.nlpJobsQueued = nlpJobs.length;
        logInfo("cron.dispatch", `Queued ${nlpJobs.length} NLP jobs`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`NLP queue failed: ${msg}`);
      logError("cron.dispatch", `NLP queue failed: ${msg}`);
    }

    // 4. Clean up Jobs older than 24 hours
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const deletedJobs = await prisma.job.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      const deletedCache = await prisma.gLMAnalysis.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      results.jobsCleaned = deletedJobs.count + deletedCache.count;
      logInfo("cron.dispatch", `Cleaned ${results.jobsCleaned} old records (jobs + GLM cache)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      results.errors.push(`Cleanup failed: ${msg}`);
      logError("cron.dispatch", `Cleanup failed: ${msg}`);
    }

    const durationMs = Date.now() - startTime;
    logInfo("cron.dispatch", `Dispatch complete in ${durationMs}ms`, results);

    return NextResponse.json({
      status: "dispatched",
      durationMs,
      ...results,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logError("cron.dispatch", `Fatal dispatch error: ${msg}`);
    return NextResponse.json(
      { status: "error", error: msg, ...results },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/console/first-scrape
//
//  Triggers an immediate RSS scrape for the user's company.
//  Called automatically by the dashboard when brand-health returns
//  status: "no_data" (0 articles for this company).
//
//  Flow:
//    1. Auth check (any logged-in user)
//    2. Resolve user's companyId → company name
//    3. Call scrapeForCompany(companyName)
//    4. Upsert articles to DB (linked to companyId)
//    5. Return { scraped: N, company: name }
//
//  maxDuration: 300s (5 min) — scraping 50 Google News + 10 RSS
//  feeds can take 30-90s depending on network.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo, logError } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json(
      { error: "No company linked to your account. Complete onboarding first." },
      { status: 400 },
    );
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true, aliases: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Check if already scraped (avoid re-scraping if data exists)
  const existingCount = await prisma.article.count({
    where: { companyId },
  });

  if (existingCount >= 10) {
    return NextResponse.json({
      skipped: true,
      message: `Already have ${existingCount} articles. Use regular refresh instead.`,
      count: existingCount,
    });
  }

  logInfo("first-scrape", `Triggering scrape for ${company.name} (${existingCount} existing articles)`);

  try {
    // Dynamic import to avoid loading scraper on every request
    const { scrapeForCompany } = await import("@/lib/scrapers/rss-scraper");

    const articles = await scrapeForCompany(company.name);

    logInfo("first-scrape", `Scraped ${articles.length} articles for ${company.name}`);

    // Upsert articles to DB
    let inserted = 0;
    for (const article of articles.slice(0, 50)) {
      try {
        // Generate urlHash if not present
        const urlHash = (article as { urlHash?: string }).urlHash
          ?? crypto.randomUUID();

        await prisma.article.upsert({
          where: { urlHash },
          create: {
            url: article.url.slice(0, 2000),
            urlHash,
            title: article.title.slice(0, 500),
            content: (article.content ?? article.summary ?? "").slice(0, 50000) || null,
            summary: (article.summary ?? "").slice(0, 2000) || null,
            publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
            source: (article.sourceName ?? "Unknown").slice(0, 200),
            sourceId: article.sourceId ?? null,
            language: article.language ?? "fr",
            companyId,
            sentimentLabel: article.sentiment ?? null,
            sentimentScore: article.sentimentScore ?? null,
          },
          update: {
            companyId, // re-link if article existed without company
          },
        });
        inserted++;
      } catch {
        // Skip individual article errors
      }
    }

    logInfo("first-scrape", `Inserted ${inserted}/${articles.length} articles for ${company.name}`);

    // ─── MATCHING: run company matching on all unlinked articles ───
    let matched = 0;
    try {
      const { matchArticlesForCompany, zeroMatchProtocol } = await import("@/lib/harchiq/company-matching");

      if (inserted === 0 && existingCount === 0) {
        // Zero-match protocol — try harder
        logInfo("first-scrape", `0 articles found — running zero-match protocol for ${company.name}`);
        const zeroResult = await zeroMatchProtocol(companyId);
        matched = zeroResult.found;
        logInfo("first-scrape", `Zero-match result: ${zeroResult.found} via ${zeroResult.method}`);
      } else {
        // Run matching on all articles (catches ones that mention the company
        // but weren't linked during scrape)
        const matchResults = await matchArticlesForCompany(companyId);
        matched = matchResults.length;
        logInfo("first-scrape", `Matched ${matched} articles for ${company.name}`);
      }
    } catch (matchErr) {
      logInfo("first-scrape", `Matching failed (non-fatal): ${matchErr}`);
    }

    const totalNow = existingCount + inserted + matched;

    return NextResponse.json({
      success: true,
      company: company.name,
      scraped: articles.length,
      inserted,
      matched,
      totalNow,
    });
  } catch (err) {
    logError("first-scrape", `Scrape failed for ${company.name}: ${err}`);
    return NextResponse.json(
      { error: "Scrape failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

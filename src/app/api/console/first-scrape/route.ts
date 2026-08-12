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
        await prisma.article.upsert({
          where: { urlHash: article.urlHash },
          create: {
            url: article.url,
            urlHash: article.urlHash,
            title: article.title.slice(0, 500),
            description: article.description?.slice(0, 2000) ?? null,
            content: article.content?.slice(0, 50000) ?? null,
            publishedAt: article.publishedAt,
            sourceName: article.source,
            sourceUrl: article.sourceUrl ?? null,
            sourceType: article.sourceType ?? "rss",
            language: article.language ?? "fr",
            companyId,
            sentimentLabel: article.sentiment?.label ?? null,
            sentimentScore: article.sentiment?.score ?? null,
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

    return NextResponse.json({
      success: true,
      company: company.name,
      scraped: articles.length,
      inserted,
      totalNow: existingCount + inserted,
    });
  } catch (err) {
    logError("first-scrape", `Scrape failed for ${company.name}: ${err}`);
    return NextResponse.json(
      { error: "Scrape failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

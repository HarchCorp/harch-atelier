// ═══════════════════════════════════════════════════════════════
//  SCRAPE API — Manually trigger a scrape for a company
//  POST /api/atelier/scrape  Body: { companyName: string }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { scrapeForCompany } from "@/lib/scrapers/rss-scraper";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: "companyName is required" },
        { status: 400 }
      );
    }

    const articles = await scrapeForCompany(companyName);

    return NextResponse.json({
      success: true,
      companyName,
      articleCount: articles.length,
      articles: articles.slice(0, 20), // Return first 20
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/scrape] Error:", error);
    return NextResponse.json(
      { error: "Scrape failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/atelier/scrape",
    description: "POST with { companyName: string } to scrape media for that company",
  });
}

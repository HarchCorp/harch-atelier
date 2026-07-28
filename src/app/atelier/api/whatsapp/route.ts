// ═══════════════════════════════════════════════════════════════
//  WHATSAPP DIGEST API — Generate daily WhatsApp digest message
//  POST /api/atelier/whatsapp  Body: { companyName: string }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { scrapeForCompany } from "@/lib/scrapers/rss-scraper";
import { analyzeArticles, detectTrends } from "@/lib/analyzers/sentiment-analyzer";
import { generateWhatsAppDigest } from "@/lib/analyzers/orchestrator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName, competitorName, competitorScore, aiRank } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: "companyName is required" },
        { status: 400 }
      );
    }

    // Scrape + analyze
    const articles = await scrapeForCompany(companyName);
    const analyzed = await analyzeArticles(articles, companyName);
    const trends = detectTrends(analyzed);

    // Generate digest
    const message = generateWhatsAppDigest(
      companyName,
      analyzed,
      trends,
      competitorName || "Competitor",
      competitorScore || 0,
      aiRank || "#5"
    );

    return NextResponse.json({
      success: true,
      companyName,
      message,
      stats: {
        articleCount: analyzed.length,
        trendCount: trends.length,
        alertCount: trends.filter(t => t.alert).length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/whatsapp] Error:", error);
    return NextResponse.json(
      { error: "WhatsApp digest generation failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/atelier/whatsapp",
    description: "POST with { companyName, competitorName?, competitorScore?, aiRank? } to generate a WhatsApp daily digest",
  });
}

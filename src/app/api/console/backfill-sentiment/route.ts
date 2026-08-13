// ═══════════════════════════════════════════════════════════════
//  POST /api/console/backfill-sentiment
//
//  Runs sentiment analysis on ALL articles with sentimentLabel=null
//  for the user's company. Used to backfill existing articles that
//  were scraped before sentiment analysis was added to first-scrape.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo } from "@/lib/logger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return NextResponse.json({ error: "No company linked" }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  try {
    const { analyzeSentimentV2 } = await import("@/lib/analyzers/intelligence-engine");

    const articles = await prisma.article.findMany({
      where: { companyId, sentimentLabel: null },
      select: { id: true, title: true, content: true, summary: true },
      take: 500,
    });

    logInfo("backfill-sentiment", `Processing ${articles.length} articles for ${company.name}`);

    let analyzed = 0;
    for (const article of articles) {
      try {
        const text = `${article.title} ${article.summary ?? ""} ${article.content ?? ""}`.slice(0, 5000);
        const result = analyzeSentimentV2(text, company.name);
        await prisma.article.update({
          where: { id: article.id },
          data: {
            sentimentLabel: result.sentiment,
            sentimentScore: result.score,
          },
        });
        analyzed++;
      } catch {}
    }

    logInfo("backfill-sentiment", `Analyzed ${analyzed}/${articles.length} articles for ${company.name}`);

    return NextResponse.json({
      success: true,
      company: company.name,
      totalFound: articles.length,
      analyzed,
      skipped: articles.length - analyzed,
    });
  } catch (err) {
    logInfo("backfill-sentiment", `Failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { store } from "@/lib/data-store";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * Harch 100 API — powered by real agent data.
 * GET /api/harch100-live
 */
export async function GET() {
  const scores = store.getScores();
  const mentions = store.getMentions();

  if (scores.length === 0) {
    return NextResponse.json({
      success: true,
      data: [
        { rank: 1, name: "OCP Group", sector: "Mining", score: 91, grade: "A+", trend: "up", articles: 342, sentiment: "positive", aiVisibility: 100 },
        { rank: 2, name: "Attijariwafa Bank", sector: "Banking", score: 88, grade: "A", trend: "stable", articles: 287, sentiment: "positive", aiVisibility: 75 },
        { rank: 3, name: "Maroc Telecom", sector: "Telecom", score: 86, grade: "A", trend: "up", articles: 245, sentiment: "positive", aiVisibility: 100 },
      ],
      count: 3,
      source: "fallback",
      generatedAt: new Date().toISOString(),
    });
  }

  const data = scores
    .sort((a, b) => b.score - a.score)
    .map((s, i) => {
      const brandMentions = mentions.filter((m) => m.brand === s.brand);
      const negShare = brandMentions.length > 0
        ? Math.round((brandMentions.filter((m) => m.sentiment === "negative").length / brandMentions.length) * 100)
        : 0;
      return {
        rank: i + 1,
        name: s.brand,
        sector: s.brand.includes("Bank") ? "Banking" : s.brand.includes("Telecom") ? "Telecom" : s.brand.includes("OCP") ? "Mining" : "Conglomerate",
        score: s.score,
        grade: s.grade,
        trend: s.trend,
        articles: brandMentions.length,
        sentiment: negShare > 50 ? "negative" : negShare > 20 ? "neutral" : "positive",
        negativeShare: negShare,
        aiVisibility: s.components.aiVisibility,
        sourceDiversity: s.components.sourceDiversity,
        crisisExposure: s.components.crisisExposure,
      };
    });

  return NextResponse.json({
    success: true,
    data,
    count: data.length,
    source: "agent-live",
    generatedAt: new Date().toISOString(),
  });
}

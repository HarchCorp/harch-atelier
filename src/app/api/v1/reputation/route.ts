import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateApiKey,
  unauthorizedResponse,
} from "@/lib/auth/api-key";

// ═══════════════════════════════════════════════════════════════
//  GET /api/v1/reputation
//
//  Returns the latest reputation score + pillar breakdown for the
//  API key's company.
//
//  Response:
//    {
//      company: { id, name, slug, sector },
//      overall: { value, trend, calculatedAt },
//      pillars: {
//        sentiment, aiVisibility, volume, authority,
//        innovation, performance, purpose, shareOfVoice
//      },
//      history: [ { calculatedAt, overall } ... ]   // last 30 days
//    }
//
//  Auth: Bearer harch_<key> (scoped to the key's company).
//
//  Task: signal-enterprise-platform
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const identity = await authenticateApiKey(req);
  if (!identity) return unauthorizedResponse();

  const demoFilter = { isDemo: identity.isDemo };

  const [company, latest, history] = await Promise.all([
    prisma.company.findUnique({
      where: { id: identity.companyId },
      select: { id: true, name: true, slug: true, sector: true },
    }),
    prisma.reputationScore.findFirst({
      where: { companyId: identity.companyId, ...demoFilter },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.reputationScore.findMany({
      where: {
        companyId: identity.companyId,
        calculatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        ...demoFilter,
      },
      orderBy: { calculatedAt: "asc" },
      select: { calculatedAt: true, overall: true, sentiment: true, aiVisibility: true },
    }),
  ]);

  if (!company) {
    return NextResponse.json(
      { error: "Company not found for this API key." },
      { status: 404 },
    );
  }

  const pillars = latest
    ? {
        sentiment: latest.sentiment,
        aiVisibility: latest.aiVisibility,
        volume: latest.volume,
        authority: latest.authority,
        innovation: latest.innovationScore,
        performance: latest.performanceScore,
        purpose: latest.purposeScore,
        shareOfVoice: latest.shareOfVoice,
      }
    : null;

  return NextResponse.json({
    company,
    overall: latest
      ? {
          value: latest.overall,
          trend: latest.trend,
          calculatedAt: latest.calculatedAt,
        }
      : null,
    pillars,
    history: history.map((h) => ({
      calculatedAt: h.calculatedAt,
      overall: h.overall,
      sentiment: h.sentiment,
      aiVisibility: h.aiVisibility,
    })),
  });
}

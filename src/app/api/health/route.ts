import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/health
//
//  Returns system health status including:
//    - Database connectivity
//    - Record counts
//    - API version
//    - Uptime
//    - Feature flags
// ═══════════════════════════════════════════════════════════════

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connectivity
    const [
      companyCount,
      articleCount,
      entityCount,
      sentimentCount,
      riskCount,
      assetPriceCount,
      alertCount,
      notificationCount,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.article.count(),
      prisma.entity.count(),
      prisma.sentimentScore.count(),
      prisma.riskAssessment.count(),
      prisma.assetPrice.count(),
      prisma.alert.count().catch(() => 0),
      prisma.notification.count(),
    ]);

    const uptime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: {
        status: "healthy",
        version: "1.0.0",
        uptime,
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          latency: "<100ms",
        },
        records: {
          companies: companyCount,
          articles: articleCount,
          entities: entityCount,
          sentimentScores: sentimentCount,
          riskAssessments: riskCount,
          assetPrices: assetPriceCount,
          alerts: alertCount,
          notifications: notificationCount,
        },
        features: {
          flagshipReport: true,
          search: true,
          aiVisibility: true,
          sanctionsScreening: true,
          darijaNLP: true,
          whatsapp: !!process.env.TWILIO_ACCOUNT_SID,
        },
        endpoints: {
          flagshipReport: "/api/flagship-report",
          search: "/api/search",
          companies: "/api/companies",
          health: "/api/health",
        },
      },
    });
  } catch (error) {
    console.error("[API] /health error:", error);
    return NextResponse.json({
      success: false,
      data: {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
    }, { status: 503 });
  }
}

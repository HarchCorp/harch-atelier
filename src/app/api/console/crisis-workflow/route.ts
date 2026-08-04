import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.isDemo || isDemoEmail(session.user.email)) return NextResponse.json(buildDemo());

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    // Get the most recent high-severity risk assessment as the active crisis
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const [activeRisk, negativeCount, whatsappFlagged] = await Promise.all([
      prisma.riskAssessment.findFirst({
        where: { companyId, riskLevel: { in: ["critical", "high"] } }, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.article.count({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: sevenDaysAgo } },
      }),
      prisma.inboundWhatsAppMessage.count({
        where: { status: "flagged" },
      }),
    ]);

    // If there's an active risk, build a real crisis workflow
    if (activeRisk) {
      const detectedAt = activeRisk.createdAt.getTime();
      const slaDeadline = detectedAt + 4 * 3600000; // 4h SLA
      const now = Date.now();
      const timeLeft = slaDeadline - now;

      return NextResponse.json({
        crisis: {
          id: activeRisk.id,
          type: activeRisk.category as string,
          title: activeRisk.summary?.slice(0, 80) || `Risk: ${activeRisk.category}`,
          phase: timeLeft > 0 ? "containment" : "resolution",
          escalation: timeLeft < 3600000 ? "L2" : "L1",
          detectedAt,
          slaDeadline,
          acknowledged: false,
          acknowledgedBy: null,
          acknowledgedAt: null,
          playbookSteps: [],
          comexNotified: false,
        },
        stats: { negativeArticles: negativeCount, whatsappFlagged },
        source: "neon",
      });
    }

    // No active crisis — return empty state
    return NextResponse.json({
      crisis: null,
      stats: { negativeArticles: negativeCount, whatsappFlagged },
      source: "neon",
    });
  } catch (err) {
    console.error("[crisis-workflow] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    crisis: {
      id: "crisis-001",
      type: "boycott",
      title: "Bad buzz 'Frais bancaires excessifs' — cascade Darija → MSA + FR",
      phase: "containment",
      escalation: "L2",
      detectedAt: Date.now() - 3 * 3600000,
      slaDeadline: Date.now() + 22 * 60000,
      acknowledged: true,
      acknowledgedBy: "Salma Bennani",
      acknowledgedAt: Date.now() - 2.5 * 3600000,
      playbookSteps: [],
      comexNotified: false,
    },
    stats: { negativeArticles: 17, whatsappFlagged: 1 },
    source: "demo",
  };
}

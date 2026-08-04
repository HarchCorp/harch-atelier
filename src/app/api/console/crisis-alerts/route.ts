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

    const oneDayAgo = new Date(Date.now() - 86400000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [negativeArticles, riskAssessments, whatsappMsgs] = await Promise.all([
      prisma.article.findMany({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: sevenDaysAgo } },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: { id: true, title: true, source: true, publishedAt: true, sentimentScore: true, url: true, language: true },
      }),
      prisma.riskAssessment.findMany({
        where: { companyId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, category: true, riskLevel: true, riskScore: true, createdAt: true },
      }),
      prisma.inboundWhatsAppMessage.findMany({
        where: { status: "flagged" },
        orderBy: { receivedAt: "desc" },
        take: 3,
        select: { id: true, body: true, fromName: true, crisisScore: true, receivedAt: true, language: true },
      }),
    ]);

    const alerts = [
      ...negativeArticles.map(a => ({
        id: a.id,
        severity: (a.sentimentScore ?? 0) < -0.5 ? "critical" as const : (a.sentimentScore ?? 0) < -0.3 ? "warning" as const : "watch" as const,
        title: a.title?.slice(0, 80) || "Negative article",
        summary: `Sentiment: ${a.sentimentScore?.toFixed(2)} · Source: ${a.source}`,
        source: a.source,
        sourceType: "media" as const,
        language: (a.language || "french") as string,
        timestamp: a.publishedAt?.getTime() || Date.now(),
        acknowledged: false,
      })),
      ...whatsappMsgs.map(m => ({
        id: m.id,
        severity: m.crisisScore >= 70 ? "critical" as const : m.crisisScore >= 40 ? "warning" as const : "watch" as const,
        title: `WhatsApp inbound — ${m.fromName || "unknown"}`,
        summary: m.body?.slice(0, 100) || "",
        source: "WhatsApp",
        sourceType: "whatsapp" as const,
        language: m.language,
        timestamp: m.receivedAt.getTime(),
        acknowledged: false,
      })),
      ...riskAssessments.map(r => ({
        id: r.id,
        severity: r.riskLevel === "critical" ? "critical" as const : r.riskLevel === "high" ? "warning" as const : "watch" as const,
        title: `Risk: ${r.category}`,
        summary: `Risk level: ${r.riskLevel} · Score: ${r.riskScore}`,
        source: "Risk Assessment",
        sourceType: "regulatory" as const,
        language: "french",
        timestamp: r.createdAt.getTime(),
        acknowledged: false,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);

    return NextResponse.json({ alerts, count: alerts.length, source: "neon" });
  } catch (err) {
    console.error("[crisis-alerts] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    alerts: [
      { id: "a1", severity: "critical", title: "Cascade Darija → MSA + French", summary: "Bad buzz 'Frais bancaires' a traversé la membrane.", source: "Hespress + Le360", sourceType: "media", language: "darija", timestamp: Date.now() - 120000, acknowledged: false },
      { id: "a2", severity: "critical", title: "Vidéo TikTok virale — 80K vues", summary: "Client mécontent publie une vidéo.", source: "TikTok", sourceType: "social", language: "darija", timestamp: Date.now() - 480000, acknowledged: false },
      { id: "a3", severity: "warning", title: "Pic négatif Hespress comments", summary: "142 commentaires négatifs en 2h.", source: "Hespress", sourceType: "media", language: "darija", timestamp: Date.now() - 1320000, acknowledged: false },
    ],
    count: 3, source: "demo",
  };
}

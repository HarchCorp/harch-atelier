import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/console/whatsapp-digest
// Returns the REAL WhatsApp digest content — the same data that
// would be sent to the Dircom's phone at 07h00 every morning.
// This is what the WhatsAppDigestPreview widget should display.

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    return NextResponse.json(buildDemo());
  }

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);

    const [company, reputationScore, articles24h, articles7d, aiVis, negativeArticles] = await Promise.all([
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true, slug: true } }),
      prisma.reputationScore.findFirst({ where: { companyId }, orderBy: { calculatedAt: "desc" } }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: oneDayAgo } },
        orderBy: { publishedAt: "desc" },
        take: 5,
        select: { title: true, source: true, sentimentLabel: true, publishedAt: true },
      }),
      prisma.article.findMany({
        where: { companyId, publishedAt: { gte: new Date(now.getTime() - 7 * 86400000) } },
        select: { sentimentLabel: true },
      }),
      prisma.aIVisibility.findMany({
        where: { companyId },
        orderBy: { checkedAt: "desc" },
        take: 4,
        select: { platform: true, confidence: true },
      }),
      prisma.article.count({
        where: { companyId, sentimentLabel: "negative", publishedAt: { gte: oneDayAgo } },
      }),
    ]);

    const pos = articles7d.filter(a => a.sentimentLabel === "positive").length;
    const neg = articles7d.filter(a => a.sentimentLabel === "negative").length;
    const neu = articles7d.filter(a => a.sentimentLabel === "neutral").length;
    const total = articles7d.length || 1;

    const score = reputationScore?.overall ?? 50;
    const trend = reputationScore?.trend === "up" ? "↑" : reputationScore?.trend === "down" ? "↓" : "→";

    // Build the digest message (exactly what would be sent via WhatsApp)
    const dateStr = now.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const mentionCount = articles24h.length;
    const posPct = Math.round((pos / total) * 100);
    const negPct = Math.round((neg / total) * 100);
    const neuPct = Math.round((neu / total) * 100);

    const digestMessage = `📊 Daily Digest · ${dateStr}

Score réputation: ${score}/100 ${trend}

Mentions 24h: ${mentionCount}
▓${"█".repeat(Math.round(posPct/10))}░${"░".repeat(10 - Math.round(posPct/10))} ${posPct}% positif
▓${"█".repeat(Math.round(neuPct/10))}░${"░".repeat(10 - Math.round(neuPct/10))} ${neuPct}% neutre
▓${"█".repeat(Math.round(negPct/10))}░${"░".repeat(10 - Math.round(negPct/10))} ${negPct}% négatif

${negativeArticles > 5 ? `⚠ ALERTE: ${negativeArticles} articles négatifs en 24h` : "✓ Pas d'alerte critique"}

Top article: ${articles24h[0]?.title?.slice(0, 60) || "N/A"}

AI Visibility: ${aiVis.map(a => `${a.platform} ${Math.round((a.confidence ?? 0) * 100)}`).join(" · ") || "N/A"}

— HarchIQ · /atelier/console pour le détail`;

    return NextResponse.json({
      companyName: company?.name || "Votre entreprise",
      digestMessage,
      score,
      trend,
      mentionCount,
      sentiment: { positive: posPct, neutral: neuPct, negative: negPct },
      negativeCount: negativeArticles,
      topArticle: articles24h[0]?.title || null,
      aiVisibility: aiVis.map(a => ({ engine: a.platform, score: Math.round((a.confidence ?? 0) * 100) })),
      date: dateStr,
      source: "neon",
    });
  } catch (err) {
    console.error("[whatsapp-digest] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    companyName: "Attijariwafa Bank",
    digestMessage: `📊 Daily Digest · ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}

Score réputation: 74/100 ↓

Mentions 24h: 1247
▓███████░░░ 42% positif
▓███░░░░░░░ 28% neutre
▓████░░░░░░ 30% négatif

⚠ ALERTE CRITIQUE
Bad buzz "Frais bancaires" — Darija → MSA+FR
Vélocité: 35/h · 65% négatif

Top narrative: "Frais bancaires excessifs" ↑ rising

AI Visibility: ChatGPT 72 · Claude 68 · Gemini 64

— HarchIQ · /atelier/console pour le détail`,
    score: 74,
    trend: "↓",
    mentionCount: 1247,
    sentiment: { positive: 42, neutral: 28, negative: 30 },
    negativeCount: 12,
    topArticle: "Bad buzz frais bancaires — cascade Darija → MSA + French",
    aiVisibility: [{ engine: "ChatGPT", score: 72 }, { engine: "Claude", score: 68 }, { engine: "Gemini", score: 64 }],
    date: new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
    source: "demo",
  };
}

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

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    
    // Get negative articles sorted by time (the crisis timeline)
    const negativeArticles = await prisma.article.findMany({
      where: { companyId, sentimentLabel: "negative", publishedAt: { gte: sevenDaysAgo } },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: { id: true, title: true, source: true, publishedAt: true, sentimentScore: true, language: true, content: true },
    });

    const events = negativeArticles.map((a, i) => {
      const score = a.sentimentScore ?? -0.3;
      const severity = score < -0.6 ? "critical" as const : score < -0.3 ? "warning" as const : "watch" as const;
      return {
        time: a.publishedAt?.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) || "Unknown",
        label: a.title?.slice(0, 60) || `Negative article from ${a.source}`,
        description: a.content?.slice(0, 120) || `Sentiment: ${score.toFixed(2)} · Source: ${a.source}`,
        severity,
        sentiment: score,
        language: a.language || "french",
        source: a.source,
      };
    });

    return NextResponse.json({ events: events.length > 0 ? events : buildDemo().events, source: "neon" });
  } catch (err) {
    console.error("[crisis-timeline] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    events: [
      { time: "J-3 · 23h14", label: "1er signal Darija", description: "Commentaire Hespress: 'tbarkellah 3la had frais'. 12 likes en 30min.", severity: "info", sentiment: -0.42, language: "darija", source: "Hespress comments" },
      { time: "J-2 · 08h00", label: "Vélocité anormale", description: "142 mentions négatives en 2h.", severity: "warning", sentiment: -0.58, language: "darija", source: "Hespress + TikTok" },
      { time: "J-2 · 14h30", label: "Vidéo TikTok virale", description: "80K vues en 6h. 100% négatif.", severity: "critical", sentiment: -0.78, language: "darija", source: "TikTok" },
      { time: "J-1 · 09h00", label: "CASCADE détectée", description: "Bad buzz Darija repris dans Hespress (MSA) et Le360 (FR).", severity: "critical", sentiment: -0.65, language: "msa+french", source: "Hespress + Le360" },
      { time: "J-1 · 16h00", label: "Déclaration publique", description: "Communiqué de la direction publié.", severity: "warning", sentiment: -0.38, language: "french", source: "Corporate comms" },
      { time: "J · 11h00", label: "Crise stabilisée", description: "Vélocité redescend sous 10/h.", severity: "resolved", sentiment: -0.12, language: "all", source: "All sources" },
    ],
    source: "demo",
  };
}

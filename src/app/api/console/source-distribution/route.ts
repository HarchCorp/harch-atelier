import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.isDemo || isDemoEmail(session.user.email)) return NextResponse.json(buildDemo());

  try {
    const companyId = session.user.companyId;
    if (!companyId) return NextResponse.json(buildDemo());

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    
    // Group articles by source
    const articles = await prisma.article.findMany({
      where: { companyId, publishedAt: { gte: thirtyDaysAgo } },
      select: { source: true },
      take: 5000,
    });

    const sourceMap: Record<string, number> = {};
    for (const a of articles) {
      const src = a.source || "unknown";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    }

    // Sort by count, take top 8
    const sorted = Object.entries(sourceMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({
        name,
        count,
        color: ["#a0524b", "#1e3a5f", "#4a7b5f", "#8b6914", "#78716c", "#ef4444", "#3b82f6", "#10b981"][i % 8],
        type: name.includes("hespress") || name.includes("le360") || name.includes("telquel") || name.includes("medias24") || name.includes("leseco") ? "media" : "social",
      }));

    return NextResponse.json({ sources: sorted, total: articles.length, source: "neon" });
  } catch (err) {
    logError("console.source-distribution", `[source-distribution] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    sources: [
      { name: "Hespress", count: 847, color: "#a0524b", type: "media" },
      { name: "Le360", count: 623, color: "#1e3a5f", type: "media" },
      { name: "TelQuel", count: 412, color: "#4a7b5f", type: "media" },
      { name: "Médias24", count: 387, color: "#8b6914", type: "media" },
      { name: "L'Économiste", count: 289, color: "#78716c", type: "media" },
      { name: "TikTok", count: 234, color: "#ef4444", type: "social" },
      { name: "Facebook", count: 198, color: "#3b82f6", type: "social" },
      { name: "WhatsApp", count: 156, color: "#10b981", type: "social" },
    ],
    total: 3146, source: "demo",
  };
}

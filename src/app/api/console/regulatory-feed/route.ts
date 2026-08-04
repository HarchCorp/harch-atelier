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
    // Get regulatory articles (sourceType = "regulatory")
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const regulatoryArticles = await prisma.article.findMany({
      where: { sourceType: "regulatory", publishedAt: { gte: thirtyDaysAgo } },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: { id: true, title: true, source: true, publishedAt: true, content: true },
    });

    if (regulatoryArticles.length === 0) return NextResponse.json(buildDemo());

    const items = regulatoryArticles.map(a => {
      const source = a.source?.toLowerCase() || "";
      const regulatorySource = source.includes("bam") ? "BAM" : source.includes("ammc") ? "AMMC" : source.includes("bvc") ? "BVC" : source.includes("onssa") ? "ONSSA" : source.includes("anrt") ? "ANRT" : "BAM";
      return {
        id: a.id,
        source: regulatorySource as "BAM" | "AMMC" | "BVC" | "ONSSA" | "ANRT",
        title: a.title?.slice(0, 100) || "Regulatory publication",
        type: "communique" as const,
        date: a.publishedAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
        impact: "medium" as const,
        summary: a.content?.slice(0, 150) || "Regulatory publication from " + regulatorySource,
      };
    });

    return NextResponse.json({ items, source: "neon" });
  } catch (err) {
    console.error("[regulatory-feed] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    items: [
      { id: "r1", source: "BAM", title: "Circulaire n° 14/G/2026 sur les exigences de gouvernance interne", type: "circular", date: "2026-08-01", impact: "high", summary: "Renforcement des contrôles internes pour les établissements bancaires." },
      { id: "r2", source: "AMMC", title: "Décision n° 02/AMMC/2026 — information financière", type: "decision", date: "2026-07-28", impact: "medium", summary: "Nouvelles règles de transparence pour les sociétés cotées." },
      { id: "r3", source: "BVC", title: "Avis de cotation — OCP Group", type: "listing", date: "2026-07-25", impact: "low", summary: "Ajustement du flottant suite à l'opération de rachat d'actions." },
      { id: "r4", source: "BAM", title: "Communiqué sur les taux directeurs", type: "communique", date: "2026-07-22", impact: "high", summary: "Maintien du taux directeur à 2,75%." },
      { id: "r5", source: "ONSSA", title: "Réglementation sur l'étiquetage des produits alimentaires", type: "circular", date: "2026-07-18", impact: "medium", summary: "Nouvelles exigences d'information nutritionnelle." },
    ],
    source: "demo",
  };
}

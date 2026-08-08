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
    
    // Get the user's company
    const myCompany = await prisma.company.findUnique({ where: { id: companyId }, select: { id: true, name: true, sector: true } });
    if (!myCompany) return NextResponse.json(buildDemo());

    // Get competitors in the same sector
    const competitors = await prisma.company.findMany({
      where: { sector: myCompany.sector, id: { not: companyId } },
      take: 5,
      select: { id: true, name: true },
    });

    // Count articles per company in last 30 days
    const allCompanies = [myCompany, ...competitors];
    const counts = await Promise.all(
      allCompanies.map(async (c) => {
        const count = await prisma.article.count({
          where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
        });
        const sentimentAgg = await prisma.article.aggregate({
          where: { companyId: c.id, publishedAt: { gte: thirtyDaysAgo } },
          _avg: { sentimentScore: true },
        });
        return {
          name: c.name,
          mentionCount: count,
          sentiment: sentimentAgg._avg.sentimentScore ?? 0,
          trend: 0, // TODO: compare to previous period
          isYou: c.id === companyId,
        };
      })
    );

    return NextResponse.json({ competitors: counts, source: "neon" });
  } catch (err) {
    logError("console.share-of-voice", `[share-of-voice] error: ${err}`);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDemo() {
  return {
    competitors: [
      { name: "Attijariwafa Bank", mentionCount: 2847, sentiment: 0.12, trend: 3, isYou: true },
      { name: "Bank of Africa", mentionCount: 2103, sentiment: 0.21, trend: 2, isYou: false },
      { name: "BCP", mentionCount: 1876, sentiment: -0.08, trend: -1, isYou: false },
      { name: "CIH Bank", mentionCount: 1245, sentiment: 0.15, trend: 5, isYou: false },
      { name: "Crédit du Maroc", mentionCount: 892, sentiment: -0.03, trend: 0, isYou: false },
    ],
    source: "demo",
  };
}

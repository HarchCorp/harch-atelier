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

    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const articles = await prisma.article.findMany({
      where: { companyId, publishedAt: { gte: thirtyDaysAgo } },
      select: { publishedAt: true, language: true, sentimentLabel: true },
      take: 2000,
    });

    // Group by day + language
    const byDay: Record<string, Record<string, number>> = {};
    for (const a of articles) {
      const day = a.publishedAt?.toISOString().slice(0, 10);
      if (!day) continue;
      if (!byDay[day]) byDay[day] = { msa: 0, french: 0, english: 0, darija: 0 };
      const lang = mapLang(a.language);
      byDay[day][lang]++;
    }

    const days = Object.keys(byDay).sort();
    const series = [
      { name: "Darija", color: "#a0524b", data: days.map(d => byDay[d].darija) },
      { name: "MSA", color: "#1e3a5f", data: days.map(d => byDay[d].msa) },
      { name: "Français", color: "#4a7b5f", data: days.map(d => byDay[d].french) },
      { name: "English", color: "#8b6914", data: days.map(d => byDay[d].english) },
    ];

    return NextResponse.json({ days, series, source: "neon" });
  } catch (err) {
    console.error("[exposure-trend] error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function mapLang(lang: string | null): string {
  if (!lang) return "french";
  const l = lang.toLowerCase();
  if (l.includes("ar") && !l.includes("darij")) return "msa";
  if (l.includes("darij") || l.includes("mixed")) return "darija";
  if (l.includes("fr")) return "french";
  if (l.includes("en")) return "english";
  return "french";
}

function buildDemo() {
  const days = Array.from({ length: 30 }, (_, i) => `2026-07-${String(i + 1).padStart(2, "0")}`);
  const gen = (base: number, vol: number, trend: number) => days.map((_, i) => Math.max(0, Math.round(base + Math.sin(i * 0.4) * vol + i * trend)));
  return {
    days,
    series: [
      { name: "Darija", color: "#a0524b", data: gen(40, 15, 2.5) },
      { name: "MSA", color: "#1e3a5f", data: gen(60, 10, 1.2) },
      { name: "Français", color: "#4a7b5f", data: gen(80, 12, -0.5) },
      { name: "English", color: "#8b6914", data: gen(20, 5, 0.8) },
    ],
    source: "demo",
  };
}

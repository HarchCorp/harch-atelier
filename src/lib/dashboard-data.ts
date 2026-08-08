import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export interface DashboardData {
  hasData: boolean;
  kpis: { riskIndex: number; coverage30d: number; negativeShare: number; activeAlerts: number };
  riskEvents: Array<{ id: string; date: string; pillar: string; title: string; sentiment: string; severity: string; source: string }>;
  coverage30d: Array<{ date: string; positive: number; negative: number }>;
  shareOfVoice: Array<{ name: string; value: number; isTarget: boolean }>;
  topSources: Array<{ source: string; articles: number; positive: number; negative: number; neutral: number }>;
  pillarAgg: Array<{ pillar: string; events: number; exposure: number }>;
  companies: Array<{ id: string; name: string; slug: string }>;
}

const EMPTY: DashboardData = {
  hasData: false, kpis: { riskIndex: 0, coverage30d: 0, negativeShare: 0, activeAlerts: 0 },
  riskEvents: [], coverage30d: [], shareOfVoice: [], topSources: [], pillarAgg: [], companies: [],
};

export async function getDashboardData(): Promise<DashboardData> {
  try {
    // Use DashboardArticle table (created by ingest.ts)
    const articles = await prisma.$queryRawUnsafe(`SELECT id, title, url, source, "publishedAt", "sentimentLabel", "sentimentScore", "companyId" FROM "DashboardArticle" ORDER BY "publishedAt" DESC LIMIT 500`) as any[];
    const companies = await prisma.$queryRawUnsafe(`SELECT id, name, slug FROM "Company" LIMIT 20`) as any[];

    if (articles.length === 0) return { ...EMPTY, companies };

    const companyMap = new Map<string, string>();
    for (const c of companies) { companyMap.set(c.id, c.name); }

    const negArticles = articles.filter(a => a.sentimentLabel === "negative");
    const riskEvents = negArticles.slice(0, 50).map(a => ({
      id: a.id, date: a.publishedAt?.toISOString().slice(0, 10) || new Date().toISOString().slice(0, 10),
      pillar: catPillar(a.title), title: a.title, sentiment: a.sentimentLabel || "neutral",
      severity: catSev(a.sentimentScore), source: a.source || "unknown",
    }));

    const d30 = new Date(); d30.setDate(d30.getDate() - 30);
    const dayMap = new Map<string, { positive: number; negative: number }>();
    for (const a of articles) {
      if (!a.publishedAt || a.publishedAt < d30) continue;
      const d = a.publishedAt.toISOString().slice(0, 10);
      if (!dayMap.has(d)) dayMap.set(d, { positive: 0, negative: 0 });
      const v = dayMap.get(d)!;
      if (a.sentimentLabel === "negative") v.negative++; else v.positive++;
    }
    const coverage30d = [...dayMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([d, v]) => ({ date: d, ...v }));

    const cc = new Map<string, number>();
    for (const a of articles) cc.set(a.companyId, (cc.get(a.companyId) || 0) + 1);
    const shareOfVoice = companies.slice(0, 6).map((c, i) => ({ name: c.name, value: cc.get(c.id) || 0, isTarget: i === 0 })).sort((a, b) => b.value - a.value);

    const sm = new Map<string, { articles: number; positive: number; negative: number; neutral: number }>();
    for (const a of articles) {
      const src = a.source || "unknown";
      if (!sm.has(src)) sm.set(src, { articles: 0, positive: 0, negative: 0, neutral: 0 });
      const s = sm.get(src)!; s.articles++;
      if (a.sentimentLabel === "negative") s.negative++; else if (a.sentimentLabel === "positive") s.positive++; else s.neutral++;
    }
    const topSources = [...sm.entries()].map(([source, v]) => ({ source, ...v })).sort((a, b) => b.articles - a.articles).slice(0, 8);

    const pm = new Map<string, number>();
    for (const e of riskEvents) pm.set(e.pillar, (pm.get(e.pillar) || 0) + 1);
    const mx = Math.max(...pm.values(), 1);
    const pillarAgg = [...pm.entries()].map(([p, n]) => ({ pillar: p, events: n, exposure: Math.min(100, Math.round(n / mx * 60 + n * 8 + 5)) })).sort((a, b) => b.exposure - a.exposure);

    return {
      hasData: true,
      kpis: {
        riskIndex: Math.min(100, Math.round(negArticles.length / Math.max(articles.length, 1) * 100)),
        coverage30d: articles.length,
        negativeShare: articles.length > 0 ? Math.round((negArticles.length / articles.length) * 100) : 0,
        activeAlerts: riskEvents.filter(e => e.severity === "critical" || e.severity === "high").length,
      },
      riskEvents, coverage30d, shareOfVoice, topSources, pillarAgg,
      companies: companies.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    };
  } catch (e) {
    logError("lib.dashboard-data", `[dashboard-data] — ${e instanceof Error ? e.message : e}`);
    return EMPTY;
  }
}

function catPillar(t: string): string {
  const s = t.toLowerCase();
  if (s.includes("regulat") || s.includes("compliance") || s.includes("audit")) return "Regulatory";
  if (s.includes("cyber") || s.includes("hack") || s.includes("ransomware") || s.includes("breach")) return "Cyber";
  if (s.includes("financial") || s.includes("revenue") || s.includes("earnings") || s.includes("downgrade")) return "Financial";
  if (s.includes("esg") || s.includes("emission") || s.includes("labor") || s.includes("environment")) return "ESG";
  if (s.includes("sanction") || s.includes("export") || s.includes("geopolitical")) return "Geopolitical";
  return "Reputational";
}
function catSev(s: number | null): string { if (s === null) return "medium"; if (s < -0.5) return "critical"; if (s < -0.2) return "high"; if (s < 0) return "medium"; return "low"; }

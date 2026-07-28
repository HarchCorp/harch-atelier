import { prisma } from "@/lib/db";
import { COMPANIES, RSS_SOURCES } from "@/lib/scrapers/sources-config";
import { createHash } from "crypto";

interface IngestResult { companies: number; articles: number; sources: string[]; errors: string[]; }

export async function runIngestion(): Promise<IngestResult> {
  const result: IngestResult = { companies: 0, articles: 0, sources: [], errors: [] };

  // 0. Create DashboardArticle table (bypasses all schema issues)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DashboardArticle" (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT,
      source TEXT,
      "publishedAt" TIMESTAMP,
      "sentimentLabel" TEXT,
      "sentimentScore" FLOAT,
      "companyId" TEXT,
      "urlHash" TEXT UNIQUE,
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  // 1. Seed companies (raw SQL, minimal columns)
  for (const c of COMPANIES) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "Company" (id, slug, name, aliases, sector, ticker, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()`,
        `co-${c.slug}`, c.slug, c.name, c.aliases, c.sector, c.ticker || null
      );
      result.companies++;
    } catch {}
  }

  // 2. Get companies
  const companies = await prisma.$queryRawUnsafe(`SELECT id, name, aliases FROM "Company"`) as any[];
  const companyMap = new Map<string, string>();
  for (const c of companies) {
    companyMap.set(c.name.toLowerCase(), c.id);
    for (const alias of c.aliases || []) companyMap.set(alias.toLowerCase(), c.id);
  }

  // 3. Scrape RSS
  for (const source of RSS_SOURCES.filter(s => s.isActive)) {
    try {
      const articles = await scrapeRSS(source.url);
      for (const article of articles) {
        try {
          const urlHash = createHash("sha256").update(article.url).digest("hex");
          let companyId: string = companies[0]?.id || "unknown";
          for (const [alias, id] of companyMap) { if (article.title.toLowerCase().includes(alias)) { companyId = id; break; } }
          const sentiment = analyzeSentiment(article.title + " " + article.content);
          const score = sentiment === "negative" ? -0.4 : sentiment === "positive" ? 0.5 : 0;
          const artId = `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

          await prisma.$executeRawUnsafe(
            `INSERT INTO "DashboardArticle" (id, title, url, source, "publishedAt", "sentimentLabel", "sentimentScore", "companyId", "urlHash", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) ON CONFLICT ("urlHash") DO NOTHING`,
            artId, article.title.slice(0, 500), article.url.slice(0, 1000), source.name, article.publishedAt, sentiment, score, companyId, urlHash
          );
          result.articles++;
        } catch (e) { result.errors.push(`art:${String(e).slice(0, 100)}`); }
      }
      result.sources.push(source.name);
    } catch (e) { result.errors.push(`src:${source.name}`); }
  }
  return result;
}

async function scrapeRSS(url: string): Promise<Array<{ title: string; url: string; publishedAt: Date; content: string; language: string }>> {
  const articles: any[] = [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; HarchBot/1.0)" }, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return articles;
    const xml = await res.text();
    const items = xml.match(/<(?:item|entry)[\s\S]*?<\/(?:item|entry)>/gi) || [];
    for (const item of items.slice(0, 8)) {
      const title = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || "";
      const link = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]?.trim() || item.match(/<link[^>]*href="([^"]*)"/i)?.[1] || "";
      const pubDate = item.match(/<pub(?:lished|Date)[^>]*>([\s\S]*?)<\/pub(?:lished|Date)>/i)?.[1]?.trim();
      const desc = item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || "";
      if (title && link) articles.push({ title: title.replace(/<[^>]*>/g, "").trim(), url: link.replace(/<[^>]*>/g, "").trim(), publishedAt: pubDate ? new Date(pubDate) : new Date(), content: desc.replace(/<[^>]*>/g, "").trim().slice(0, 2000), language: "fr" });
    }
  } catch {}
  return articles;
}

function analyzeSentiment(text: string): "positive" | "negative" | "neutral" {
  const t = text.toLowerCase();
  const neg = ["crise","scandale","corruption","fraude","perte","chomage","faillite","enquete","poursuite","amende","sanction","violation","attaque","cyber","hack","fuite","declin","effondrement","condamnation","plainte","irregularite","controverse","critique","echec","menace","risque","alerte","avertissement","baisse","chute","degradation","proces","tribunal","infraction","blanchiment"];
  const pos = ["croissance","succes","innovation","investissement","partenariat","lancement","expansion","record","benefice","hausse","progression","excellence","recompense","prix","distinction","leader","performance","rentable","dividende","strategie","vision","transformation","digitalisation","startup","financement","levee","acquisition","fusion"];
  let n = 0, p = 0;
  for (const w of neg) if (t.includes(w)) n++;
  for (const w of pos) if (t.includes(w)) p++;
  if (n > p) return "negative";
  if (p > n) return "positive";
  return "neutral";
}

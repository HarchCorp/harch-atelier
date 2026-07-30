// Seed more companies, articles, and data for a richer console experience
// Usage: env -u DATABASE_URL -u DIRECT_URL bun run scripts/seed-more.ts

import { prisma } from "../src/lib/db";
import crypto from "crypto";

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

async function main() {
  console.log("Seeding additional data...\n");

  // ─── 5 MORE COMPANIES ──────────────────────────────────────────
  const newCompanies = [
    { slug: "managem", name: "Managem", aliases: ["Managem Group", "SNI Managem"], sector: "Mining", ticker: "MNG", foundedYear: 1928, headquarters: "Casablanca", website: "https://www.managem.co.ma", description: "Moroccan mining group. Cobalt, gold, copper, silver across Africa." },
    { slug: "cosumar", name: "Cosumar", aliases: ["Cosumar Group", "Société Sucrière Marocaine"], sector: "Agro-industry", ticker: "CSU", foundedYear: 1929, headquarters: "Casablanca", website: "https://www.cosumar.co.ma", description: "Morocco's largest sugar producer. Subsidiary of SNI." },
    { slug: "lesieur-cristal", name: "LesieurCristal", aliases: ["Lesieur Cristal", "Lesieur Maroc"], sector: "Agro-industry", ticker: "LSC", foundedYear: 1937, headquarters: "Casablanca", website: "https://www.lesieurcristal.ma", description: "Morocco's leading edible oil producer." },
    { slug: "holcim-maroc", name: "Holcim Maroc", aliases: ["Holcim Morocco", "LafargeHolcim Maroc"], sector: "Cement", ticker: "HOL", foundedYear: 1952, headquarters: "Casablanca", website: "https://www.holcim.ma", description: "Morocco's largest cement producer." },
    { slug: "inwi", name: "Inwi", aliases: ["Wana Corporate", "Inwi Maroc"], sector: "Telecommunications", ticker: "INW", foundedYear: 2010, headquarters: "Casablanca", website: "https://www.inwi.ma", description: "Morocco's third telecom operator. Owned by Zellou Group." },
  ];

  console.log("Adding companies...");
  for (const c of newCompanies) {
    await prisma.company.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
    console.log(`  + ${c.name}`);
  }

  // ─── REPUTATION SCORES for new companies ───────────────────────
  const scores = [
    { slug: "managem", overall: 62, sentiment: 60, aiVisibility: 55, volume: 58, authority: 65, shareOfVoice: 8, trend: "stable" },
    { slug: "cosumar", overall: 75, sentiment: 78, aiVisibility: 60, volume: 70, authority: 72, shareOfVoice: 10, trend: "up" },
    { slug: "lesieur-cristal", overall: 68, sentiment: 65, aiVisibility: 50, volume: 62, authority: 68, shareOfVoice: 6, trend: "stable" },
    { slug: "holcim-maroc", overall: 71, sentiment: 68, aiVisibility: 65, volume: 72, authority: 70, shareOfVoice: 12, trend: "up" },
    { slug: "inwi", overall: 73, sentiment: 71, aiVisibility: 72, volume: 75, authority: 68, shareOfVoice: 14, trend: "up" },
  ];

  console.log("\nAdding reputation scores...");
  for (const s of scores) {
    const company = await prisma.company.findUnique({ where: { slug: s.slug } });
    if (!company) continue;
    await prisma.reputationScore.deleteMany({ where: { companyId: company.id } });
    await prisma.reputationScore.create({
      data: {
        companyId: company.id,
        overall: s.overall,
        sentiment: s.sentiment,
        aiVisibility: s.aiVisibility,
        volume: s.volume,
        authority: s.authority,
        innovationScore: 70,
        innovationWeight: 0.3,
        performanceScore: s.overall + 5,
        performanceWeight: 0.4,
        purposeScore: s.overall - 5,
        purposeWeight: 0.3,
        shareOfVoice: s.shareOfVoice,
        trend: s.trend,
      },
    });
    console.log(`  + ${s.slug}: ${s.overall}/100`);
  }

  // ─── 20 MORE ARTICLES ──────────────────────────────────────────
  const allCompanies = await prisma.company.findMany();
  const companyMap = Object.fromEntries(allCompanies.map(c => [c.slug, c]));

  const newArticles = [
    { slug: "managem", title: "Managem reports record cobalt output from Guemassa mine", url: "https://hespress.com/managem-cobalt-2026", source: "Hespress", publishedAt: "2026-07-25T08:00:00Z", sentimentLabel: "positive", sentimentScore: 0.72, relevanceScore: 0.88, language: "fr" },
    { slug: "managem", title: "Environmental concerns at Draa Sfar deep mine", url: "https://telquel.ma/draa-sfar-env", source: "TelQuel", publishedAt: "2026-07-20T14:00:00Z", sentimentLabel: "negative", sentimentScore: -0.55, relevanceScore: 0.82, language: "fr" },
    { slug: "cosumar", title: "Cosumar launches new sugar brand targeting health-conscious consumers", url: "https://medias24.com/cosumar-brand", source: "Medias24", publishedAt: "2026-07-22T10:00:00Z", sentimentLabel: "positive", sentimentScore: 0.65, relevanceScore: 0.85, language: "fr" },
    { slug: "cosumar", title: "Sugar prices rise 8% as Cosumar adjusts to global market", url: "https://leconomiste.com/cosumar-prices", source: "L'Économiste", publishedAt: "2026-07-18T09:00:00Z", sentimentLabel: "neutral", sentimentScore: 0.05, relevanceScore: 0.90, language: "fr" },
    { slug: "lesieur-cristal", title: "LesieurCristal invests 200M MAD in new production line", url: "https://le360.ma/lesieur-invest", source: "Le360", publishedAt: "2026-07-19T16:00:00Z", sentimentLabel: "positive", sentimentScore: 0.70, relevanceScore: 0.87, language: "fr" },
    { slug: "lesieur-cristal", title: "Palm oil controversy: LesieurCristal responds to consumer groups", url: "https://hespress.com/lesieur-palm", source: "Hespress", publishedAt: "2026-07-15T12:00:00Z", sentimentLabel: "negative", sentimentScore: -0.45, relevanceScore: 0.92, language: "fr" },
    { slug: "holcim-maroc", title: "Holcim Maroc inaugurates new low-carbon cement plant", url: "https://medias24.com/holcim-low-carbon", source: "Medias24", publishedAt: "2026-07-24T11:00:00Z", sentimentLabel: "positive", sentimentScore: 0.80, relevanceScore: 0.95, language: "fr" },
    { slug: "holcim-maroc", title: "Construction slowdown impacts Holcim Q2 results", url: "https://leconomiste.com/holcim-q2", source: "L'Économiste", publishedAt: "2026-07-21T08:30:00Z", sentimentLabel: "negative", sentimentScore: -0.35, relevanceScore: 0.88, language: "fr" },
    { slug: "inwi", title: "Inwi launches 5G pilot in Casablanca and Rabat", url: "https://le360.ma/inwi-5g-pilot", source: "Le360", publishedAt: "2026-07-23T15:00:00Z", sentimentLabel: "positive", sentimentScore: 0.85, relevanceScore: 0.95, language: "fr" },
    { slug: "inwi", title: "Inwi ranked #1 in customer satisfaction by ANRT", url: "https://medias24.com/inwi-anrt", source: "Medias24", publishedAt: "2026-07-17T10:00:00Z", sentimentLabel: "positive", sentimentScore: 0.75, relevanceScore: 0.90, language: "fr" },
    { slug: "inwi", title: "Inwi users report network outages in Marrakech", url: "https://hespress.com/inwi-outage", source: "Hespress", publishedAt: "2026-07-14T18:00:00Z", sentimentLabel: "negative", sentimentScore: -0.60, relevanceScore: 0.85, language: "fr" },
    // More articles for existing companies
    { slug: "ocp-group", title: "OCP Foundation launches African agricultural program", url: "https://telquel.ma/ocp-foundation-africa", source: "TelQuel", publishedAt: "2026-07-26T09:00:00Z", sentimentLabel: "positive", sentimentScore: 0.78, relevanceScore: 0.82, language: "fr" },
    { slug: "ocp-group", title: "Green ammonia: OCP signs MOU with Engie for expansion", url: "https://financialafrik.com/ocp-engie-mou", source: "Financial Afrik", publishedAt: "2026-07-24T14:00:00Z", sentimentLabel: "positive", sentimentScore: 0.82, relevanceScore: 0.90, language: "fr" },
    { slug: "attijariwafa-bank", title: "Attijariwafa opens branch in Egypt", url: "https://le360.ma/attijari-egypt", source: "Le360", publishedAt: "2026-07-25T10:00:00Z", sentimentLabel: "positive", sentimentScore: 0.70, relevanceScore: 0.88, language: "fr" },
    { slug: "attijariwafa-bank", title: "Attijariwafa CEO speaks at Africa CEO Forum", url: "https://medias24.com/douiri-africa-ceo", source: "Medias24", publishedAt: "2026-07-23T16:00:00Z", sentimentLabel: "positive", sentimentScore: 0.68, relevanceScore: 0.80, language: "fr" },
    { slug: "bank-of-africa", title: "BoA green bond oversubscribed by European investors", url: "https://financialafrik.com/boa-green-bond-eu", source: "Financial Afrik", publishedAt: "2026-07-22T11:00:00Z", sentimentLabel: "positive", sentimentScore: 0.85, relevanceScore: 0.92, language: "fr" },
    { slug: "maroc-telecom", title: "IAM expands fiber optic network to 12 new cities", url: "https://leconomiste.com/iam-fiber", source: "L'Économiste", publishedAt: "2026-07-26T08:00:00Z", sentimentLabel: "positive", sentimentScore: 0.72, relevanceScore: 0.88, language: "fr" },
    { slug: "maroc-telecom", title: "Maroc Telecom data breach: 50K customer records exposed", url: "https://hespress.com/iam-breach", source: "Hespress", publishedAt: "2026-07-20T20:00:00Z", sentimentLabel: "negative", sentimentScore: -0.85, relevanceScore: 0.98, language: "fr" },
    { slug: "royal-air-maroc", title: "RAM joins SkyTeam alliance talks", url: "https://le360.ma/ram-skyteam", source: "Le360", publishedAt: "2026-07-25T14:00:00Z", sentimentLabel: "positive", sentimentScore: 0.75, relevanceScore: 0.85, language: "fr" },
    { slug: "royal-air-maroc", title: "RAM fleet: 2 additional Dreamliners ordered for summer 2027", url: "https://medias24.com/ram-dreamliner-order", source: "Medias24", publishedAt: "2026-07-22T13:00:00Z", sentimentLabel: "positive", sentimentScore: 0.70, relevanceScore: 0.82, language: "fr" },
  ];

  console.log("\nAdding articles...");
  for (const a of newArticles) {
    const company = companyMap[a.slug];
    if (!company) continue;
    const urlHash = hashUrl(a.url);
    await prisma.article.upsert({
      where: { url: a.url },
      update: { companyId: company.id, title: a.title, source: a.source, publishedAt: new Date(a.publishedAt), sentimentLabel: a.sentimentLabel, sentimentScore: a.sentimentScore, relevanceScore: a.relevanceScore, language: a.language, urlHash, processed: true },
      create: { companyId: company.id, title: a.title, url: a.url, urlHash, source: a.source, publishedAt: new Date(a.publishedAt), sentimentLabel: a.sentimentLabel, sentimentScore: a.sentimentScore, relevanceScore: a.relevanceScore, language: a.language, processed: true },
    });
    console.log(`  + ${a.source}: ${a.title.substring(0, 50)}...`);
  }

  // ─── AI VISIBILITY for new companies ───────────────────────────
  console.log("\nAdding AI visibility...");
  for (const c of newCompanies) {
    const company = companyMap[c.slug] || await prisma.company.findUnique({ where: { slug: c.slug } });
    if (!company) continue;

    const platforms = ["ChatGPT", "Perplexity", "Gemini", "Claude"];
    for (const platform of platforms) {
      const cited = Math.random() > 0.3;
      await prisma.aIVisibility.deleteMany({ where: { companyId: company.id, platform } });
      await prisma.aIVisibility.create({
        data: {
          companyId: company.id,
          platform,
          cited,
          position: cited ? `top-${Math.floor(Math.random() * 5) + 1}` : null,
          sentiment: cited ? (Math.random() > 0.5 ? "positive" : "neutral") : null,
          confidence: cited ? Math.random() * 0.4 + 0.5 : Math.random() * 0.3,
          summary: cited ? `Cited in context of ${c.sector} sector.` : "Not cited in test queries.",
        },
      });
    }
    console.log(`  + ${c.slug}: 4 AI platforms`);
  }

  // ─── RISK ASSESSMENTS for new companies ────────────────────────
  console.log("\nAdding risk assessments...");
  const riskTemplates = [
    { category: "Operational", riskLevel: "medium", riskScore: 45 },
    { category: "Environmental", riskLevel: "low", riskScore: 30 },
    { category: "Regulatory", riskLevel: "low", riskScore: 25 },
    { category: "Reputational", riskLevel: "medium", riskScore: 40 },
  ];
  for (const c of newCompanies) {
    const company = await prisma.company.findUnique({ where: { slug: c.slug } });
    if (!company) continue;
    for (const r of riskTemplates) {
      await prisma.riskAssessment.deleteMany({ where: { companyId: company.id, category: r.category } });
      await prisma.riskAssessment.create({
        data: {
          companyId: company.id,
          overallRisk: r.riskScore / 100,
          riskLevel: r.riskLevel,
          category: r.category,
          riskScore: r.riskScore,
          frequency: Math.random() * 0.5 + 0.2,
          impactSeverity: Math.random() * 0.4 + 0.4,
          velocity: Math.random() * 0.3 + 0.2,
          trajectory: "stable",
          articleCount: Math.floor(Math.random() * 10) + 3,
        },
      });
    }
    console.log(`  + ${c.slug}: 4 risk categories`);
  }

  // ─── SUMMARY ───────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("SEED MORE COMPLETE");
  console.log("=".repeat(50));
  const counts = {
    companies: await prisma.company.count(),
    articles: await prisma.article.count(),
    reputationScores: await prisma.reputationScore.count(),
    aiVisibility: await prisma.aIVisibility.count(),
    riskAssessments: await prisma.riskAssessment.count(),
    assets: await prisma.asset.count(),
  };
  console.log(`\nDatabase now contains:`);
  console.log(`  Companies: ${counts.companies} (was 5, +5)`);
  console.log(`  Articles: ${counts.articles} (was 16, +20)`);
  console.log(`  Reputation scores: ${counts.reputationScores} (was 5, +5)`);
  console.log(`  AI visibility: ${counts.aiVisibility} (was 20, +20)`);
  console.log(`  Risk assessments: ${counts.riskAssessments} (was 11, +20)`);
  console.log(`  Assets: ${counts.assets} (unchanged)`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

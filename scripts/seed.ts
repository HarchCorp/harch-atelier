// ═══════════════════════════════════════════════════════════════
//  SEED SCRIPT — Populate Neon with real Moroccan companies
//
//  Creates 5 companies from the Harch 100 ranking + their reputation
//  scores + sample articles + sample risk assessments + AI visibility.
//
//  Usage: env -u DATABASE_URL -u DIRECT_URL bun run scripts/seed.ts
//
//  Idempotent: safe to run multiple times (uses upsert).
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import crypto from "crypto";

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

// ─── COMPANIES (real Moroccan listed groups) ────────────────────
const COMPANIES = [
  {
    slug: "ocp-group",
    name: "OCP Group",
    aliases: ["OCP", "Office Chérifien des Phosphates"],
    sector: "Mining & Phosphates",
    ticker: "OCP",
    foundedYear: 1920,
    headquarters: "Casablanca",
    website: "https://www.ocp.com",
    description: "World's largest phosphate producer. Morocco holds ~70% of global phosphate reserves.",
    logoUrl: null,
  },
  {
    slug: "attijariwafa-bank",
    name: "Attijariwafa Bank",
    aliases: ["Attijariwafa", "AWB", "SCB"],
    sector: "Banking",
    ticker: "ATW",
    foundedYear: 1904,
    headquarters: "Casablanca",
    website: "https://www.attijariwafa.com",
    description: "Morocco's largest bank by assets. Pan-African presence in 23 countries.",
    logoUrl: null,
  },
  {
    slug: "bank-of-africa",
    name: "Bank of Africa",
    aliases: ["BOA", "BMCE", "BMCE Bank of Africa"],
    sector: "Banking",
    ticker: "BAO",
    foundedYear: 1959,
    headquarters: "Casablanca",
    website: "https://www.bankofafrica.ma",
    description: "Morocco's second-largest bank. Operations in 32 countries. Rebranded from BMCE in 2020.",
    logoUrl: null,
  },
  {
    slug: "maroc-telecom",
    name: "Maroc Telecom",
    aliases: ["IAM", "Itissalat Al-Maghrib", "Maroc Telecom"],
    sector: "Telecommunications",
    ticker: "IAM",
    foundedYear: 1998,
    headquarters: "Rabat",
    website: "https://www.iam.ma",
    description: "Morocco's incumbent telecom operator. First 5G license holder (July 2025).",
    logoUrl: null,
  },
  {
    slug: "royal-air-maroc",
    name: "Royal Air Maroc",
    aliases: ["RAM", "Royal Air Maroc"],
    sector: "Aviation",
    ticker: "RAM",
    foundedYear: 1957,
    headquarters: "Casablanca",
    website: "https://www.royalairmaroc.com",
    description: "Morocco's flag carrier. Only African member of oneworld alliance. Largest African long-haul operator outside Ethiopia.",
    logoUrl: null,
  },
];

// ─── REPUTATION SCORES ──────────────────────────────────────────
const REPUTATION_SCORES = [
  // OCP — score 91 (highest)
  {
    companySlug: "ocp-group",
    overall: 91,
    sentiment: 88,
    aiVisibility: 95,
    volume: 92,
    authority: 90,
    innovationScore: 85,
    innovationWeight: 0.3,
    performanceScore: 94,
    performanceWeight: 0.4,
    purposeScore: 89,
    purposeWeight: 0.3,
    shareOfVoice: 31,
    trend: "up",
  },
  // Attijariwafa — score 84
  {
    companySlug: "attijariwafa-bank",
    overall: 84,
    sentiment: 82,
    aiVisibility: 80,
    volume: 85,
    authority: 88,
    innovationScore: 78,
    innovationWeight: 0.3,
    performanceScore: 89,
    performanceWeight: 0.4,
    purposeScore: 81,
    purposeWeight: 0.3,
    shareOfVoice: 27,
    trend: "stable",
  },
  // BoA — score 72
  {
    companySlug: "bank-of-africa",
    overall: 72,
    sentiment: 75,
    aiVisibility: 68,
    volume: 70,
    authority: 74,
    innovationScore: 80,
    innovationWeight: 0.3,
    performanceScore: 78,
    performanceWeight: 0.4,
    purposeScore: 65,
    purposeWeight: 0.3,
    shareOfVoice: 22,
    trend: "up",
  },
  // IAM — score 76
  {
    companySlug: "maroc-telecom",
    overall: 76,
    sentiment: 73,
    aiVisibility: 78,
    volume: 80,
    authority: 75,
    innovationScore: 86,
    innovationWeight: 0.3,
    performanceScore: 74,
    performanceWeight: 0.4,
    purposeScore: 70,
    purposeWeight: 0.3,
    shareOfVoice: 18,
    trend: "up",
  },
  // RAM — score 68
  {
    companySlug: "royal-air-maroc",
    overall: 68,
    sentiment: 65,
    aiVisibility: 70,
    volume: 72,
    authority: 71,
    innovationScore: 74,
    innovationWeight: 0.3,
    performanceScore: 66,
    performanceWeight: 0.4,
    purposeScore: 67,
    purposeWeight: 0.3,
    shareOfVoice: 12,
    trend: "down",
  },
];

// ─── SAMPLE ARTICLES (real Moroccan media sources) ──────────────
const ARTICLES = [
  // OCP articles
  { companySlug: "ocp-group", title: "OCP announces $1.3B green ammonia plant at Jorf Lasfar", url: "https://hespress.com/ocp-green-ammonia-2026", source: "Hespress", publishedAt: "2026-07-15T08:30:00Z", sentimentLabel: "positive", sentimentScore: 0.85, relevanceScore: 0.95, language: "fr" },
  { companySlug: "ocp-group", title: "OCP Q2 2026 results: MAD 80.4B revenue, +12% YoY", url: "https://medias24.com/ocp-q2-2026-results", source: "Medias24", publishedAt: "2026-07-22T14:00:00Z", sentimentLabel: "positive", sentimentScore: 0.78, relevanceScore: 0.92, language: "fr" },
  { companySlug: "ocp-group", title: "Bekkat-Oued Zem water dispute: OCP responds with desalination plan", url: "https://le360.ma/ocp-water-dispute", source: "Le360", publishedAt: "2026-07-18T10:15:00Z", sentimentLabel: "negative", sentimentScore: -0.45, relevanceScore: 0.88, language: "fr" },
  { companySlug: "ocp-group", title: "Mostafa Terrab: 'Africa's food security depends on phosphate'", url: "https://telquel.ma/terrab-food-security", source: "TelQuel", publishedAt: "2026-07-20T16:45:00Z", sentimentLabel: "positive", sentimentScore: 0.72, relevanceScore: 0.85, language: "fr" },

  // Attijariwafa articles
  { companySlug: "attijariwafa-bank", title: "Attijariwafa Q2 record: net income +18% YoY", url: "https://leconomiste.com/attijariwafa-q2", source: "L'Économiste", publishedAt: "2026-07-21T09:00:00Z", sentimentLabel: "positive", sentimentScore: 0.82, relevanceScore: 0.95, language: "fr" },
  { companySlug: "attijariwafa-bank", title: "Attijariwafa launches new mobile banking app", url: "https://hespress.com/attijariwafa-app", source: "Hespress", publishedAt: "2026-07-10T11:30:00Z", sentimentLabel: "positive", sentimentScore: 0.68, relevanceScore: 0.80, language: "fr" },
  { companySlug: "attijariwafa-bank", title: "Ismail Douiri: 'Pan-African expansion is our growth engine'", url: "https://medias24.com/douiri-interview", source: "Medias24", publishedAt: "2026-07-19T13:00:00Z", sentimentLabel: "positive", sentimentScore: 0.75, relevanceScore: 0.90, language: "fr" },

  // BoA articles
  { companySlug: "bank-of-africa", title: "Bank of Africa acquires Prestige Bank Nigeria", url: "https://financialafrik.com/boa-nigeria", source: "Financial Afrik", publishedAt: "2026-07-05T15:00:00Z", sentimentLabel: "positive", sentimentScore: 0.80, relevanceScore: 0.95, language: "fr" },
  { companySlug: "bank-of-africa", title: "BoA issues $250M green bond, oversubscribed 2.8x", url: "https://le360.ma/boa-green-bond", source: "Le360", publishedAt: "2026-06-28T10:00:00Z", sentimentLabel: "positive", sentimentScore: 0.85, relevanceScore: 0.88, language: "fr" },
  { companySlug: "bank-of-africa", title: "October staff strike closes 142 BoA branches for 3 days", url: "https://hespress.com/boa-strike", source: "Hespress", publishedAt: "2025-10-15T08:00:00Z", sentimentLabel: "negative", sentimentScore: -0.70, relevanceScore: 0.92, language: "fr" },

  // IAM articles
  { companySlug: "maroc-telecom", title: "Maroc Telecom receives 5G license for MAD 2.4B", url: "https://le360.ma/iam-5g-license", source: "Le360", publishedAt: "2026-07-12T14:30:00Z", sentimentLabel: "positive", sentimentScore: 0.88, relevanceScore: 0.98, language: "fr" },
  { companySlug: "maroc-telecom", title: "IAM 5G rollout: 90% urban coverage target by 2027", url: "https://medias24.com/iam-5g-coverage", source: "Medias24", publishedAt: "2026-07-14T09:15:00Z", sentimentLabel: "positive", sentimentScore: 0.75, relevanceScore: 0.90, language: "fr" },
  { companySlug: "maroc-telecom", title: "ANRT quality dashboard: IAM leads on call-drop rates", url: "https://telquel.ma/anrt-qos", source: "TelQuel", publishedAt: "2026-07-16T11:00:00Z", sentimentLabel: "neutral", sentimentScore: 0.10, relevanceScore: 0.82, language: "fr" },

  // RAM articles
  { companySlug: "royal-air-maroc", title: "RAM adds 6 new African routes in 18 months", url: "https://financialafrik.com/ram-africa-routes", source: "Financial Afrik", publishedAt: "2026-07-08T16:00:00Z", sentimentLabel: "positive", sentimentScore: 0.78, relevanceScore: 0.90, language: "fr" },
  { companySlug: "royal-air-maroc", title: "RAM receives 4th Boeing 787-9 Dreamliner", url: "https://le360.ma/ram-dreamliner", source: "Le360", publishedAt: "2026-06-20T10:30:00Z", sentimentLabel: "positive", sentimentScore: 0.72, relevanceScore: 0.85, language: "fr" },
  { companySlug: "royal-air-maroc", title: "CDG ground-handling incident delays RAM Casablanca-Paris flight", url: "https://hespress.com/ram-cdg-delay", source: "Hespress", publishedAt: "2026-02-14T18:00:00Z", sentimentLabel: "negative", sentimentScore: -0.60, relevanceScore: 0.88, language: "fr" },
];

// ─── AI VISIBILITY (which AI engines cite each company) ─────────
const AI_VISIBILITY = [
  // OCP
  { companySlug: "ocp-group", platform: "ChatGPT", cited: true, position: "top-1", sentiment: "positive", confidence: 0.92, summary: "Cited as world's largest phosphate producer with strong ESG narrative." },
  { companySlug: "ocp-group", platform: "Perplexity", cited: true, position: "top-1", sentiment: "positive", confidence: 0.95, summary: "Mentions green ammonia plant + Morocco's 70% reserve dominance." },
  { companySlug: "ocp-group", platform: "Gemini", cited: true, position: "top-3", sentiment: "positive", confidence: 0.88, summary: "References OCP in phosphate market context." },
  { companySlug: "ocp-group", platform: "Claude", cited: true, position: "top-1", sentiment: "positive", confidence: 0.90, summary: "Cites OCP as African industrial champion." },

  // Attijariwafa
  { companySlug: "attijariwafa-bank", platform: "ChatGPT", cited: true, position: "top-1", sentiment: "positive", confidence: 0.89, summary: "Cited as Morocco's largest bank." },
  { companySlug: "attijariwafa-bank", platform: "Perplexity", cited: true, position: "top-1", sentiment: "positive", confidence: 0.91, summary: "References pan-African footprint." },
  { companySlug: "attijariwafa-bank", platform: "Gemini", cited: true, position: "top-3", sentiment: "neutral", confidence: 0.75, summary: "Mentions in North African banking context." },
  { companySlug: "attijariwafa-bank", platform: "Claude", cited: true, position: "top-3", sentiment: "positive", confidence: 0.82, summary: "Cited as leading Moroccan financial institution." },

  // BoA
  { companySlug: "bank-of-africa", platform: "ChatGPT", cited: true, position: "top-3", sentiment: "positive", confidence: 0.78, summary: "Cited for pan-African expansion." },
  { companySlug: "bank-of-africa", platform: "Perplexity", cited: true, position: "top-3", sentiment: "positive", confidence: 0.80, summary: "References Nigeria market entry." },
  { companySlug: "bank-of-africa", platform: "Gemini", cited: false, position: null, sentiment: null, confidence: 0.20, summary: "Not cited in test queries." },
  { companySlug: "bank-of-africa", platform: "Claude", cited: false, position: null, sentiment: null, confidence: 0.15, summary: "Not cited — AI visibility gap." },

  // IAM
  { companySlug: "maroc-telecom", platform: "ChatGPT", cited: true, position: "top-1", sentiment: "positive", confidence: 0.85, summary: "Cited as Morocco's incumbent telecom." },
  { companySlug: "maroc-telecom", platform: "Perplexity", cited: true, position: "top-3", sentiment: "positive", confidence: 0.82, summary: "References 5G license." },
  { companySlug: "maroc-telecom", platform: "Gemini", cited: true, position: "top-3", sentiment: "neutral", confidence: 0.70, summary: "Mentions in telecom market context." },
  { companySlug: "maroc-telecom", platform: "Claude", cited: true, position: "top-3", sentiment: "positive", confidence: 0.78, summary: "Cited as Moroccan telecom leader." },

  // RAM
  { companySlug: "royal-air-maroc", platform: "ChatGPT", cited: true, position: "top-3", sentiment: "positive", confidence: 0.80, summary: "Cited as oneworld member." },
  { companySlug: "royal-air-maroc", platform: "Perplexity", cited: true, position: "top-3", sentiment: "neutral", confidence: 0.72, summary: "References African expansion." },
  { companySlug: "royal-air-maroc", platform: "Gemini", cited: true, position: "top-5", sentiment: "neutral", confidence: 0.65, summary: "Mentions in airline context." },
  { companySlug: "royal-air-maroc", platform: "Claude", cited: true, position: "top-3", sentiment: "positive", confidence: 0.75, summary: "Cited as Morocco's flag carrier." },
];

// ─── RISK ASSESSMENTS ───────────────────────────────────────────
const RISK_ASSESSMENTS = [
  { companySlug: "ocp-group", category: "Environmental", overallRisk: 0.65, riskLevel: "high", riskScore: 70, frequency: 0.8, impactSeverity: 0.7, velocity: 0.5, trajectory: "rising", articleCount: 18 },
  { companySlug: "ocp-group", category: "Operational", overallRisk: 0.78, riskLevel: "high", riskScore: 78, frequency: 0.7, impactSeverity: 0.9, velocity: 0.4, trajectory: "stable", articleCount: 12 },
  { companySlug: "ocp-group", category: "Regulatory", overallRisk: 0.45, riskLevel: "medium", riskScore: 45, frequency: 0.4, impactSeverity: 0.6, velocity: 0.3, trajectory: "stable", articleCount: 8 },
  { companySlug: "attijariwafa-bank", category: "Financial", overallRisk: 0.30, riskLevel: "low", riskScore: 30, frequency: 0.3, impactSeverity: 0.4, velocity: 0.2, trajectory: "falling", articleCount: 6 },
  { companySlug: "attijariwafa-bank", category: "Operational", overallRisk: 0.40, riskLevel: "medium", riskScore: 40, frequency: 0.5, impactSeverity: 0.5, velocity: 0.3, trajectory: "stable", articleCount: 10 },
  { companySlug: "bank-of-africa", category: "Labor", overallRisk: 0.62, riskLevel: "high", riskScore: 62, frequency: 0.7, impactSeverity: 0.6, velocity: 0.8, trajectory: "rising", articleCount: 15 },
  { companySlug: "bank-of-africa", category: "AI Visibility", overallRisk: 0.55, riskLevel: "medium", riskScore: 55, frequency: 0.4, impactSeverity: 0.7, velocity: 0.5, trajectory: "rising", articleCount: 5 },
  { companySlug: "maroc-telecom", category: "Regulatory", overallRisk: 0.50, riskLevel: "medium", riskScore: 50, frequency: 0.5, impactSeverity: 0.6, velocity: 0.4, trajectory: "rising", articleCount: 9 },
  { companySlug: "maroc-telecom", category: "Operational", overallRisk: 0.35, riskLevel: "low", riskScore: 35, frequency: 0.4, impactSeverity: 0.4, velocity: 0.3, trajectory: "falling", articleCount: 7 },
  { companySlug: "royal-air-maroc", category: "Operational", overallRisk: 0.72, riskLevel: "high", riskScore: 72, frequency: 0.8, impactSeverity: 0.7, velocity: 0.6, trajectory: "rising", articleCount: 22 },
  { companySlug: "royal-air-maroc", category: "Reputational", overallRisk: 0.58, riskLevel: "medium", riskScore: 58, frequency: 0.6, impactSeverity: 0.6, velocity: 0.5, trajectory: "rising", articleCount: 14 },
];

// ─── MAIN ───────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding Neon database...\n");

  // 1. Companies
  console.log("📁 Creating companies...");
  const companyMap: Record<string, string> = {};
  for (const c of COMPANIES) {
    const company = await prisma.company.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        aliases: c.aliases,
        sector: c.sector,
        ticker: c.ticker,
        foundedYear: c.foundedYear,
        headquarters: c.headquarters,
        website: c.website,
        description: c.description,
      },
      create: {
        slug: c.slug,
        name: c.name,
        aliases: c.aliases,
        sector: c.sector,
        ticker: c.ticker,
        foundedYear: c.foundedYear,
        headquarters: c.headquarters,
        website: c.website,
        description: c.description,
      },
    });
    companyMap[c.slug] = company.id;
    console.log(`  ✓ ${c.name} (${company.id})`);
  }

  // 2. Reputation scores
  console.log("\n📊 Creating reputation scores...");
  for (const rs of REPUTATION_SCORES) {
    const companyId = companyMap[rs.companySlug];
    if (!companyId) continue;

    // Delete existing scores for this company (we'll re-create)
    await prisma.reputationScore.deleteMany({ where: { companyId } });

    await prisma.reputationScore.create({
      data: {
        companyId,
        overall: rs.overall,
        sentiment: rs.sentiment,
        aiVisibility: rs.aiVisibility,
        volume: rs.volume,
        authority: rs.authority,
        innovationScore: rs.innovationScore,
        innovationWeight: rs.innovationWeight,
        performanceScore: rs.performanceScore,
        performanceWeight: rs.performanceWeight,
        purposeScore: rs.purposeScore,
        purposeWeight: rs.purposeWeight,
        shareOfVoice: rs.shareOfVoice,
        trend: rs.trend,
      },
    });
    console.log(`  ✓ ${rs.companySlug}: score ${rs.overall}/100`);
  }

  // 3. Articles
  console.log("\n📰 Creating articles...");
  for (const a of ARTICLES) {
    const companyId = companyMap[a.companySlug];
    if (!companyId) continue;

    const urlHash = hashUrl(a.url);

    await prisma.article.upsert({
      where: { url: a.url },
      update: {
        companyId,
        title: a.title,
        source: a.source,
        publishedAt: new Date(a.publishedAt),
        sentimentLabel: a.sentimentLabel,
        sentimentScore: a.sentimentScore,
        relevanceScore: a.relevanceScore,
        language: a.language,
        urlHash,
        processed: true,
      },
      create: {
        companyId,
        title: a.title,
        url: a.url,
        urlHash,
        source: a.source,
        publishedAt: new Date(a.publishedAt),
        sentimentLabel: a.sentimentLabel,
        sentimentScore: a.sentimentScore,
        relevanceScore: a.relevanceScore,
        language: a.language,
        processed: true,
      },
    });
    console.log(`  ✓ ${a.source}: ${a.title.substring(0, 50)}...`);
  }

  // 4. AI visibility
  console.log("\n🤖 Creating AI visibility records...");
  for (const av of AI_VISIBILITY) {
    const companyId = companyMap[av.companySlug];
    if (!companyId) continue;

    // Delete existing for this company+platform combo
    await prisma.aIVisibility.deleteMany({
      where: { companyId, platform: av.platform },
    });

    await prisma.aIVisibility.create({
      data: {
        companyId,
        platform: av.platform,
        cited: av.cited,
        position: av.position,
        sentiment: av.sentiment,
        confidence: av.confidence,
        summary: av.summary,
      },
    });
    console.log(`  ✓ ${av.companySlug} on ${av.platform}: ${av.cited ? "cited" : "not cited"}`);
  }

  // 5. Risk assessments
  console.log("\n⚠️  Creating risk assessments...");
  for (const ra of RISK_ASSESSMENTS) {
    const companyId = companyMap[ra.companySlug];
    if (!companyId) continue;

    // Delete existing for this company+category combo
    await prisma.riskAssessment.deleteMany({
      where: { companyId, category: ra.category },
    });

    await prisma.riskAssessment.create({
      data: {
        companyId,
        overallRisk: ra.overallRisk,
        riskLevel: ra.riskLevel,
        category: ra.category,
        frequency: ra.frequency,
        impactSeverity: ra.impactSeverity,
        velocity: ra.velocity,
        riskScore: ra.riskScore,
        trajectory: ra.trajectory,
        articleCount: ra.articleCount,
      },
    });
    console.log(`  ✓ ${ra.companySlug} - ${ra.category}: ${ra.riskLevel} (${ra.riskScore}/100)`);
  }

  // Summary
  console.log("\n" + "═".repeat(50));
  console.log("🌱 SEED COMPLETE");
  console.log("═".repeat(50));

  const counts = {
    companies: await prisma.company.count(),
    articles: await prisma.article.count(),
    reputationScores: await prisma.reputationScore.count(),
    aiVisibility: await prisma.aIVisibility.count(),
    riskAssessments: await prisma.riskAssessment.count(),
  };

  console.log("\nDatabase now contains:");
  console.log(`  • ${counts.companies} companies`);
  console.log(`  • ${counts.articles} articles`);
  console.log(`  • ${counts.reputationScores} reputation scores`);
  console.log(`  • ${counts.aiVisibility} AI visibility records`);
  console.log(`  • ${counts.riskAssessments} risk assessments`);
  console.log("\n✅ You can now sign in and see real data in the Console.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

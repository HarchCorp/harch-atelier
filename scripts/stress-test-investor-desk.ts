#!/usr/bin/env bun
// ═══════════════════════════════════════════════════════════════
//  scripts/stress-test-investor-desk.ts
//
//  Stress test seed for the Investor Desk Dashboard hardening
//  (Task ID: omega-investor-desk).
//
//  Generates a worst-case dataset to validate the React Flow node
//  cap (2000 visible), ECharts large-mode (100k points), and the
//  virtualized feeds under load:
//
//    [1/3]  500 holdings across 40 jurisdictions
//          (500 Companies + 1 Portfolio + 500 PortfolioHoldings)
//    [2/3]  50,000 entity graph nodes
//          (Entity rows: company | ubo | subsidiary | director | shell)
//    [3/3]  100,000 adverse media events spread over 2010–2025
//          (Article rows with publishedAt across the 15-year window)
//
//  Insertion is batched (1000 rows per createMany call) so the
//  script completes in minutes, not hours.
//
//  Usage:
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-investor-desk.ts
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-investor-desk.ts --cleanup
//
//  The env -u override is required in the Z.ai sandbox because the
//  parent shell exports a STALE SQLite DATABASE_URL. src/lib/db.ts
//  re-reads the correct value from .env, but the override is the
//  belt-and-suspenders path for raw scripts.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";

// ─── 40 jurisdictions (ISO-3166-style city tags) ───────────────
const JURISDICTIONS = [
  "MA - Casablanca", "MA - Rabat", "FR - Paris", "FR - Lyon",
  "BE - Brussels", "CH - Geneva", "CH - Zurich", "NL - Amsterdam",
  "LU - Luxembourg", "AE - Dubai", "AE - Abu Dhabi", "KY - Cayman",
  "KY - George Town", "VG - Tortola", "BM - Hamilton", "US - New York",
  "US - Wilmington", "US - San Francisco", "GB - London", "GB - Edinburgh",
  "DE - Frankfurt", "DE - Munich", "IT - Milan", "ES - Madrid",
  "PT - Lisbon", "IE - Dublin", "MC - Monaco", "LI - Vaduz",
  "SG - Singapore", "HK - Hong Kong", "JP - Tokyo", "CN - Shanghai",
  "CA - Toronto", "AU - Sydney", "BR - Sao Paulo", "ZA - Johannesburg",
  "EG - Cairo", "SA - Riyadh", "QA - Doha", "TR - Istanbul",
] as const;

const ENTITY_TYPES = ["company", "ubo", "subsidiary", "director", "shell"] as const;
const SECTORS = ["Banking", "Mining", "Telecom", "Energy", "Real Estate", "Insurance", "Agri", "Logistics"] as const;
const ADVERSE_SOURCES = [
  "Hespress", "Le360", "TelQuel", "Medias24", "L'Economiste",
  "Reuters", "Bloomberg", "Jeune Afrique", "Financial Times",
  "Wall Street Journal", "HarchIQ Archive",
] as const;
const ADVERSE_TITLES = [
  "{c} faces regulatory tribunal hearing",
  "{c} cited for environmental emission breach",
  "{c} tax audit dispute resurfaces",
  "{c} scandal draws media backlash",
  "{c} sanctioned by AMMC over disclosure",
  "{c} executive resigns amid probe",
  "{c} subsidiary files for insolvency",
  "{c} cross-border laundering inquiry",
] as const;

const HOLDING_COUNT = 500;
const ENTITY_COUNT = 50_000;
const ARTICLE_COUNT = 100_000;
const BATCH = 1000;
const STRESS_USER_EMAIL = "stress-investor@harch.test";
const URL_PREFIX = "https://stress-test.local/";
const SLUG_PREFIX = "stress-co-";
const PORTFOLIO_NAME_PREFIX = "Stress Test Portfolio";

// FNV-1a hash — deterministic so the same idx always maps to the
// same jurisdiction / sector / source / date. Lets us regenerate
// the dataset without re-randomising the distribution.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickJurisdiction(h: number): string {
  return JURISDICTIONS[h % JURISDICTIONS.length];
}

function memoryUsage(): string {
  if (typeof process !== "undefined" && typeof process.memoryUsage === "function") {
    const m = process.memoryUsage();
    return `RSS ${(m.rss / 1024 / 1024).toFixed(1)} MB · Heap ${(m.heapUsed / 1024 / 1024).toFixed(1)} / ${(m.heapTotal / 1024 / 1024).toFixed(1)} MB`;
  }
  return "memory usage unavailable";
}

// ─── Cleanup ───────────────────────────────────────────────────
//
//  Selective delete — only touches rows tagged with the stress-test
//  prefixes (slug / url / portfolio name / entity tag / user email).
//  Real data is never affected.

async function cleanup(): Promise<void> {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  STRESS TEST CLEANUP");
  console.log("══════════════════════════════════════════════════════════════");
  const start = Date.now();

  // 1. Articles — delete by URL prefix
  const articleDel = await prisma.article.deleteMany({
    where: { url: { startsWith: URL_PREFIX } },
  });
  console.log(`  Articles deleted:    ${articleDel.count}`);

  // 2. Entities — delete by stress-test tag
  const entityDel = await prisma.entity.deleteMany({
    where: { tags: { has: "stress-test" } },
  });
  console.log(`  Entities deleted:    ${entityDel.count}`);

  // 3. Portfolios (cascade deletes PortfolioHoldings) — delete by name prefix
  const portfolioDel = await prisma.portfolio.deleteMany({
    where: { name: { startsWith: PORTFOLIO_NAME_PREFIX } },
  });
  console.log(`  Portfolios deleted:  ${portfolioDel.count}`);

  // 4. Companies — delete by slug prefix
  const companyDel = await prisma.company.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
  console.log(`  Companies deleted:   ${companyDel.count}`);

  // 5. Stress-test user — delete by email
  const userDel = await prisma.user.deleteMany({
    where: { email: STRESS_USER_EMAIL },
  });
  console.log(`  Stress users deleted:${userDel.count}`);

  console.log(`Cleanup done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`Peak memory: ${memoryUsage()}`);
}

// ─── Find or create the dedicated stress-test investor user ────

async function findOrCreateStressUser(): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email: STRESS_USER_EMAIL }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.user.create({
    data: {
      email: STRESS_USER_EMAIL,
      name: "Stress Test Investor",
      role: "user",
      accountType: "investment-bank",
    },
    select: { id: true },
  });
  return created.id;
}

// ─── [1/3] Holdings: 500 companies + 1 portfolio + 500 holdings ──

async function seedHoldings(userId: string): Promise<(i: number) => string> {
  console.log("\n[1/3] Generating 500 holdings across 40 jurisdictions...");
  const start = Date.now();

  // Insert companies in batches of BATCH
  const companySlugs: string[] = [];
  for (let i = 0; i < HOLDING_COUNT; i += BATCH) {
    const batch: Array<{
      slug: string;
      name: string;
      aliases: string[];
      sector: string;
      headquarters: string;
      description: string;
    }> = [];
    for (let j = 0; j < Math.min(BATCH, HOLDING_COUNT - i); j++) {
      const idx = i + j;
      const h = hashString(`${SLUG_PREFIX}${idx}`);
      const jurisdiction = pickJurisdiction(h);
      const sector = SECTORS[h % SECTORS.length];
      const slug = `${SLUG_PREFIX}${idx}`;
      companySlugs.push(slug);
      batch.push({
        slug,
        name: `Stress Target ${idx} (${jurisdiction.split(" - ")[1]})`,
        aliases: [],
        sector,
        headquarters: jurisdiction,
        description: `Stress-test target ${idx} in ${jurisdiction} (${sector}).`,
      });
    }
    await prisma.company.createMany({ data: batch, skipDuplicates: true });
  }

  // Resolve slug → id
  const companies = await prisma.company.findMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(companies.map((c) => [c.slug, c.id]));
  const companyIdByIndex = (i: number): string => {
    const id = slugToId.get(`${SLUG_PREFIX}${i}`);
    if (!id) throw new Error(`Company slug stress-co-${i} not found after insert`);
    return id;
  };

  // One portfolio for all 500 holdings
  const portfolio = await prisma.portfolio.create({
    data: {
      name: `${PORTFOLIO_NAME_PREFIX} ${Date.now()}`,
      userId,
      description: `Auto-generated stress test portfolio — ${HOLDING_COUNT} holdings across ${JURISDICTIONS.length} jurisdictions`,
    },
    select: { id: true },
  });

  // Batch-insert 500 holdings
  const holdingBatch: Array<{ portfolioId: string; companyId: string; weight: number }> = [];
  for (let i = 0; i < HOLDING_COUNT; i++) {
    const h = hashString(`${SLUG_PREFIX}${i}`);
    // Weight: 0.1% to ~5%, deterministic
    const weight = Math.round(((h % 50) / 1000 + 0.001) * 10000) / 10000;
    holdingBatch.push({
      portfolioId: portfolio.id,
      companyId: companyIdByIndex(i),
      weight,
    });
  }
  // HOLDING_COUNT (500) < BATCH (1000) so a single createMany suffices
  await prisma.portfolioHolding.createMany({ data: holdingBatch, skipDuplicates: true });

  console.log(`  ${HOLDING_COUNT} companies + 1 portfolio + ${HOLDING_COUNT} holdings across ${JURISDICTIONS.length} jurisdictions`);
  console.log(`  Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  return companyIdByIndex;
}

// ─── [2/3] Entity graph nodes (50,000 rows) ────────────────────

async function seedEntityNodes(): Promise<void> {
  console.log("\n[2/3] Generating 50,000 entity graph nodes...");
  const start = Date.now();

  for (let i = 0; i < ENTITY_COUNT; i += BATCH) {
    const batch: Array<{
      entityType: string;
      name: string;
      aliases: string[];
      confidence: number;
      sources: string[];
      tags: string[];
      metadata: { jurisdiction: string; idx: number } | null;
    }> = [];
    for (let j = 0; j < Math.min(BATCH, ENTITY_COUNT - i); j++) {
      const idx = i + j;
      const h = hashString(`stress-entity-${idx}`);
      const entityType = ENTITY_TYPES[h % ENTITY_TYPES.length];
      const jurisdiction = pickJurisdiction(h);
      const firstWord = ["Holding", "Capital", "Investments", "International", "Africa"][h % 5];
      batch.push({
        entityType,
        name: `Stress ${entityType} ${idx} ${firstWord}`,
        aliases: [],
        confidence: 0.4 + (h % 60) / 100,
        sources: ["stress-test"],
        tags: ["stress-test", `jur-${jurisdiction.split(" - ")[0]}`, entityType],
        metadata: { jurisdiction, idx },
      });
    }
    await prisma.entity.createMany({ data: batch });
    if ((i + BATCH) % 5000 === 0 || i + BATCH >= ENTITY_COUNT) {
      console.log(`  Inserted ${Math.min(i + BATCH, ENTITY_COUNT)} / ${ENTITY_COUNT} entity nodes`);
    }
  }
  console.log(`  Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

// ─── [3/3] Adverse media events (100,000 rows, 2010–2025) ──────

async function seedAdverseMedia(companyIdByIndex: (i: number) => string): Promise<void> {
  console.log("\n[3/3] Generating 100,000 adverse media events (2010–2025)...");
  const start = Date.now();
  const START_TS = new Date("2010-01-01T00:00:00Z").getTime();
  const END_TS = new Date("2025-01-01T00:00:00Z").getTime();
  const SPAN_MS = END_TS - START_TS;

  for (let i = 0; i < ARTICLE_COUNT; i += BATCH) {
    const batch: Array<{
      companyId: string;
      title: string;
      url: string;
      source: string;
      sourceId: string;
      publishedAt: Date;
      scrapedAt: Date;
      content: string;
      summary: string;
      language: string;
      sentimentLabel: string;
      sentimentScore: number;
      relevanceScore: number;
      urlHash: string;
      processed: boolean;
    }> = [];
    for (let j = 0; j < Math.min(BATCH, ARTICLE_COUNT - i); j++) {
      const idx = i + j;
      const h = hashString(`stress-article-${idx}`);
      const ts = START_TS + (h % SPAN_MS);
      const publishedAt = new Date(ts);
      const companyIdx = h % HOLDING_COUNT;
      const companyId = companyIdByIndex(companyIdx);
      const titleTpl = ADVERSE_TITLES[h % ADVERSE_TITLES.length];
      const source = ADVERSE_SOURCES[h % ADVERSE_SOURCES.length];
      const sentimentLabel = h % 4 === 0 ? "negative" : h % 4 === 1 ? "neutral" : h % 4 === 2 ? "positive" : "negative";
      batch.push({
        companyId,
        title: titleTpl.replace("{c}", `Stress Target ${companyIdx}`),
        url: `${URL_PREFIX}article-${idx}`,
        source,
        sourceId: `stress-${idx}`,
        publishedAt,
        scrapedAt: publishedAt,
        content: `Stress-test adverse media event ${idx}. Source: ${source}.`,
        summary: `Derived event for stress test (jurisdiction ${pickJurisdiction(h)}).`,
        language: "en",
        sentimentLabel,
        sentimentScore: (h % 100) / 100 - 0.5,
        relevanceScore: 0.5 + (h % 50) / 100,
        urlHash: `stress-${idx.toString(16).padStart(8, "0")}`,
        processed: true,
      });
    }
    await prisma.article.createMany({ data: batch, skipDuplicates: true });
    if ((i + BATCH) % 10000 === 0 || i + BATCH >= ARTICLE_COUNT) {
      console.log(`  Inserted ${Math.min(i + BATCH, ARTICLE_COUNT)} / ${ARTICLE_COUNT} articles`);
    }
  }
  console.log(`  Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
}

// ─── Entry point ───────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--cleanup")) {
    await cleanup();
    await prisma.$disconnect();
    return;
  }

  console.log("══════════════════════════════════════════════════════════════");
  console.log("  INVESTOR DESK — STRESS TEST SEED (omega-investor-desk)");
  console.log("══════════════════════════════════════════════════════════════");
  console.log(`Start:         ${new Date().toISOString()}`);
  console.log(`Memory at start: ${memoryUsage()}`);
  console.log(`Targets:       ${HOLDING_COUNT} holdings · ${ENTITY_COUNT} entity nodes · ${ARTICLE_COUNT} articles`);
  const overallStart = Date.now();

  const userId = await findOrCreateStressUser();
  console.log(`Stress user:   ${userId} (${STRESS_USER_EMAIL})`);

  const companyIdByIndex = await seedHoldings(userId);
  await seedEntityNodes();
  await seedAdverseMedia(companyIdByIndex);

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`  STRESS SEED COMPLETE — total ${((Date.now() - overallStart) / 1000).toFixed(1)}s`);
  console.log(`  Peak memory:  ${memoryUsage()}`);
  console.log(`  End:          ${new Date().toISOString()}`);
  console.log("══════════════════════════════════════════════════════════════");
  console.log("\nTo clean up: env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-investor-desk.ts --cleanup");

  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("Stress test failed:", err);
  process.exit(1);
});

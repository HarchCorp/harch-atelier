#!/usr/bin/env bun
// ═══════════════════════════════════════════════════════════════
//  scripts/stress-test-competitor-intel.ts
//
//  Stress test seed for the Competitor Intel Dashboard hardening
//  (Task ID: omega-competitor-intel).
//
//  Generates a worst-case dataset to validate the React.memo chart
//  sub-components, the ECharts large-mode Sankey (1000+ links), the
//  virtualized tactical feed (5000+ rows) and the localStorage
//  debounced basket under load:
//
//    [1/2]  250 synthetic competitors across 4 sectors
//          (Banking, Telecom, Mining, Consumer)
//          → 250 Company rows + 250 ReputationScore rows
//    [2/2]  5,000 alerts mentioning 2+ competitors each
//          (Article rows with negative sentiment + competitor
//           name pairs in the title for Sankey co-mention detection)
//
//  Insertion is batched (500 rows per createMany call) so the
//  script completes in minutes, not hours.
//
//  Usage:
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-competitor-intel.ts
//    env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-competitor-intel.ts --cleanup
//
//  The env -u override is required in the Z.ai sandbox because the
//  parent shell exports a STALE SQLite DATABASE_URL. src/lib/db.ts
//  re-reads the correct value from .env, but the override is the
//  belt-and-suspenders path for raw scripts.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import crypto from "crypto";

// ─── 4 sectors × ~62 competitors each = 248 + 2 primary = 250 ──
const SECTORS = ["Banking", "Telecom", "Mining", "Consumer"] as const;
type Sector = (typeof SECTORS)[number];

// Sector-specific name pools — lets us generate realistic competitor
// names that look like real Moroccan / African companies.
const SECTOR_NAME_POOL: Record<Sector, string[]> = {
  Banking: ["Bank", "Banque", "Credit", "Finance", "Capital Trust", "Bancorp", "Savings"],
  Telecom: ["Tel", "Mobile", "Connect", "Networks", "Fibre", "Wireless", "Comms"],
  Mining: ["Minerals", "Cobalt", "Phosphate", "Goldcorp", "Resources", "Ore", "Extracta"],
  Consumer: ["Retail", "Brands", "Markets", "Goods", "Distrib", "Mart", "Holdings"],
};

const SECTOR_PREFIX: Record<Sector, string> = {
  Banking: "BK",
  Telecom: "TL",
  Mining: "MN",
  Consumer: "CS",
};

// Adverse-media sources (Moroccan + African + intl press).
const ADVERSE_SOURCES = [
  "Hespress", "Le360", "TelQuel", "Medias24", "L'Economiste",
  "Reuters", "Bloomberg", "Jeune Afrique", "Financial Times",
  "Wall Street Journal", "Financial Afrik", "HarchIQ Archive",
] as const;

// Title templates — each includes 2 {c1} / {c2} placeholders so the
// Sankey co-mention detection picks them up. Stress on negative
// sentiment and competitor pairings.
const TITLE_TEMPLATES = [
  "{c1} overtakes {c2} in latest market share report",
  "{c1} and {c2} face regulatory probe over pricing",
  "{c1} acquires stake in {c2}, reshaping sector",
  "{c1} scandal draws comparison to {c2} governance",
  "{c1} CEO resigns amid {c2} leadership shake-up",
  "{c1} Q2 results beat {c2} as investors rotate",
  "{c1} product launch overshadows {c2} roadmap",
  "{c1} fined alongside {c2} by competition authority",
  "{c1} appoints former {c2} executive as new CEO",
  "{c1} bad buzz spills over to {c2} share price",
] as const;

const COMPETITOR_COUNT = 250; // 4 sectors × 62 + 2 = 250
const ALERT_COUNT = 5000;
const BATCH = 500;
const SLUG_PREFIX = "stress-cmp-";
const URL_PREFIX = "https://stress-test.local/competitor-intel/";
const PRIMARY_SLUG = "stress-cmp-primary";
const PRIMARY_NAME = "Stress Test Primary (You)";

// FNV-1a hash — deterministic so the same idx always maps to the
// same sector / source / date / pair. Lets us regenerate the dataset
// without re-randomising the distribution.
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

function pickSector(idx: number): Sector {
  // Distribute 250 competitors evenly across the 4 sectors.
  // idx 0..249 → sector[i % 4]
  return SECTORS[idx % SECTORS.length];
}

function competitorName(idx: number, sector: Sector): string {
  const h = hashString(`${SLUG_PREFIX}${idx}`);
  const pool = SECTOR_NAME_POOL[sector];
  const suffix = pool[h % pool.length];
  return `Stress ${SECTOR_PREFIX[sector]}-${idx.toString().padStart(3, "0")} ${suffix}`;
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
//  prefixes (slug / url). Real data is never affected.

async function cleanup(): Promise<void> {
  console.log("══════════════════════════════════════════════════════════════");
  console.log("  STRESS TEST CLEANUP — Competitor Intel");
  console.log("══════════════════════════════════════════════════════════════");
  const start = Date.now();

  // 1. Articles — delete by URL prefix (covers all 5000 alerts + primary)
  const articleDel = await prisma.article.deleteMany({
    where: { url: { startsWith: URL_PREFIX } },
  });
  console.log(`  Articles deleted:    ${articleDel.count}`);

  // 2. ReputationScores — cascade delete handles this when companies
  //    are deleted, but we run an explicit deleteMany for safety in
  //    case any orphan rows remain from a previous interrupted run.
  const stressCompanies = await prisma.company.findMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
    select: { id: true },
  });
  const stressCompanyIds = stressCompanies.map((c) => c.id);
  if (stressCompanyIds.length > 0) {
    const scoreDel = await prisma.reputationScore.deleteMany({
      where: { companyId: { in: stressCompanyIds } },
    });
    console.log(`  Reputation scores:   ${scoreDel.count}`);
  }

  // 3. Companies — delete by slug prefix
  const companyDel = await prisma.company.deleteMany({
    where: { slug: { startsWith: SLUG_PREFIX } },
  });
  console.log(`  Companies deleted:   ${companyDel.count}`);

  console.log(`Cleanup done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`Peak memory: ${memoryUsage()}`);
}

// ─── [1/2] Competitors: 250 companies + 250 reputation scores ──

async function seedCompetitors(): Promise<{ idByIndex: (i: number) => string; primaryId: string }> {
  console.log("\n[1/2] Generating 250 competitors across 4 sectors...");
  const start = Date.now();

  // Insert primary first (the "you" company)
  const primary = await prisma.company.upsert({
    where: { slug: PRIMARY_SLUG },
    update: {},
    create: {
      slug: PRIMARY_SLUG,
      name: PRIMARY_NAME,
      aliases: [],
      sector: SECTORS[0], // Banking — primary's sector
      headquarters: "Casablanca",
      description: "Stress-test primary company for Competitor Intel Dashboard.",
    },
    select: { id: true },
  });
  await prisma.reputationScore.deleteMany({ where: { companyId: primary.id } });
  await prisma.reputationScore.create({
    data: {
      companyId: primary.id,
      overall: 67,
      sentiment: 60,
      aiVisibility: 55,
      volume: 70,
      authority: 65,
      innovationScore: 70,
      innovationWeight: 0.3,
      performanceScore: 72,
      performanceWeight: 0.4,
      purposeScore: 62,
      purposeWeight: 0.3,
      shareOfVoice: 8,
      trend: "stable",
    },
  });
  console.log(`  + Primary: ${PRIMARY_NAME} (${primary.id.slice(-6)})`);

  // Insert 249 competitors in batches of BATCH
  const competitorSlugs: string[] = [];
  for (let i = 0; i < COMPETITOR_COUNT - 1; i += BATCH) {
    const batch: Array<{
      slug: string;
      name: string;
      aliases: string[];
      sector: string;
      headquarters: string;
      description: string;
    }> = [];
    const upper = Math.min(BATCH, COMPETITOR_COUNT - 1 - i);
    for (let j = 0; j < upper; j++) {
      const idx = i + j;
      const sector = pickSector(idx);
      const slug = `${SLUG_PREFIX}${idx}`;
      competitorSlugs.push(slug);
      batch.push({
        slug,
        name: competitorName(idx, sector),
        aliases: [],
        sector,
        headquarters: "Casablanca",
        description: `Stress-test competitor ${idx} in ${sector} sector.`,
      });
    }
    await prisma.company.createMany({ data: batch, skipDuplicates: true });
    console.log(`  + Batch ${i / BATCH + 1}: ${upper} companies inserted · ${memoryUsage()}`);
  }

  // Resolve slug → id for all 250 companies (including primary)
  const allSlugs = [PRIMARY_SLUG, ...competitorSlugs];
  const companies = await prisma.company.findMany({
    where: { slug: { in: allSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(companies.map((c) => [c.slug, c.id]));
  const idByIndex = (i: number): string => {
    // Index 0 = primary; index 1..249 = stress-cmp-0..248
    if (i === 0) return primary.id;
    const id = slugToId.get(`${SLUG_PREFIX}${i - 1}`);
    if (!id) throw new Error(`Company slug ${SLUG_PREFIX}${i - 1} not found after insert`);
    return id;
  };

  // Insert reputation scores for all 249 competitors
  // (cascade-on-company-delete will clean them up; here we create them
  //  so the neighbors API can compute rank + delta + threat level)
  const scoreBatch: Array<{
    companyId: string;
    overall: number;
    sentiment: number;
    aiVisibility: number;
    volume: number;
    authority: number;
    innovationScore: number;
    innovationWeight: number;
    performanceScore: number;
    performanceWeight: number;
    purposeScore: number;
    purposeWeight: number;
    shareOfVoice: number;
    trend: string;
  }> = [];
  for (let i = 1; i < COMPETITOR_COUNT; i++) {
    const h = hashString(`${SLUG_PREFIX}${i - 1}`);
    // Spread scores between 45 and 92 so ranks distribute across 1/2/3
    const overall = 45 + (h % 48);
    scoreBatch.push({
      companyId: idByIndex(i),
      overall,
      sentiment: 40 + (h % 50),
      aiVisibility: 40 + (h % 50),
      volume: 50 + (h % 45),
      authority: 45 + (h % 50),
      innovationScore: 60,
      innovationWeight: 0.3,
      performanceScore: overall + 5,
      performanceWeight: 0.4,
      purposeScore: overall - 5,
      purposeWeight: 0.3,
      shareOfVoice: 1 + (h % 20),
      trend: (["up", "stable", "down"] as const)[h % 3],
    });
  }
  // Insert scores in batches of BATCH
  for (let i = 0; i < scoreBatch.length; i += BATCH) {
    const slice = scoreBatch.slice(i, i + BATCH);
    await prisma.reputationScore.createMany({ data: slice, skipDuplicates: true });
  }
  console.log(`  + ${scoreBatch.length} reputation scores inserted`);

  console.log(`Competitors done in ${((Date.now() - start) / 1000).toFixed(1)}s · ${memoryUsage()}`);
  return { idByIndex, primaryId: primary.id };
}

// ─── [2/2] Alerts: 5000 articles mentioning 2+ competitors ────

async function seedAlerts(idByIndex: (i: number) => string, primaryId: string): Promise<void> {
  console.log("\n[2/2] Generating 5,000 alerts mentioning 2+ competitors each...");
  const start = Date.now();
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < ALERT_COUNT; i += BATCH) {
    const batch: Array<{
      companyId: string;
      title: string;
      url: string;
      urlHash: string;
      source: string;
      publishedAt: Date;
      scrapedAt: Date;
      sentimentLabel: string;
      sentimentScore: number;
      relevanceScore: number;
      language: string;
    }> = [];
    const upper = Math.min(BATCH, ALERT_COUNT - i);
    for (let j = 0; j < upper; j++) {
      const idx = i + j;
      const h = hashString(`alert-${idx}`);

      // Pick 2 distinct competitor indices (1..249) for the co-mention
      const a1Idx = 1 + (h % (COMPETITOR_COUNT - 1));
      const a2Idx = 1 + ((h >> 8) % (COMPETITOR_COUNT - 1));
      const a2 = a2Idx === a1Idx
        ? (a1Idx % (COMPETITOR_COUNT - 1)) + 1
        : a2Idx;
      const c1 = competitorName(a1Idx - 1, pickSector(a1Idx - 1));
      const c2 = competitorName(a2 - 1, pickSector(a2 - 1));
      const template = TITLE_TEMPLATES[h % TITLE_TEMPLATES.length];
      const title = template.replace("{c1}", c1).replace("{c2}", c2);
      const source = ADVERSE_SOURCES[(h >> 16) % ADVERSE_SOURCES.length];

      // Negative sentiment score between -0.95 and -0.40 — critical if < -0.6
      const sentimentScore = -0.4 - ((h % 55) / 100);

      // publishedAt within the last 7 days (so the alerts API returns them)
      const publishedAt = new Date(now - (h % sevenDaysMs));

      // URL must be unique — include idx to avoid collisions
      const url = `${URL_PREFIX}${idx}-${h.toString(16)}`;

      batch.push({
        companyId: primaryId, // attach to primary so /api/console/alerts returns them
        title,
        url,
        urlHash: hashUrl(url),
        source,
        publishedAt,
        scrapedAt: new Date(),
        sentimentLabel: "negative",
        sentimentScore,
        relevanceScore: 0.5 + ((h % 50) / 100),
        language: "en",
      });
    }
    await prisma.article.createMany({ data: batch, skipDuplicates: true });
    console.log(`  + Batch ${i / BATCH + 1}/${Math.ceil(ALERT_COUNT / BATCH)}: ${upper} alerts inserted · ${memoryUsage()}`);
  }

  console.log(`Alerts done in ${((Date.now() - start) / 1000).toFixed(1)}s · ${memoryUsage()}`);
}

// ─── Main ──────────────────────────────────────────────────────

async function main(): Promise<void> {
  const isCleanup = process.argv.includes("--cleanup");

  console.log("══════════════════════════════════════════════════════════════");
  console.log("  COMPETITOR INTEL — STRESS TEST SEED");
  console.log(`  Target: ${COMPETITOR_COUNT} competitors · ${ALERT_COUNT} alerts`);
  console.log(`  Sectors: ${SECTORS.join(", ")}`);
  console.log(`  Batch size: ${BATCH} rows per createMany`);
  console.log(`  Mode: ${isCleanup ? "CLEANUP ONLY" : "SEED"}`);
  console.log("══════════════════════════════════════════════════════════════");

  if (isCleanup) {
    await cleanup();
    await prisma.$disconnect();
    return;
  }

  const startTotal = Date.now();
  const { idByIndex, primaryId } = await seedCompetitors();
  await seedAlerts(idByIndex, primaryId);

  console.log("\n══════════════════════════════════════════════════════════════");
  console.log(`  STRESS SEED COMPLETE in ${((Date.now() - startTotal) / 1000).toFixed(1)}s`);
  console.log(`  Primary company slug: ${PRIMARY_SLUG}`);
  console.log(`  Competitor slug prefix: ${SLUG_PREFIX}`);
  console.log(`  Article URL prefix:    ${URL_PREFIX}`);
  console.log(`  Peak memory: ${memoryUsage()}`);
  console.log("══════════════════════════════════════════════════════════════");
  console.log("\nTo verify in the dashboard:");
  console.log("  1. Log in as competitor@harch.test (Password: HarchTest2026!)");
  console.log(`  2. Set primary company to "${PRIMARY_NAME}" (slug: ${PRIMARY_SLUG})`);
  console.log("  3. Open the Competitor Intel Console — Sankey + tactical feed");
  console.log("     should now render 248 neighbors and 5000 alerts.");
  console.log("\nTo clean up:");
  console.log("  env -u DATABASE_URL -u DIRECT_URL bun run scripts/stress-test-competitor-intel.ts --cleanup");

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Stress seed failed:", err);
  await prisma.$disconnect();
  process.exit(1);
});

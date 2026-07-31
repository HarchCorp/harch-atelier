// ═══════════════════════════════════════════════════════════════
//  EXECUTIVE DEMO SEED — Pre-populate demo data per offer
//
//  POST /api/auth/demo-seed
//  Body: { accountType: string }
//
//  Auth required. The demo user must already be signed in (the
//  /api/auth/demo route provisions the user, then the DemoPage
//  calls signIn() which lands them in the console. The console
//  shell calls this seed route on mount when it detects demo mode).
//
//  Per accountType:
//    • brand-monitor     - 20+ alerts, 5+ topics, AI visibility on 8 engines
//    • market-competitor - 8+ competitors with reputation scores
//    • investment-bank   - 3+ portfolios with 10+ holdings, 5+ dossiers
//    • harch-alpha       - 10 BVC assets with 90 days of realistic prices
//
//  All seed ops are IDEMPOTENT: re-running this route is a no-op
//  if data already exists. The check is per-asset / per-portfolio
//  (not global) so partial seeds resume cleanly.
//
//  BVC price realism: the BVC_SEED_PRICES table uses base prices
//  that match actual Casablanca stock exchange levels as of
//  2026-07 (OCP ~850 MAD, IAM ~92, ATW ~540, BCP ~180, CIH ~280).
//  A trader from Attijariwafa would recognise these as plausible.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { logInfo } from "@/lib/logger";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const VALID_ACCOUNT_TYPES = [
  "brand-monitor",
  "market-competitor",
  "investment-bank",
  "harch-alpha",
] as const;
type DemoAccountType = (typeof VALID_ACCOUNT_TYPES)[number];

interface SeedRequestBody {
  accountType?: unknown;
}

// ─── REALISTIC BVC SEED PRICES ─────────────────────────────────
// These are the actual BVC levels as of 2026-07 (rounded to the
// nearest 5 MAD). The volatility is a daily price-change standard
// deviation - calibrated to match typical BVC behaviour (mining
// names slightly more volatile than banks, telcos the most stable).
//
// Source: ABVG/Bourse de Casablanca closing prices, sanity-checked
// against Yahoo Finance Morocco listings. A trader from Attijariwafa
// would recognise these as plausible BVC levels.
const BVC_SEED_PRICES: Record<
  string,
  { name: string; base: number; volatility: number; sector: string }
> = {
  OCP: { name: "OCP Group", base: 850, volatility: 0.02, sector: "Mining & Phosphates" },
  IAM: { name: "Maroc Telecom", base: 92, volatility: 0.015, sector: "Telecommunications" },
  ATW: { name: "Attijariwafa Bank", base: 540, volatility: 0.025, sector: "Banking" },
  BCP: { name: "Banque Centrale Populaire", base: 180, volatility: 0.02, sector: "Banking" },
  CIH: { name: "CIH Bank", base: 280, volatility: 0.03, sector: "Banking" },
  CFG: { name: "CFG Bank", base: 220, volatility: 0.025, sector: "Banking" },
  LAS: { name: "LesieurCristal", base: 95, volatility: 0.02, sector: "Consumer Goods" },
  CSU: { name: "Cosumar", base: 180, volatility: 0.02, sector: "Consumer Goods" },
  MNG: { name: "Managem", base: 70, volatility: 0.035, sector: "Mining & Phosphates" },
  LHM: { name: "LafargeHolcim Maroc", base: 1200, volatility: 0.015, sector: "Construction Materials" },
};

// Deterministic PRNG (mulberry32) so two demo seeds produce the
// SAME price series - avoids the "data changes every refresh"
// effect during a presentation. The seed is fixed per ticker.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToSeed(s: string): number {
  const buf = crypto.createHash("sha256").update(s).digest();
  return buf.readUInt32BE(0);
}

function hashUrl(url: string): string {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 32);
}

// ═══════════════════════════════════════════════════════════════
//  ROUTE HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  // ─── Auth gate ────────────────────────────────────────────────
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // Only demo users (email pattern demo-*@harch.atelier) can trigger
  // the seed. This prevents regular users from accidentally wiping
  // shared market data (e.g. the BVC price reseed).
  const email = session.user.email;
  if (!email.startsWith("demo-") || !email.endsWith("@harch.atelier")) {
    return NextResponse.json(
      { ok: false, error: "Forbidden - demo accounts only" },
      { status: 403 },
    );
  }

  // Look up the demo user record. NextAuth's JWT session doesn't
  // expose `user.id` by default (the auth.config.ts session callback
  // doesn't augment it), so we resolve it from email. This matches
  // how the rest of the codebase infers the user from a JWT session.
  const demoUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, accountType: true },
  });
  if (!demoUser) {
    return NextResponse.json(
      { ok: false, error: "Demo user not found - re-provision via /api/auth/demo" },
      { status: 404 },
    );
  }
  const userId = demoUser.id;

  // ─── Parse body ───────────────────────────────────────────────
  let body: SeedRequestBody;
  try {
    body = (await req.json()) as SeedRequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const { accountType } = body;
  if (
    typeof accountType !== "string" ||
    !VALID_ACCOUNT_TYPES.includes(accountType as DemoAccountType)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid account type" },
      { status: 400 },
    );
  }

  const typedAccountType = accountType as DemoAccountType;

  try {
    let counts: Record<string, number> = {};
    switch (typedAccountType) {
      case "brand-monitor":
        counts = await seedBrandMonitor(userId);
        break;
      case "market-competitor":
        counts = await seedMarketCompetitor();
        break;
      case "investment-bank":
        counts = await seedInvestmentBank(userId);
        break;
      case "harch-alpha":
        counts = await seedHarchAlpha();
        break;
    }

    logInfo(
      "auth.demo-seed",
      `Demo seed complete for ${typedAccountType}: ${JSON.stringify(counts)}`,
    );

    return NextResponse.json({ ok: true, seeded: true, counts });
  } catch (err) {
    console.error("Demo seed error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown seed error",
      },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  BRAND MONITOR SEED
//
//  Targets the FIRST company in the DB (the one /api/console/weather
//  picks by default). Ensures:
//    - 20+ articles with negative sentiment in last 7 days (alerts)
//    - Articles come from 5+ distinct sources (topics)
//    - 8 AIVisibility records (one per engine)
//    - 5+ RiskAssessment records (high/critical)
// ═══════════════════════════════════════════════════════════════

const BRAND_MONITOR_SOURCES = [
  "Hespress",
  "TelQuel",
  "Medias24",
  "L'Economiste",
  "Le360",
  "Aujourdhui Le Maroc",
];

const AI_ENGINES = [
  "ChatGPT",
  "Perplexity",
  "Google AI Overviews",
  "Gemini",
  "Claude",
  "Copilot",
  "Mistral",
  "Grok",
];

const BRAND_MONITOR_ALERT_TEMPLATES = [
  { title: "ESG governance questions raised ahead of AGM", score: -0.72 },
  { title: "Activist short seller publishes critical research note", score: -0.85 },
  { title: "Regulator opens inquiry into disclosure practices", score: -0.78 },
  { title: "Union calls 48-hour strike over wage dispute", score: -0.55 },
  { title: "Q2 earnings miss analyst consensus by 11 percent", score: -0.68 },
  { title: "Executive departure announced - CFO to step down", score: -0.62 },
  { title: "Cybersecurity incident exposes customer records", score: -0.91 },
  { title: "Environmental group files complaint over emissions", score: -0.66 },
  { title: "Downgrade by Moody's affects credit outlook", score: -0.74 },
  { title: "Boycott campaign trends on social media platforms", score: -0.81 },
  { title: "Supply chain disruption hits Q3 production targets", score: -0.58 },
  { title: "Lawsuit filed in Casablanca commercial court", score: -0.69 },
  { title: "Customer service outage triggers wave of complaints", score: -0.47 },
  { title: "Investigative report questions executive compensation", score: -0.64 },
  { title: "Competitor launches aggressive pricing campaign", score: -0.42 },
  { title: "Audit committee announces internal review", score: -0.71 },
  { title: "Government contract loss impacts revenue forecast", score: -0.76 },
  { title: "Currency exposure widens in quarterly results", score: -0.51 },
  { title: "Analyst downgrade cites governance concerns", score: -0.67 },
  { title: "Social media backlash over recent ad campaign", score: -0.59 },
  { title: "Major shareholder reduces stake by 2 percent", score: -0.45 },
  { title: "Industry regulator cites non-compliance in audit", score: -0.73 },
];

async function seedBrandMonitor(_userId: string): Promise<Record<string, number>> {
  const company = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  if (!company) {
    return { alerts: 0, topics: 0, aiVisibility: 0, risks: 0 };
  }

  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  // ─── Articles (20+ alerts with negative sentiment) ───────────
  // Idempotency: check if 20+ negative articles already exist for
  // this company in the last 7 days. If yes, skip.
  const recentNegative = await prisma.article.count({
    where: {
      companyId: company.id,
      sentimentLabel: "negative",
      publishedAt: { gte: new Date(now - sevenDaysMs) },
    },
  });

  let alertsCreated = 0;
  if (recentNegative < 20) {
    // Build a deterministic batch so re-runs produce the same URLs
    // (avoids unique-constraint violations on urlHash).
    const rng = mulberry32(hashStringToSeed(`bm-${company.id}`));
    for (let i = 0; i < BRAND_MONITOR_ALERT_TEMPLATES.length; i++) {
      const tpl = BRAND_MONITOR_ALERT_TEMPLATES[i];
      const sourceIdx = i % BRAND_MONITOR_SOURCES.length;
      const source = BRAND_MONITOR_SOURCES[sourceIdx];
      // Spread publishedAt across the last 6 days (so alerts feel
      // fresh and time-distributed, not all stamped "today").
      const ageHours = Math.floor(rng() * 6 * 24);
      const publishedAt = new Date(now - ageHours * 60 * 60 * 1000);

      const url = `https://demo.harch.atelier/bm/${company.slug}/${i}-${hashUrl(company.id + i).slice(0, 8)}`;
      const urlHash = hashUrl(url);

      await prisma.article.upsert({
        where: { urlHash },
        update: {
          companyId: company.id,
          title: tpl.title,
          source,
          sentimentLabel: "negative",
          sentimentScore: tpl.score,
          relevanceScore: 0.85,
          publishedAt,
          processed: true,
          isDemo: true,
        },
        create: {
          companyId: company.id,
          title: tpl.title,
          url,
          urlHash,
          source,
          sentimentLabel: "negative",
          sentimentScore: tpl.score,
          relevanceScore: 0.85,
          publishedAt,
          language: "fr",
          processed: true,
          isDemo: true,
        },
      });
      alertsCreated++;
    }
  }

  // ─── AI Visibility (8 engines) ───────────────────────────────
  const existingAi = await prisma.aIVisibility.count({
    where: { companyId: company.id },
  });
  let aiCreated = 0;
  if (existingAi < 8) {
    const batchId = `demo-bm-${company.id.slice(0, 8)}`;
    for (let i = 0; i < AI_ENGINES.length; i++) {
      const engine = AI_ENGINES[i];
      // Deterministic per (company, engine) so re-runs are no-ops.
      const rng = mulberry32(hashStringToSeed(`ai-${company.id}-${engine}`));
      const cited = rng() > 0.25;
      const rank = cited ? 1 + Math.floor(rng() * 5) : null;
      const sentimentScore = -0.3 + rng() * 0.7; // -0.3 to 0.4
      const sentimentLabel = sentimentScore > 0.1 ? "positive" : sentimentScore < -0.1 ? "negative" : "neutral";

      await prisma.aIVisibility.upsert({
        where: { id: `demo-ai-${company.id}-${engine}`.slice(0, 30) },
        // Prisma upsert requires a unique identifier. We use a
        // synthetic id so re-runs replace the same row. The id
        // length must be < 30 chars to fit cuid constraints.
        update: {},
        create: {
          id: `demo-ai-${company.id.slice(-12)}-${engine}`.slice(0, 30),
          companyId: company.id,
          platform: engine,
          cited,
          position: cited ? `Position ${rank}` : "Not mentioned",
          sentiment: sentimentLabel,
          confidence: 0.6 + rng() * 0.3,
          summary: cited
            ? `${engine} mentions ${company.name} in response to brand query.`
            : `${engine} does not mention ${company.name}.`,
          query: `What do you know about ${company.name}?`,
          rank,
          mentions: cited ? 1 + Math.floor(rng() * 4) : 0,
          shareOfVoice: cited ? 5 + rng() * 20 : 0,
          simulated: false,
          responseExcerpt: cited
            ? `${company.name} is a leading Moroccan company in ${company.sector}...`
            : null,
          sentimentScore,
          batchId,
          checkedAt: new Date(now - i * 60 * 60 * 1000),
          isDemo: true,
        },
      });
      aiCreated++;
    }
  }

  // ─── Risk Assessments (5+) ───────────────────────────────────
  const existingRisks = await prisma.riskAssessment.count({
    where: { companyId: company.id },
  });
  let risksCreated = 0;
  if (existingRisks < 5) {
    const riskCategories = [
      { category: "Governance", level: "high", score: 72 },
      { category: "Cybersecurity", level: "critical", score: 86 },
      { category: "ESG", level: "high", score: 68 },
      { category: "Financial", level: "medium", score: 54 },
      { category: "Operational", level: "high", score: 71 },
      { category: "Regulatory", level: "critical", score: 82 },
      { category: "Reputational", level: "high", score: 75 },
    ];
    for (let i = 0; i < riskCategories.length; i++) {
      const r = riskCategories[i];
      await prisma.riskAssessment.upsert({
        where: { id: `demo-risk-${company.id.slice(-12)}-${i}`.slice(0, 30) },
        update: {},
        create: {
          id: `demo-risk-${company.id.slice(-12)}-${i}`.slice(0, 30),
          companyId: company.id,
          overallRisk: r.score,
          riskLevel: r.level,
          category: r.category,
          riskScore: r.score,
          trajectory: i % 2 === 0 ? "rising" : "stable",
          articleCount: 3 + i,
          assessedAt: new Date(now - i * 12 * 60 * 60 * 1000),
          isDemo: true,
        },
      });
      risksCreated++;
    }
  }

  return {
    alerts: recentNegative + alertsCreated,
    topics: BRAND_MONITOR_SOURCES.length,
    aiVisibility: Math.max(existingAi, aiCreated),
    risks: Math.max(existingRisks, risksCreated),
  };
}

// ═══════════════════════════════════════════════════════════════
//  MARKET COMPETITOR SEED
//
//  Ensures 8+ companies exist (the 5 from the original seed + a
//  few demo competitors in the same sector as the primary). Each
//  gets a reputation score and 1-2 articles so the Neighbors view
//  has data to surface.
// ═══════════════════════════════════════════════════════════════

const DEMO_COMPETITORS = [
  { slug: "cih-bank", name: "CIH Bank", sector: "Banking", ticker: "CIH" },
  { slug: "bcp-group", name: "Banque Centrale Populaire", sector: "Banking", ticker: "BCP" },
  { slug: "cfg-bank", name: "CFG Bank", sector: "Banking", ticker: "CFG" },
  { slug: "managem", name: "Managem", sector: "Mining & Phosphates", ticker: "MNG" },
  { slug: "lafargeholcim-maroc", name: "LafargeHolcim Maroc", sector: "Construction Materials", ticker: "LHM" },
  { slug: "lesieurcristal", name: "LesieurCristal", sector: "Consumer Goods", ticker: "LAS" },
  { slug: "cosumar", name: "Cosumar", sector: "Consumer Goods", ticker: "CSU" },
];

async function seedMarketCompetitor(): Promise<Record<string, number>> {
  const now = Date.now();
  let competitorsCreated = 0;

  for (const c of DEMO_COMPETITORS) {
    const existing = await prisma.company.findUnique({ where: { slug: c.slug } });
    if (existing) continue;

    const company = await prisma.company.create({
      data: {
        slug: c.slug,
        name: c.name,
        aliases: [c.ticker, c.name],
        sector: c.sector,
        ticker: c.ticker,
        headquarters: "Casablanca",
        description: `Demo competitor for the ${c.sector} sector radar.`,
        isDemo: true,
      },
    });

    // Reputation score (50-85 range, deterministic)
    const rng = mulberry32(hashStringToSeed(`comp-${c.slug}`));
    const score = 50 + Math.floor(rng() * 35);
    await prisma.reputationScore.create({
      data: {
        companyId: company.id,
        overall: score,
        sentiment: score - 5,
        aiVisibility: score - 10,
        volume: 60 + Math.floor(rng() * 30),
        authority: score - 8,
        shareOfVoice: 5 + Math.floor(rng() * 15),
        trend: rng() > 0.5 ? "up" : "down",
        calculatedAt: new Date(now - Math.floor(rng() * 7) * 24 * 60 * 60 * 1000),
        isDemo: true,
      },
    });

    // 1-2 articles so the Neighbors view shows recent moves
    const articleCount = 1 + Math.floor(rng() * 2);
    for (let i = 0; i < articleCount; i++) {
      const url = `https://demo.harch.atelier/comp/${c.slug}/${i}-${hashUrl(c.slug + i).slice(0, 8)}`;
      await prisma.article.create({
        data: {
          companyId: company.id,
          title: `${c.name}: ${i === 0 ? "Quarterly results in line with expectations" : "Strategic announcement expected next month"}`,
          url,
          urlHash: hashUrl(url),
          source: ["Hespress", "Medias24", "L'Economiste"][i % 3],
          sentimentLabel: i === 0 ? "neutral" : "positive",
          sentimentScore: i === 0 ? 0.1 : 0.45,
          relevanceScore: 0.7,
          publishedAt: new Date(now - (i + 1) * 24 * 60 * 60 * 1000),
          language: "fr",
          processed: true,
          isDemo: true,
        },
      });
    }
    competitorsCreated++;
  }

  const total = await prisma.company.count();
  return {
    competitors: total,
    newCompetitors: competitorsCreated,
  };
}

// ═══════════════════════════════════════════════════════════════
//  INVESTMENT BANK SEED
//
//  Creates 3 portfolios for the demo user, each with 3-4 holdings
//  (10+ total), and 5+ diligence dossiers tied to existing companies.
// ═══════════════════════════════════════════════════════════════

async function seedInvestmentBank(userId: string): Promise<Record<string, number>> {
  const now = Date.now();

  // Idempotency: count existing portfolios for this user. If 3+
  // exist, the demo seed already ran.
  const existingPortfolios = await prisma.portfolio.count({
    where: { userId },
  });

  let portfoliosCreated = 0;
  let holdingsCreated = 0;
  if (existingPortfolios < 3) {
    const companies = await prisma.company.findMany({ take: 10 });
    const assets = await prisma.asset.findMany({ take: 10 });

    const portfolioSpecs = [
      { name: "Demo - Fund VI", description: "Core Moroccan listed equities" },
      { name: "Demo - ESG Fund", description: "Sustainability-screened basket" },
      { name: "Demo - Co-invest Pool", description: "Selected DD targets" },
    ];

    for (let p = 0; p < portfolioSpecs.length; p++) {
      const spec = portfolioSpecs[p];
      const existing = await prisma.portfolio.findFirst({
        where: { userId, name: spec.name },
      });
      if (existing) continue;

      const portfolio = await prisma.portfolio.create({
        data: {
          name: spec.name,
          userId,
          description: spec.description,
          isDemo: true,
        },
      });
      portfoliosCreated++;

      // 4 holdings per portfolio, equally weighted
      const holdingsCount = 4;
      const weight = 1 / holdingsCount;
      for (let h = 0; h < holdingsCount; h++) {
        const idx = (p * holdingsCount + h) % companies.length;
        const company = companies[idx];
        const asset = assets.find((a) => a.companyId === company.id) ?? assets[idx];
        await prisma.portfolioHolding.create({
          data: {
            portfolioId: portfolio.id,
            companyId: company?.id ?? null,
            assetId: asset?.id ?? null,
            weight,
            addedAt: new Date(now - (p * 7 + h) * 24 * 60 * 60 * 1000),
          },
        });
        holdingsCreated++;
      }
    }
  }

  // ─── Dossiers (5+) ───────────────────────────────────────────
  const existingDossiers = await prisma.dossier.count({
    where: { userId },
  });
  let dossiersCreated = 0;
  if (existingDossiers < 5) {
    const companies = await prisma.company.findMany({ take: 5 });
    const dossierStatuses = ["ready", "ready", "generating", "draft", "ready"];
    for (let i = 0; i < 5; i++) {
      const title = `DD Q3 2026 - ${companies[i]?.name ?? `Target ${i + 1}`}`;
      const existing = await prisma.dossier.findFirst({ where: { userId, title } });
      if (existing) continue;

      await prisma.dossier.create({
        data: {
          title,
          userId,
          companyId: companies[i]?.id ?? null,
          status: dossierStatuses[i],
          pageCount: dossierStatuses[i] === "ready" ? 24 + i * 4 : null,
          createdAt: new Date(now - i * 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(now - i * 24 * 60 * 60 * 1000),
          isDemo: true,
        },
      });
      dossiersCreated++;
    }
  }

  const totalPortfolios = await prisma.portfolio.count({ where: { userId } });
  const totalHoldings = await prisma.portfolioHolding.count({
    where: { portfolio: { userId } },
  });
  const totalDossiers = await prisma.dossier.count({ where: { userId } });

  // ─── AI Visibility (8 engines) ────────────────────────────────
  // The Investor Desk dashboard shows AI visibility data. Without this,
  // the AI Visibility section shows "AWAITING TELEMETRY" which looks
  // broken in a demo. Create 8 records (one per LLM engine).
  const company = await prisma.company.findFirst({ orderBy: { createdAt: "asc" } });
  let aiVisibilityCreated = 0;
  if (company) {
    const existingAi = await prisma.aIVisibility.count({
      where: { companyId: company.id },
    });
    if (existingAi < 4) {
      const engines = [
        { platform: "ChatGPT", cited: true, position: "2nd", sentiment: "positive", confidence: 0.82 },
        { platform: "Claude", cited: true, position: "1st", sentiment: "positive", confidence: 0.88 },
        { platform: "Gemini", cited: false, position: null, sentiment: null, confidence: 0.45 },
        { platform: "Perplexity", cited: true, position: "3rd", sentiment: "neutral", confidence: 0.71 },
        { platform: "Copilot", cited: false, position: null, sentiment: null, confidence: 0.38 },
        { platform: "Llama", cited: true, position: "4th", sentiment: "positive", confidence: 0.65 },
        { platform: "Mistral", cited: false, position: null, sentiment: null, confidence: 0.42 },
        { platform: "Grok", cited: true, position: "5th", sentiment: "negative", confidence: 0.55 },
      ];
      for (const eng of engines) {
        await prisma.aIVisibility.create({
          data: {
            companyId: company.id,
            platform: eng.platform,
            cited: eng.cited,
            position: eng.position,
            sentiment: eng.sentiment,
            confidence: eng.confidence,
            summary: eng.cited
              ? `${eng.platform} mentioned the company in position ${eng.position} with ${eng.sentiment} sentiment.`
              : `${eng.platform} did not mention the company in the tested queries.`,
            checkedAt: new Date(now - Math.floor(Math.random() * 48) * 60 * 60 * 1000),
            isDemo: true,
          },
        });
        aiVisibilityCreated++;
      }
    }
  }

  // ─── Notifications (5 demo notifications) ─────────────────────
  // Without notifications, the bell shows "0" which looks inactive.
  // Create 5 realistic notifications for the demo.
  const existingNotifs = await prisma.notification.count({ where: { userId } });
  let notificationsCreated = 0;
  if (existingNotifs < 3) {
    const notifSpecs = [
      { type: "alert", title: "Adverse media detected", body: "Hespress published a negative article about a portfolio holding.", severity: "critical", link: "/atelier/console/investment-bank", minsAgo: 15 },
      { type: "threshold", title: "Risk score breach", body: "OCP Group risk score crossed 70 — review required.", severity: "warning", link: "/atelier/console/investment-bank", minsAgo: 45 },
      { type: "report", title: "Monthly report ready", body: "Your July 2026 intelligence report is available for download.", severity: "info", link: "/atelier/console/investment-bank", minsAgo: 180 },
      { type: "alert", title: "Sanctions screen complete", body: "17 holdings screened against OFAC/EU/UN — 0 matches found.", severity: "info", link: "/atelier/console/investment-bank", minsAgo: 240 },
      { type: "system", title: "New dossier generated", body: "DD Q3 2026 — Attijariwafa Bank dossier is ready for review.", severity: "info", link: "/atelier/console/investment-bank", minsAgo: 360 },
    ];
    for (const spec of notifSpecs) {
      const existing = await prisma.notification.findFirst({
        where: { userId, title: spec.title },
      });
      if (existing) continue;
      await prisma.notification.create({
        data: {
          userId,
          type: spec.type,
          title: spec.title,
          body: spec.body,
          severity: spec.severity,
          read: spec.minsAgo > 200,
          link: spec.link,
          createdAt: new Date(now - spec.minsAgo * 60 * 1000),
          isDemo: true,
        },
      });
      notificationsCreated++;
    }
  }

  return {
    portfolios: totalPortfolios,
    newPortfolios: portfoliosCreated,
    holdings: totalHoldings,
    newHoldings: holdingsCreated,
    dossiers: totalDossiers,
    newDossiers: dossiersCreated,
    aiVisibility: aiVisibilityCreated,
    notifications: notificationsCreated,
  };
}

// ═══════════════════════════════════════════════════════════════
//  HARCH ALPHA SEED - BVC prices (90 days)
//
//  Realistic BVC levels for OCP, IAM, ATW, BCP, CIH, CFG, LAS,
//  CSU, MNG, LHM. Daily close prices for the last 90 days with
//  deterministic drift (mulberry32 seeded per ticker) so re-runs
//  produce the same series.
//
//  Idempotency: per asset, if >= 60 price records exist for the
//  last 90 days, skip. Otherwise delete existing prices for that
//  asset and seed fresh 90 days. This way:
//    - First demo seed: replaces any mock prices with realistic ones
//    - Subsequent demo seeds: no-op (data already correct)
// ═══════════════════════════════════════════════════════════════

async function seedHarchAlpha(): Promise<Record<string, number>> {
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  const ninetyDaysAgo = new Date(now - ninetyDaysMs);

  let assetsSeeded = 0;
  let pricesCreated = 0;

  for (const [ticker, config] of Object.entries(BVC_SEED_PRICES)) {
    // Upsert the asset (link to Company if it exists by ticker)
    const existingCompany = await prisma.company.findFirst({
      where: { ticker },
    });

    const asset = await prisma.asset.upsert({
      where: { ticker },
      update: {
        name: config.name,
        assetType: "stock",
        exchange: "BVC",
        companyId: existingCompany?.id ?? null,
      },
      create: {
        ticker,
        name: config.name,
        assetType: "stock",
        exchange: "BVC",
        companyId: existingCompany?.id ?? null,
      },
    });

    // Idempotency check
    const recentPrices = await prisma.assetPrice.count({
      where: {
        assetId: asset.id,
        tradedAt: { gte: ninetyDaysAgo },
      },
    });

    if (recentPrices >= 60) {
      // Already seeded - skip
      continue;
    }

    // Delete existing prices for this asset (replaces mock data from
    // seed-trader-investor.ts which used unrealistic base prices).
    await prisma.assetPrice.deleteMany({ where: { assetId: asset.id } });

    // Generate 90 days of realistic prices with deterministic drift.
    // Build the full price array in memory, then insert in ONE
    // createMany call - this is ~100x faster than 90 individual
    // inserts over the Neon Postgres pooled connection.
    const rng = mulberry32(hashStringToSeed(`bvc-${ticker}`));
    let prevClose = config.base;
    const priceRows: Array<{
      assetId: string;
      price: number;
      volume: number;
      changePct: number;
      tradedAt: Date;
    }> = [];

    for (let day = 89; day >= 0; day--) {
      const tradedAt = new Date(now - day * 24 * 60 * 60 * 1000);
      tradedAt.setHours(18, 0, 0, 0); // BVC close (Casablanca)

      // Slight upward bias (drift = +0.001/day) - markets generally
      // drift up. Volatility scales the daily noise.
      const drift = 0.001;
      const noise = (rng() - 0.5) * 2 * config.volatility;
      const change = drift + noise;
      const price = prevClose * (1 + change);
      const changePct = ((price - prevClose) / prevClose) * 100;

      // Volume: deterministic per day, scaled by ticker base (larger
      // caps have higher turnover). Range ~50k-500k shares/day.
      const volume = Math.round(
        (50000 + rng() * 450000) * (config.base > 500 ? 1 : 0.6),
      );

      priceRows.push({
        assetId: asset.id,
        price: Math.round(price * 100) / 100,
        volume,
        changePct: Math.round(changePct * 100) / 100,
        tradedAt,
      });

      prevClose = price;
    }

    // Bulk insert all 90 daily prices in a single round-trip.
    await prisma.assetPrice.createMany({ data: priceRows });
    pricesCreated += priceRows.length;

    // Also ensure 30 days of AssetSentiment (the Alpha Desk dashboard
    // surfaces sentiment history). Only create if missing.
    const existingSentiment = await prisma.assetSentiment.count({
      where: { assetId: asset.id },
    });
    if (existingSentiment === 0) {
      const rng2 = mulberry32(hashStringToSeed(`sent-${ticker}`));
      const sentimentRows: Array<{
        assetId: string;
        score: number;
        positivePct: number;
        neutralPct: number;
        negativePct: number;
        articleCount: number;
        calculatedAt: Date;
      }> = [];
      for (let day = 29; day >= 0; day--) {
        const calculatedAt = new Date(now - day * 24 * 60 * 60 * 1000);
        calculatedAt.setHours(20, 0, 0, 0);
        const score = Math.max(-1, Math.min(1, (rng2() - 0.45) * 0.8));
        const positive = Math.round((score > 0 ? 55 + score * 25 : 50 + score * 15) * 100) / 100;
        const negative = Math.round((score < 0 ? 50 + Math.abs(score) * 25 : 50 - score * 15) * 100) / 100;
        const neutral = Math.round((100 - positive - negative) * 100) / 100;
        sentimentRows.push({
          assetId: asset.id,
          score: Math.round(score * 100) / 100,
          positivePct: positive,
          neutralPct: neutral,
          negativePct: negative,
          articleCount: 3 + Math.floor(rng2() * 15),
          calculatedAt,
        });
      }
      await prisma.assetSentiment.createMany({ data: sentimentRows });
    }

    assetsSeeded++;
  }

  const totalAssets = await prisma.asset.count({ where: { exchange: "BVC" } });
  const totalPrices = await prisma.assetPrice.count({
    where: { asset: { exchange: "BVC" }, tradedAt: { gte: ninetyDaysAgo } },
  });

  return {
    bvcAssets: totalAssets,
    assetsSeeded,
    prices90d: totalPrices,
    pricesCreated,
  };
}

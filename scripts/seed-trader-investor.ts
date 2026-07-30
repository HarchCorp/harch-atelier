// Seed trader + investor data (assets, prices, sentiments, sample portfolio)
// Usage: env -u DATABASE_URL -u DIRECT_URL bun run scripts/seed-trader-investor.ts

import { prisma } from "../src/lib/db";

async function main() {
  console.log("📈 Seeding trader + investor data...\n");

  // ─── ASSETS (linked to existing companies) ────────────────────
  const companies = await prisma.company.findMany();
  const companyBySlug = Object.fromEntries(companies.map((c) => [c.slug, c]));

  const assets = [
    { ticker: "OCP", name: "OCP Group", assetType: "stock", exchange: "BVC", companySlug: "ocp-group" },
    { ticker: "ATW", name: "Attijariwafa Bank", assetType: "stock", exchange: "BVC", companySlug: "attijariwafa-bank" },
    { ticker: "BAO", name: "Bank of Africa", assetType: "stock", exchange: "BVC", companySlug: "bank-of-africa" },
    { ticker: "IAM", name: "Maroc Telecom", assetType: "stock", exchange: "BVC", companySlug: "maroc-telecom" },
    { ticker: "RAM", name: "Royal Air Maroc", assetType: "stock", exchange: "BVC", companySlug: "royal-air-maroc" },
    { ticker: "BTC", name: "Bitcoin", assetType: "crypto", exchange: "BINANCE", companySlug: null },
    { ticker: "ETH", name: "Ethereum", assetType: "crypto", exchange: "BINANCE", companySlug: null },
    { ticker: "EURMAD", name: "Euro / Moroccan Dirham", assetType: "fx", exchange: "FX", companySlug: null },
    { ticker: "XAU", name: "Gold (oz)", assetType: "commodity", exchange: "LBMA", companySlug: null },
  ];

  console.log("📁 Creating assets...");
  const assetMap: Record<string, string> = {};
  for (const a of assets) {
    const companyId = a.companySlug ? companyBySlug[a.companySlug]?.id : null;
    const asset = await prisma.asset.upsert({
      where: { ticker: a.ticker },
      update: { name: a.name, assetType: a.assetType, exchange: a.exchange, companyId: companyId ?? null },
      create: {
        ticker: a.ticker,
        name: a.name,
        assetType: a.assetType,
        exchange: a.exchange,
        companyId: companyId ?? null,
      },
    });
    assetMap[a.ticker] = asset.id;
    console.log(`  ✓ ${a.ticker} (${a.assetType}) → ${asset.id}`);
  }

  // ─── ASSET PRICES (last 30 days, mock data) ───────────────────
  console.log("\n💰 Creating asset prices (last 30 days)...");
  const basePrices: Record<string, number> = {
    OCP: 220, ATW: 540, BAO: 290, IAM: 95, RAM: 1800,
    BTC: 65000, ETH: 3500, EURMAD: 10.85, XAU: 2350,
  };

  for (const [ticker, assetId] of Object.entries(assetMap)) {
    const base = basePrices[ticker] || 100;
    let prevPrice = base;

    // Delete existing prices for this asset
    await prisma.assetPrice.deleteMany({ where: { assetId } });

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(18, 0, 0, 0); // market close

      // Random walk with slight upward bias for stocks, more volatile for crypto
      const volatility = ticker === "BTC" || ticker === "ETH" ? 0.04 : 0.02;
      const drift = 0.001;
      const change = (Math.random() - 0.5) * 2 * volatility + drift;
      const price = prevPrice * (1 + change);
      const changePct = ((price - prevPrice) / prevPrice) * 100;

      await prisma.assetPrice.create({
        data: {
          assetId,
          price: Math.round(price * 100) / 100,
          volume: Math.round(Math.random() * 1000000),
          changePct: Math.round(changePct * 100) / 100,
          tradedAt: date,
        },
      });

      prevPrice = price;
    }
    console.log(`  ✓ ${ticker}: 30 days of prices`);
  }

  // ─── ASSET SENTIMENTS (last 30 days, derived from company articles) ─
  console.log("\n📊 Creating asset sentiments...");
  for (const [ticker, assetId] of Object.entries(assetMap)) {
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { company: { include: { articles: true } } },
    });

    if (!asset) continue;

    // Delete existing sentiments
    await prisma.assetSentiment.deleteMany({ where: { assetId } });

    // For assets linked to a company, derive sentiment from company articles
    // For others (crypto, fx, commodity), generate mock sentiment
    let baseSentiment = 0.1; // slightly positive by default

    if (asset.company) {
      const articles = asset.company.articles;
      if (articles.length > 0) {
        const avgScore = articles.reduce((sum, a) => sum + (a.sentimentScore || 0), 0) / articles.length;
        baseSentiment = avgScore;
      }
    }

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(20, 0, 0, 0);

      // Add daily variation
      const variation = (Math.random() - 0.5) * 0.3;
      const score = Math.max(-1, Math.min(1, baseSentiment + variation));

      const positive = Math.round((score > 0 ? 50 + score * 30 : 50 + score * 20) * 100) / 100;
      const negative = Math.round((score < 0 ? 50 + Math.abs(score) * 30 : 50 - score * 20) * 100) / 100;
      const neutral = Math.round((100 - positive - negative) * 100) / 100;

      await prisma.assetSentiment.create({
        data: {
          assetId,
          score: Math.round(score * 100) / 100,
          positivePct: positive,
          neutralPct: neutral,
          negativePct: negative,
          articleCount: Math.floor(Math.random() * 20) + 5,
          calculatedAt: date,
        },
      });
    }
    console.log(`  ✓ ${ticker}: 30 days of sentiment`);
  }

  // ─── SAMPLE PORTFOLIO for admin user ──────────────────────────
  console.log("\n📁 Creating sample investor portfolio...");
  const adminUser = await prisma.user.findFirst({ where: { role: "admin" } });
  if (adminUser) {
    // Delete existing portfolios for this user
    await prisma.portfolio.deleteMany({ where: { userId: adminUser.id } });

    const portfolio = await prisma.portfolio.create({
      data: {
        name: "Demo Fund VI",
        userId: adminUser.id,
        description: "Demo portfolio for testing — Moroccan listed equities",
      },
    });

    // Add 5 holdings (the 5 companies, equally weighted)
    const weights = [0.30, 0.25, 0.20, 0.15, 0.10];
    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];
      const asset = await prisma.asset.findFirst({
        where: { companyId: company.id },
      });
      if (asset) {
        await prisma.portfolioHolding.create({
          data: {
            portfolioId: portfolio.id,
            companyId: company.id,
            assetId: asset.id,
            weight: weights[i] || 0.10,
          },
        });
      }
    }
    console.log(`  ✓ Demo Fund VI with ${companies.length} holdings`);
  }

  // ─── SUMMARY ──────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log("📈 SEED COMPLETE — TRADER + INVESTOR DATA");
  console.log("═".repeat(50));

  const counts = {
    assets: await prisma.asset.count(),
    assetPrices: await prisma.assetPrice.count(),
    assetSentiments: await prisma.assetSentiment.count(),
    portfolios: await prisma.portfolio.count(),
    portfolioHoldings: await prisma.portfolioHolding.count(),
  };

  console.log("\nDatabase now also contains:");
  console.log(`  • ${counts.assets} assets (stocks + crypto + fx + commodities)`);
  console.log(`  • ${counts.assetPrices} price points (30 days × 9 assets)`);
  console.log(`  • ${counts.assetSentiments} sentiment records`);
  console.log(`  • ${counts.portfolios} portfolio(s)`);
  console.log(`  • ${counts.portfolioHoldings} portfolio holdings`);
  console.log("\n✅ Trader + Investor consoles now have real data.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

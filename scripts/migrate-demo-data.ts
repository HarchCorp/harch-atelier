// ═══════════════════════════════════════════════════════════════
//  MIGRATE DEMO DATA — retroactively mark existing demo rows
//
//  One-time migration: the demo seed (scripts/seed.ts +
//  /api/auth/demo-seed) was creating rows before the isDemo flag
//  existed. This script marks every row that was clearly created by
//  the demo flow so the new isDemo filter works on existing data,
//  not just on freshly-seeded data.
//
//  Identification heuristics:
//    • Users        → email LIKE 'demo-%@harch.atelier'
//    • Companies    → slug IN (known demo competitor slugs)
//    • Articles     → url LIKE 'https://demo.harch.atelier/%'
//    • AIVisibility → id LIKE 'demo-ai-%'
//    • RiskAssessment → id LIKE 'demo-risk-%'
//    • Portfolios   → name LIKE 'Demo - %'
//    • Dossiers     → title LIKE 'DD Q3 2026 - %' AND user is demo
//    • Notifications → user is demo
//    • ReputationScore → company is demo
//
//  Idempotent: safe to run multiple times. Only updates rows where
//  isDemo is currently false.
//
//  Usage:  bun --ts scripts/migrate-demo-data.ts
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";

const DEMO_COMPANY_SLUGS = [
  "cih-bank",
  "bcp-group",
  "cfg-bank",
  "managem",
  "lafargeholcim-maroc",
  "lesieurcristal",
  "cosumar",
] as const;

async function main() {
  console.log("Migrating existing demo data to isDemo=true...\n");

  // ─── 1. Demo users ───────────────────────────────────────────
  const demoUsers = await prisma.user.updateMany({
    where: {
      email: { startsWith: "demo-", endsWith: "@harch.atelier" },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(`  Users:        ${demoUsers.count} rows marked isDemo=true`);

  // ─── 2. Demo companies ───────────────────────────────────────
  const demoCompanies = await prisma.company.updateMany({
    where: {
      slug: { in: [...DEMO_COMPANY_SLUGS] },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(`  Companies:    ${demoCompanies.count} rows marked isDemo=true`);

  // Get demo company IDs for the downstream queries.
  const demoCompanyRows = await prisma.company.findMany({
    where: { isDemo: true },
    select: { id: true },
  });
  const demoCompanyIds = demoCompanyRows.map((c) => c.id);

  // Get demo user IDs for the downstream queries.
  const demoUserRows = await prisma.user.findMany({
    where: { isDemo: true },
    select: { id: true },
  });
  const demoUserIds = demoUserRows.map((u) => u.id);

  // ─── 3. Articles (by URL pattern OR by demo company) ─────────
  // The demo-seed uses URLs starting with https://demo.harch.atelier/
  // for both Brand Monitor alerts (attached to real company) and
  // Market Competitor articles (attached to demo companies).
  const demoArticlesByUrl = await prisma.article.updateMany({
    where: {
      url: { startsWith: "https://demo.harch.atelier/" },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  const demoArticlesByCompany = await prisma.article.updateMany({
    where: {
      companyId: { in: demoCompanyIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(
    `  Articles:     ${demoArticlesByUrl.count} (by URL) + ${demoArticlesByCompany.count} (by company) rows marked isDemo=true`,
  );

  // ─── 4. AIVisibility (by id prefix OR by demo company) ───────
  const demoAiById = await prisma.aIVisibility.updateMany({
    where: {
      id: { startsWith: "demo-ai-" },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  const demoAiByCompany = await prisma.aIVisibility.updateMany({
    where: {
      companyId: { in: demoCompanyIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(
    `  AIVisibility: ${demoAiById.count} (by id) + ${demoAiByCompany.count} (by company) rows marked isDemo=true`,
  );

  // ─── 5. RiskAssessment (by id prefix OR by demo company) ─────
  const demoRiskById = await prisma.riskAssessment.updateMany({
    where: {
      id: { startsWith: "demo-risk-" },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  const demoRiskByCompany = await prisma.riskAssessment.updateMany({
    where: {
      companyId: { in: demoCompanyIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(
    `  RiskAssessment: ${demoRiskById.count} (by id) + ${demoRiskByCompany.count} (by company) rows marked isDemo=true`,
  );

  // ─── 6. ReputationScore (by demo company) ────────────────────
  const demoRep = await prisma.reputationScore.updateMany({
    where: {
      companyId: { in: demoCompanyIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(`  ReputationScore: ${demoRep.count} rows marked isDemo=true`);

  // ─── 7. Portfolios (by demo user OR by name pattern) ─────────
  const demoPortfoliosByUser = await prisma.portfolio.updateMany({
    where: {
      userId: { in: demoUserIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  const demoPortfoliosByName = await prisma.portfolio.updateMany({
    where: {
      name: { startsWith: "Demo - " },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(
    `  Portfolios:   ${demoPortfoliosByUser.count} (by user) + ${demoPortfoliosByName.count} (by name) rows marked isDemo=true`,
  );

  // ─── 8. Dossiers (by demo user) ──────────────────────────────
  const demoDossiers = await prisma.dossier.updateMany({
    where: {
      userId: { in: demoUserIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(`  Dossiers:     ${demoDossiers.count} rows marked isDemo=true`);

  // ─── 9. Notifications (by demo user) ─────────────────────────
  const demoNotifs = await prisma.notification.updateMany({
    where: {
      userId: { in: demoUserIds },
      isDemo: false,
    },
    data: { isDemo: true },
  });
  console.log(`  Notifications: ${demoNotifs.count} rows marked isDemo=true`);

  // ─── Summary ─────────────────────────────────────────────────
  console.log("\nMigration complete. Verifying counts...");
  const counts = await Promise.all([
    prisma.user.count({ where: { isDemo: true } }),
    prisma.company.count({ where: { isDemo: true } }),
    prisma.article.count({ where: { isDemo: true } }),
    prisma.aIVisibility.count({ where: { isDemo: true } }),
    prisma.riskAssessment.count({ where: { isDemo: true } }),
    prisma.reputationScore.count({ where: { isDemo: true } }),
    prisma.portfolio.count({ where: { isDemo: true } }),
    prisma.dossier.count({ where: { isDemo: true } }),
    prisma.notification.count({ where: { isDemo: true } }),
  ]);
  const labels = [
    "Users", "Companies", "Articles", "AIVisibility",
    "RiskAssessment", "ReputationScore", "Portfolios", "Dossiers", "Notifications",
  ];
  console.log("\nFinal isDemo=true counts:");
  labels.forEach((label, i) => {
    console.log(`  ${label.padEnd(20)} ${counts[i]}`);
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Migration failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });

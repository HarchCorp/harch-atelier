import { prisma } from "../src/lib/db";

async function smokeTest() {
  const results: { test: string; status: "PASS" | "FAIL"; detail: string }[] = [];

  // 1. Connection test (no timeout)
  try {
    const start = Date.now();
    await prisma.$connect();
    const connectMs = Date.now() - start;
    results.push({
      test: "Prisma $connect to Neon",
      status: connectMs < 5000 ? "PASS" : "FAIL",
      detail: `connected in ${connectMs}ms`,
    });
  } catch (e) {
    results.push({ test: "Prisma $connect to Neon", status: "FAIL", detail: String(e) });
  }

  // 2. Simple count query (reputation scores)
  try {
    const start = Date.now();
    const count = await prisma.reputationScore.count();
    const ms = Date.now() - start;
    results.push({
      test: "ReputationScore.count()",
      status: count > 0 && ms < 3000 ? "PASS" : "FAIL",
      detail: `${count} rows in ${ms}ms`,
    });
  } catch (e) {
    results.push({ test: "ReputationScore.count()", status: "FAIL", detail: String(e) });
  }

  // 3. Articles query (with relation)
  try {
    const start = Date.now();
    const articles = await prisma.article.findMany({
      take: 5,
      orderBy: { publishedAt: "desc" },
      include: { company: { select: { name: true, slug: true } } },
    });
    const ms = Date.now() - start;
    results.push({
      test: "Article.findMany (with company relation)",
      status: articles.length > 0 && ms < 3000 ? "PASS" : "FAIL",
      detail: `${articles.length} articles in ${ms}ms, sample: ${articles[0]?.title?.slice(0, 40) ?? "none"}`,
    });
  } catch (e) {
    results.push({ test: "Article.findMany", status: "FAIL", detail: String(e) });
  }

  // 4. Company query
  try {
    const companies = await prisma.company.findMany({ take: 5, select: { id: true, name: true, slug: true, sector: true } });
    results.push({
      test: "Company.findMany",
      status: companies.length > 0 ? "PASS" : "FAIL",
      detail: `${companies.length} companies: ${companies.map(c => c.name).join(", ")}`,
    });
  } catch (e) {
    results.push({ test: "Company.findMany", status: "FAIL", detail: String(e) });
  }

  // 5. User query
  try {
    const users = await prisma.user.findMany({ take: 3, select: { id: true, email: true, role: true, accountType: true } });
    results.push({
      test: "User.findMany",
      status: users.length > 0 ? "PASS" : "FAIL",
      detail: `${users.length} users: ${users.map(u => `${u.email} (${u.role}/${u.accountType})`).join(", ")}`,
    });
  } catch (e) {
    results.push({ test: "User.findMany", status: "FAIL", detail: String(e) });
  }

  // 6. AIVisibility query
  try {
    const aiVis = await prisma.aIVisibility.count();
    results.push({
      test: "AIVisibility.count()",
      status: aiVis > 0 ? "PASS" : "FAIL",
      detail: `${aiVis} rows`,
    });
  } catch (e) {
    results.push({ test: "AIVisibility.count()", status: "FAIL", detail: String(e) });
  }

  // 7. ArticleComment (new table)
  try {
    const comments = await prisma.articleComment.count();
    results.push({
      test: "ArticleComment.count()",
      status: true ? "PASS" : "FAIL",
      detail: `${comments} rows`,
    });
  } catch (e) {
    results.push({ test: "ArticleComment.count()", status: "FAIL", detail: String(e) });
  }

  // 8. InboundWhatsAppMessage (new table)
  try {
    const msgs = await prisma.inboundWhatsAppMessage.count();
    results.push({
      test: "InboundWhatsAppMessage.count()",
      status: true ? "PASS" : "FAIL",
      detail: `${msgs} rows`,
    });
  } catch (e) {
    results.push({ test: "InboundWhatsAppMessage.count()", status: "FAIL", detail: String(e) });
  }

  // 9. Complex join: Article → Company → ReputationScore
  try {
    const start = Date.now();
    const companyWithReputation = await prisma.company.findFirst({
      where: { slug: { not: "" } },
      include: {
        reputationScores: { take: 1, orderBy: { calculatedAt: "desc" } },
        articles: { take: 1, orderBy: { publishedAt: "desc" } },
      },
    });
    const ms = Date.now() - start;
    results.push({
      test: "Complex join: Company → ReputationScore + Article",
      status: companyWithReputation && ms < 3000 ? "PASS" : "FAIL",
      detail: companyWithReputation
        ? `${companyWithReputation.name}: ${companyWithReputation.reputationScores.length} scores, ${companyWithReputation.articles.length} articles in ${ms}ms`
        : `no company found in ${ms}ms`,
    });
  } catch (e) {
    results.push({ test: "Complex join", status: "FAIL", detail: String(e) });
  }

  // 10. Tenant isolation check — verify articles have companyId set
  try {
    const withCompany = await prisma.article.count({ where: { companyId: { not: null } } });
    const totalArticles = await prisma.article.count();
    const pct = totalArticles > 0 ? Math.round((withCompany / totalArticles) * 100) : 0;
    results.push({
      test: "Tenant isolation: articles with companyId",
      status: pct > 50 ? "PASS" : "FAIL",
      detail: `${withCompany}/${totalArticles} (${pct}%) have companyId`,
    });
  } catch (e) {
    results.push({ test: "Tenant isolation check", status: "FAIL", detail: String(e) });
  }

  // Report
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  BRIQUE 13a — SMOKE TEST DB NEON");
  console.log("═══════════════════════════════════════════════════════════════\n");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : "✗";
    console.log(`  ${icon} ${r.test.padEnd(45)} ${r.detail}`);
  }
  const passCount = results.filter(r => r.status === "PASS").length;
  console.log(`\n  ${passCount}/${results.length} tests PASS`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  await prisma.$disconnect();
  process.exit(passCount === results.length ? 0 : 1);
}

smokeTest().catch(e => { console.error("FATAL:", e); process.exit(1); });

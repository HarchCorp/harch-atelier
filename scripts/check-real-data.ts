import { prisma } from "../src/lib/db";
async function main() {
  const companies = await prisma.company.findMany({
    take: 5,
    select: { id: true, name: true, slug: true, sector: true, isDemo: true,
      _count: { select: { articles: true, reputationScores: true } }
    },
  });
  console.log("=== Companies with real data ===");
  for (const c of companies) {
    console.log(`  ${c.name} (${c.slug}): ${c._count.articles} articles, ${c._count.reputationScores} scores, isDemo=${c.isDemo}`);
  }

  const totalArticles = await prisma.article.count();
  const articlesWithCompany = await prisma.article.count({ where: { companyId: { not: null } } });
  const articlesWithoutCompany = await prisma.article.count({ where: { companyId: null } });
  console.log(`\n=== Articles ===`);
  console.log(`  Total: ${totalArticles}`);
  console.log(`  With companyId: ${articlesWithCompany}`);
  console.log(`  Without companyId (orphan): ${articlesWithoutCompany}`);

  const recentArticles = await prisma.article.findMany({
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { title: true, source: true, publishedAt: true, companyId: true, sentimentLabel: true },
  });
  console.log(`\n=== 3 most recent articles ===`);
  for (const a of recentArticles) {
    console.log(`  [${a.sentimentLabel || "?"}] ${a.source} — ${a.title?.slice(0, 60)} (company: ${a.companyId ? "yes" : "NO"})`);
  }

  const users = await prisma.user.count();
  const realUsers = await prisma.user.count({ where: { isDemo: false } });
  console.log(`\n=== Users ===`);
  console.log(`  Total: ${users}, Real (non-demo): ${realUsers}`);

  const invitations = await prisma.invitation.count({ where: { usedAt: null } });
  console.log(`  Pending invitations: ${invitations}`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

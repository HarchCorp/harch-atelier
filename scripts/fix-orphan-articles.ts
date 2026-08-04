import { prisma } from "../src/lib/db";

async function main() {
  console.log("=== FIXING ORPHAN ARTICLES ===\n");

  // Find orphan articles (no companyId)
  const orphans = await prisma.article.findMany({
    where: { companyId: null },
    select: { id: true, title: true, source: true, url: true, content: true },
    take: 100,
  });

  console.log(`Found ${orphans.length} orphan articles (checking first 100)`);

  // Try to match each orphan to a company by scanning title/content for company names
  const companies = await prisma.company.findMany({
    where: { isDemo: false },
    select: { id: true, name: true, slug: true, aliases: true },
  });

  let matched = 0;
  let unmatched = 0;

  for (const article of orphans) {
    const text = `${article.title || ""} ${article.content || ""}`.toLowerCase();
    let matchedCompany = null;

    for (const company of companies) {
      const namesToCheck = [company.name.toLowerCase(), ...company.aliases.map((a: string) => a.toLowerCase())];
      if (namesToCheck.some(name => text.includes(name))) {
        matchedCompany = company;
        break;
      }
    }

    if (matchedCompany) {
      await prisma.article.update({
        where: { id: article.id },
        data: { companyId: matchedCompany.id },
      });
      matched++;
    } else {
      unmatched++;
    }
  }

  console.log(`✓ Matched ${matched} articles to companies`);
  console.log(`✓ Unmatched: ${unmatched} (will leave as orphans)`);

  // Also clean up test articles (from Hespress scraper tests)
  const testArticles = await prisma.article.deleteMany({
    where: { title: { startsWith: "Hespress article" } },
  });
  console.log(`✓ Deleted ${testArticles.count} test articles (from scraper tests)`);

  // Final count
  const totalArticles = await prisma.article.count();
  const withCompany = await prisma.article.count({ where: { companyId: { not: null } } });
  console.log(`\nFinal: ${withCompany}/${totalArticles} articles have companyId (${Math.round((withCompany/totalArticles)*100)}%)`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

import { prisma } from "../src/lib/db";
async function main() {
  const count = await prisma.article.count();
  console.log("Total articles:", count);
  const recent = await prisma.article.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { title: true, source: true, createdAt: true } });
  console.log("Latest 3:");
  for (const a of recent) console.log(`  [${a.source}] ${a.title?.slice(0,50)} (${a.createdAt.toISOString().slice(0,19)})`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

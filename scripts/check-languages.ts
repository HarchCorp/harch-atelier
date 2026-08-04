import { prisma } from "../src/lib/db";
async function main() {
  const articles = await prisma.article.findMany({
    where: { language: { not: null } },
    distinct: ["language"],
    select: { language: true },
    take: 20,
  });
  console.log("Article languages in DB:", articles.map(a => a.language));
  
  const msgs = await prisma.inboundWhatsAppMessage.findMany({
    distinct: ["language"],
    select: { language: true },
    take: 10,
  });
  console.log("WhatsApp languages:", msgs.map(m => m.language));
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

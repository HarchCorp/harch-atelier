import { PrismaClient } from "../node_modules/.prisma/client-local";
const prisma = new PrismaClient();
async function main() {
  const comments = await prisma.articleComment.count();
  const articles = await prisma.article.count();
  const msgs = await prisma.inboundWhatsAppMessage.count();
  const flagged = await prisma.inboundWhatsAppMessage.count({ where: { status: "flagged" } });
  console.log("articles:", articles, "| comments:", comments, "| inbound msgs:", msgs, "| flagged:", flagged);
  const sample = await prisma.inboundWhatsAppMessage.findFirst({ orderBy: { receivedAt: "desc" }});
  if (sample) console.log("latest msg:", sample.body.slice(0,60), "| crisis:", sample.crisisScore, "| status:", sample.status);
  const sampleComment = await prisma.articleComment.findFirst({ orderBy: { scrapedAt: "desc" }, include: { article: true }});
  if (sampleComment) console.log("latest comment:", sampleComment.content.slice(0,60), "| sentiment:", sampleComment.sentimentPolarity, "| sarcasm:", sampleComment.sarcasmDetected);
}
main().then(() => prisma.$disconnect());

import { PrismaClient } from "../node_modules/.prisma/client-local";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("=== connecting to local SQLite ===");
    await prisma.$connect();
    console.log("✓ connected");

    console.log("\n=== list tables ===");
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`;
    console.log(tables);

    console.log("\n=== count ArticleComment ===");
    const commentCount = await prisma.articleComment.count();
    console.log("count:", commentCount);

    console.log("\n=== count InboundWhatsAppMessage ===");
    const msgCount = await prisma.inboundWhatsAppMessage.count();
    console.log("count:", msgCount);

    console.log("\n=== INSERT test ArticleComment ===");
    const article = await prisma.article.create({
      data: {
        slug: "test-hespress-001",
        title: "Test article for Hespress comments",
        url: "https://hespress.com/test/001.html",
        source: "hespress",
        publishedAt: new Date(),
      },
    });
    console.log("✓ article created:", article.id);

    const comment = await prisma.articleComment.create({
      data: {
        articleId: article.id,
        commentId: "test-comment-001",
        author: "زائر",
        content: "tbarkellah 3la had service, mchaw lflous dyali",
        publishedAt: new Date(),
        likes: 42,
        language: "mixed",
        sentimentPolarity: "negative",
        sentimentScore: -0.6,
        sarcasmDetected: true,
      },
    });
    console.log("✓ comment created:", comment.id);

    console.log("\n=== INSERT test InboundWhatsAppMessage ===");
    const msg = await prisma.inboundWhatsAppMessage.create({
      data: {
        fromPhone: "+212600000000",
        fromName: "Salma Bennani",
        body: "Regardez ce qui se dit sur nous dans ce groupe WhatsApp...",
        sentimentPolarity: "negative",
        sentimentScore: -0.45,
        sarcasmDetected: false,
        injectionDetected: false,
        fakenessScore: 0.12,
        fakenessVerdict: "low",
        crisisScore: 35,
        language: "french",
        status: "flagged",
      },
    });
    console.log("✓ message created:", msg.id);

    console.log("\n=== READ back ===");
    const readComment = await prisma.articleComment.findFirst({
      where: { sarcasmDetected: true },
      include: { article: true },
    });
    console.log("✓ read comment:", readComment?.content, "| article:", readComment?.article?.title);

    const readMsg = await prisma.inboundWhatsAppMessage.findFirst({
      where: { status: "flagged" },
    });
    console.log("✓ read message:", readMsg?.body, "| crisis:", readMsg?.crisisScore);

    console.log("\n=== CLEANUP test data ===");
    await prisma.articleComment.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.inboundWhatsAppMessage.deleteMany({});
    console.log("✓ test data cleaned");

    console.log("\n═══════════════════════════════════════════════════");
    console.log("  ✓ TABLES RÉPONDENT EN LOCAL — Brique 5 OK");
    console.log("  ArticleComment: créé, lu, supprimé");
    console.log("  InboundWhatsAppMessage: créé, lu, supprimé");
    console.log("  Base: db/local.db (SQLite, persistante)");
    console.log("═══════════════════════════════════════════════════");
  } catch (e) {
    console.error("✗ ERROR:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();

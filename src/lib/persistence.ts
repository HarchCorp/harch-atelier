// ═══════════════════════════════════════════════════════════════
//  PERSISTENCE LAYER — for scraped Hespress comments + WhatsApp inbound
//
//  Wraps the local Prisma client (SQLite) to persist the two new
//  data bricks. Falls back gracefully if the DB is unavailable
//  (returns the in-memory result unchanged, logs a warning).
//
//  When Neon PostgreSQL is provisioned, these functions migrate to
//  the main `@/lib/db` client — same signatures, different backend.
// ═══════════════════════════════════════════════════════════════

import { prismaLocal, localDbAvailable } from "@/lib/db-local";
import type { ScrapeResult, ScrapedComment } from "@/lib/scrapers/hespress-comments";
import type { InboundMessage } from "@/lib/whatsapp/inbound-store";

// ─── Persist Hespress comments ─────────────────────────────────

export interface PersistResult {
  persisted: boolean;
  articleId: string | null;
  commentsPersisted: number;
  error?: string;
}

export async function persistScrapedComments(
  articleUrl: string,
  articleId: string,
  source: string,
  result: ScrapeResult,
): Promise<PersistResult> {
  if (!localDbAvailable() || !prismaLocal) {
    return { persisted: false, articleId: null, commentsPersisted: 0, error: "Local DB unavailable" };
  }

  try {
    // Upsert the article (find by URL, create if missing)
    let article = await prismaLocal.article.findUnique({
      where: { url: articleUrl },
    });

    if (!article) {
      // Extract a title from the first comment if available, else use URL
      const title = result.comments[0]?.content
        ? `Hespress article ${articleId}`
        : `Hespress article ${articleId}`;
      article = await prismaLocal.article.create({
        data: {
          slug: `hespress-${articleId}`,
          title,
          url: articleUrl,
          source: "hespress",
          publishedAt: new Date(),
        },
      });
    }

    // Upsert each comment (skip duplicates via the unique [articleId, commentId])
    let commentsPersisted = 0;
    for (const comment of result.comments) {
      try {
        await prismaLocal.articleComment.upsert({
          where: {
            articleId_commentId: {
              articleId: article.id,
              commentId: comment.id,
            },
          },
          update: {
            // Update sentiment if re-scraped (the comment content doesn't change, but NLP might)
            sentimentPolarity: comment.sentiment.polarity,
            sentimentScore: comment.sentiment.score,
            sarcasmDetected: comment.sentiment.sarcasmDetected,
            likes: comment.likes,
          },
          create: {
            articleId: article.id,
            commentId: comment.id,
            author: comment.author,
            content: comment.content,
            publishedAt: comment.publishedAt ? new Date(comment.publishedAt) : null,
            parentId: comment.parentId,
            likes: comment.likes,
            language: comment.language,
            sentimentPolarity: comment.sentiment.polarity,
            sentimentScore: comment.sentiment.score,
            sarcasmDetected: comment.sentiment.sarcasmDetected,
          },
        });
        commentsPersisted++;
      } catch {
        // Skip individual comment errors (don't abort the whole batch)
      }
    }

    return {
      persisted: true,
      articleId: article.id,
      commentsPersisted,
    };
  } catch (e) {
    return {
      persisted: false,
      articleId: null,
      commentsPersisted: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ─── Persist WhatsApp inbound message ──────────────────────────

export async function persistInboundMessage(
  msg: InboundMessage,
): Promise<{ persisted: boolean; dbId: string | null; error?: string }> {
  if (!localDbAvailable() || !prismaLocal) {
    return { persisted: false, dbId: null, error: "Local DB unavailable" };
  }

  // Handle the case where analysis is null (message still "analyzing")
  const a = msg.analysis;
  const sentimentPolarity = a?.sentimentLabel ?? "neutral";
  const sentimentScore = a?.sentiment ?? 0;
  const sarcasmDetected = a?.sarcasmDetected ?? false;
  const injectionDetected = a?.injectionDetected ?? false;
  const injectionPatterns = a?.signals ? JSON.stringify(a.signals) : null;
  const fakenessScore = a?.fakenessScore ?? 0;
  const fakenessVerdict = fakenessScore > 0.6 ? "high" : fakenessScore > 0.3 ? "medium" : "low";
  const crisisScore = a?.crisisScore ?? 0;
  const language = a?.language ?? "english";

  try {
    const created = await prismaLocal.inboundWhatsAppMessage.create({
      data: {
        fromPhone: msg.from,
        fromName: msg.fromName,
        body: msg.body,
        mediaUrl: msg.mediaUrl,
        mediaContentType: msg.mediaContentType,
        sentimentPolarity,
        sentimentScore,
        sarcasmDetected,
        injectionDetected,
        injectionPatterns,
        fakenessScore,
        fakenessVerdict,
        crisisScore,
        language,
        status: msg.status,
        outboundBody: null,
        respondedAt: null,
      },
    });
    return { persisted: true, dbId: created.id };
  } catch (e) {
    return {
      persisted: false,
      dbId: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// ─── Read persisted comments (for the dashboard / API) ─────────

export async function readRecentComments(limit = 50): Promise<
  Array<{
    id: string;
    content: string;
    author: string | null;
    language: string;
    sentimentPolarity: string;
    sentimentScore: number;
    sarcasmDetected: boolean;
    likes: number;
    scrapedAt: Date;
    article: { title: string | null; url: string | null; source: string | null };
  }>
> {
  if (!localDbAvailable() || !prismaLocal) return [];
  try {
    return await prismaLocal.articleComment.findMany({
      take: limit,
      orderBy: { scrapedAt: "desc" },
      include: { article: { select: { title: true, url: true, source: true } } },
    });
  } catch {
    return [];
  }
}

export async function readRecentInboundMessages(limit = 50): Promise<
  Array<{
    id: string;
    fromPhone: string;
    fromName: string | null;
    body: string;
    sentimentPolarity: string;
    crisisScore: number;
    status: string;
    receivedAt: Date;
  }>
> {
  if (!localDbAvailable() || !prismaLocal) return [];
  try {
    return await prismaLocal.inboundWhatsAppMessage.findMany({
      take: limit,
      orderBy: { receivedAt: "desc" },
    });
  } catch {
    return [];
  }
}

// ─── Stats (for dashboard widgets) ─────────────────────────────

export async function getLocalDbStats(): Promise<{
  available: boolean;
  articleCount: number;
  commentCount: number;
  inboundMessageCount: number;
  flaggedMessageCount: number;
}> {
  if (!localDbAvailable() || !prismaLocal) {
    return {
      available: false,
      articleCount: 0,
      commentCount: 0,
      inboundMessageCount: 0,
      flaggedMessageCount: 0,
    };
  }
  try {
    const [articleCount, commentCount, inboundMessageCount, flaggedMessageCount] = await Promise.all([
      prismaLocal.article.count(),
      prismaLocal.articleComment.count(),
      prismaLocal.inboundWhatsAppMessage.count(),
      prismaLocal.inboundWhatsAppMessage.count({ where: { status: "flagged" } }),
    ]);
    return {
      available: true,
      articleCount,
      commentCount,
      inboundMessageCount,
      flaggedMessageCount,
    };
  } catch {
    return {
      available: false,
      articleCount: 0,
      commentCount: 0,
      inboundMessageCount: 0,
      flaggedMessageCount: 0,
    };
  }
}

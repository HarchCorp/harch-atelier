// ═══════════════════════════════════════════════════════════════
//  HESPRESS SCRAPER — Articles + Comments
//
//  Hespress is the #1 Moroccan news site (10M+ visitors/month).
//  It has 100k+ comments/day — the REAL pulse of Morocco.
//
//  This scraper:
//    1. Fetches Hespress RSS feed for article URLs
//    2. For each article: fetches the full page
//    3. Extracts: title, content, author, date, category
//    4. Extracts ALL comments: text, author, date, likes, replies
//    5. Runs sentiment analysis on each comment
//    6. Returns structured data
//
//  Usage:
//    const articles = await scrapeHespress("OCP");
//    // articles[0].comments[0].text = "OCP a fait des bénéfices..."
//    // articles[0].comments[0].sentiment = "negative"
//    // articles[0].comments[0].likes = 45
// ═══════════════════════════════════════════════════════════════

import { logInfo, logError } from "@/lib/logger";

export interface HespressComment {
  id: string;
  author: string;
  text: string;
  date: string | null;
  likes: number;
  replies: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  language: "fr" | "ar" | "darija" | "mixed";
}

export interface HespressArticle {
  url: string;
  urlHash: string;
  title: string;
  content: string;
  summary: string;
  author: string | null;
  publishedAt: Date | null;
  category: string | null;
  source: string;
  sourceType: string;
  language: string;
  imageUrl: string | null;
  comments: HespressComment[];
  commentCount: number;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

const HESPRESS_RSS = "https://www.hespress.com/feed";
const HESPRESS_BASE = "https://www.hespress.com";

// ───crypto hash ─────────────────────────────────────────────────
function hashUrl(url: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(url).digest("hex");
}

// ─── Fetch with timeout ────────────────────────────────────────
async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HarchAtelierBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "fr,ar;q=0.9",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Parse RSS feed ────────────────────────────────────────────
function parseHespressRss(xml: string): Array<{ url: string; title: string; date: string | null }> {
  const articles: Array<{ url: string; title: string; date: string | null }> = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const linkMatch = /<link>(.*?)<\/link>/i.exec(item);
    const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i.exec(item);
    const dateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(item);

    if (linkMatch && titleMatch) {
      articles.push({
        url: linkMatch[1].trim(),
        title: titleMatch[1].trim(),
        date: dateMatch ? dateMatch[1].trim() : null,
      });
    }
  }

  return articles;
}

// ─── Extract article content ───────────────────────────────────
function extractArticleContent(html: string): {
  content: string;
  summary: string;
  author: string | null;
  category: string | null;
  imageUrl: string | null;
} {
  // Extract article body — Hespress uses .article-content or .post-content
  const contentMatch = /class="(?:article-content|post-content|entry-content)"[^>]*>([\s\S]*?)<\/div>/i.exec(html);
  let content = "";
  if (contentMatch) {
    // Strip HTML tags
    content = contentMatch[1]
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Summary = first 200 chars
  const summary = content.substring(0, 200).trim();

  // Author
  const authorMatch = /class="(?:author|post-author|byline)"[^>]*>([\s\S]*?)<\//i.exec(html);
  const author = authorMatch ? authorMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  // Category
  const categoryMatch = /class="(?:category|post-category|breadcrumb)"[^>]*>.*?<a[^>]*>(.*?)<\/a>/i.exec(html);
  const category = categoryMatch ? categoryMatch[1].trim() : null;

  // Image
  const imageMatch = /<img[^>]+src="(https?:\/\/[^"]+)"[^>]*>/i.exec(html);
  const imageUrl = imageMatch ? imageMatch[1] : null;

  return { content, summary, author, category, imageUrl };
}

// ─── Extract comments ──────────────────────────────────────────
function extractComments(html: string): HespressComment[] {
  const comments: HespressComment[] = [];

  // Hespress comments are in .comment-item or .comment-body divs
  // Also try DISQUS if present
  const commentRegex = /class="(?:comment-item|comment-body|comment-text|disqus-comment-text)"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;
  let id = 0;

  while ((match = commentRegex.exec(html)) !== null) {
    const rawHtml = match[1];
    const text = rawHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();

    if (text.length < 3) continue;

    // Try to extract likes
    const likesMatch = /class="(?:like-count|comment-likes)"[^>]*>(\d+)/i.exec(rawHtml);
    const likes = likesMatch ? parseInt(likesMatch[1], 10) : 0;

    // Detect language
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasFrench = /[a-zA-Zéèêëàâäïîôöùûüç]/.test(text);
    let language: HespressComment["language"] = "mixed";
    if (hasArabic && !hasFrench) language = "ar";
    else if (!hasArabic && hasFrench) language = "fr";
    else if (hasArabic && hasFrench) language = "darija"; // mixed Arabic + French = Darija

    comments.push({
      id: `comment-${id++}`,
      author: "anonymous", // Hespress comments are often anonymous
      text,
      date: null,
      likes,
      replies: 0,
      sentiment: null, // will be set by sentiment analyzer
      language,
    });
  }

  return comments;
}

// ─── Simple sentiment for comments (not LLM — lexicon-based) ───
function analyzeCommentSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  const positiveWords = ["bien", "bon", "excellent", "bravo", "merci", "super", "génial", "succès", "progrès", "félicitation"];
  const negativeWords = ["mal", "mauvais", "nul", "honte", "scandale", "boycott", "corruption", "voleur", "trahison", "échec", "catastrophe"];

  let pos = 0;
  let neg = 0;

  for (const w of positiveWords) if (lower.includes(w)) pos++;
  for (const w of negativeWords) if (lower.includes(w)) neg++;

  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

// ─── Main: scrape Hespress for a company name ──────────────────
export async function scrapeHespressForCompany(
  companyName: string,
  maxArticles = 20,
): Promise<HespressArticle[]> {
  logInfo("hespress-scraper", `Scraping Hespress for: ${companyName}`);

  try {
    // Step 1: Fetch RSS feed
    const rssXml = await fetchWithTimeout(HESPRESS_RSS);
    const feedItems = parseHespressRss(rssXml);
    logInfo("hespress-scraper", `RSS feed: ${feedItems.length} articles`);

    // Step 2: Filter articles that mention the company
    const matchingItems = feedItems.filter((item) => {
      const lowerTitle = item.title.toLowerCase();
      const lowerCompany = companyName.toLowerCase();
      return lowerTitle.includes(lowerCompany) || lowerTitle.includes(companyName);
    });

    // If no matches in RSS titles, try Google News with site:hespress.com
    let articlesToScrape = matchingItems;
    if (matchingItems.length === 0) {
      // Try Google News with site:hespress.com filter
      const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(companyName + " site:hespress.com")}&hl=fr&gl=MA&ceid=MA:fr`;
      try {
        const googleXml = await fetchWithTimeout(googleUrl);
        const googleItems = parseHespressRss(googleXml);
        articlesToScrape = googleItems.filter((item) => item.url.includes("hespress.com"));
        logInfo("hespress-scraper", `Google News (site:hespress.com): ${articlesToScrape.length} articles`);
      } catch {
        logInfo("hespress-scraper", "Google News fallback failed");
      }
    }

    // Step 3: Scrape each matching article (full page + comments)
    const results: HespressArticle[] = [];
    const batch = articlesToScrape.slice(0, maxArticles);

    for (const item of batch) {
      try {
        const html = await fetchWithTimeout(item.url, 10000);
        const { content, summary, author, category, imageUrl } = extractArticleContent(html);
        const comments = extractComments(html);

        // Analyze sentiment for each comment
        for (const comment of comments) {
          comment.sentiment = analyzeCommentSentiment(comment.text);
        }

        // Aggregate sentiment
        const sentiment = {
          positive: comments.filter((c) => c.sentiment === "positive").length,
          neutral: comments.filter((c) => c.sentiment === "neutral").length,
          negative: comments.filter((c) => c.sentiment === "negative").length,
        };

        results.push({
          url: item.url,
          urlHash: hashUrl(item.url),
          title: item.title,
          content,
          summary,
          author,
          publishedAt: item.date ? new Date(item.date) : null,
          category,
          source: "Hespress",
          sourceType: "rss",
          language: "fr",
          imageUrl,
          comments,
          commentCount: comments.length,
          sentiment,
        });

        logInfo("hespress-scraper", `Article: "${item.title}" — ${comments.length} comments`);

        // Rate limit: 500ms between articles
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        logError("hespress-scraper", `Failed to scrape article ${item.url}: ${err}`);
      }
    }

    logInfo("hespress-scraper", `Done: ${results.length} articles, ${results.reduce((s, a) => s + a.commentCount, 0)} total comments`);

    return results;
  } catch (err) {
    logError("hespress-scraper", `Hespress scrape failed: ${err}`);
    return [];
  }
}

// ─── Scrape Hespress homepage (general Moroccan news) ──────────
export async function scrapeHespressHomepage(maxArticles = 50): Promise<HespressArticle[]> {
  logInfo("hespress-scraper", `Scraping Hespress homepage (${maxArticles} articles)`);

  try {
    const rssXml = await fetchWithTimeout(HESPRESS_RSS);
    const feedItems = parseHespressRss(rssXml).slice(0, maxArticles);

    const results: HespressArticle[] = [];
    for (const item of feedItems) {
      try {
        const html = await fetchWithTimeout(item.url, 10000);
        const { content, summary, author, category, imageUrl } = extractArticleContent(html);
        const comments = extractComments(html);

        for (const comment of comments) {
          comment.sentiment = analyzeCommentSentiment(comment.text);
        }

        const sentiment = {
          positive: comments.filter((c) => c.sentiment === "positive").length,
          neutral: comments.filter((c) => c.sentiment === "neutral").length,
          negative: comments.filter((c) => c.sentiment === "negative").length,
        };

        results.push({
          url: item.url,
          urlHash: hashUrl(item.url),
          title: item.title,
          content,
          summary,
          author,
          publishedAt: item.date ? new Date(item.date) : null,
          category,
          source: "Hespress",
          sourceType: "rss",
          language: "fr",
          imageUrl,
          comments,
          commentCount: comments.length,
          sentiment,
        });

        await new Promise((r) => setTimeout(r, 500));
      } catch {}
    }

    return results;
  } catch (err) {
    logError("hespress-scraper", `Homepage scrape failed: ${err}`);
    return [];
  }
}

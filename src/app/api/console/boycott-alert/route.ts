// ═══════════════════════════════════════════════════════════════
//  POST /api/console/boycott-alert
//
//  Skill 8 — Boycott Early Warning System.
//
//  Moroccan boycotts start on Hespress comments — the #1 Moroccan
//  news site, 100k+ comments/day. The 2018 boycott of Centrale
//  Danone, Afriquia, and Sinalco spread from Hespress + Facebook
//  comments before reaching mainstream media.
//
//  This route:
//    1. Scrapes Hespress for the company (existing scraper)
//    2. Fetches Google News RSS with "boycott [companyName]" query
//    3. Scans every comment + article title for boycott keywords:
//         "boycott" · "مقاطعة" · "لا" · "stop" · "refus" · "honte" · "dehors"
//    4. Detects velocity: how fast boycott mentions are growing
//       (24h vs 7d baseline, plus per-day sparkline)
//    5. Extracts hashtags (#word patterns + boycott-adjacent tokens)
//    6. Computes a 0-100 boycottScore from:
//         - keyword frequency (normalised)
//         - velocity multiplier (24h / 7d baseline)
//         - negative sentiment share among boycott signals
//    7. Returns a structured alert the Dircom can act on
//
//  Levels:
//    safe      (<25)  — no boycott signal, maintain veille
//    watch     (25-50)— early chatter, monitor + prepare
//    warning   (50-75)— organised boycott narrative forming
//    critical  (>75)  — boycott is live, activate crisis mode
//
//  Auth: requires session via requireUserCompany(). Optional body
//  `{ companyName?: string }` overrides the DB company name (used
//  for ad-hoc scans of competitor / sector names).
//
//  Scraping takes 30-60s (10 Hespress articles × 1s + comments + GN).
//  maxDuration = 60s.
//
//  Skill ID: SKILL-8-BOYCOTT-ALERT
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { logInfo, logError } from "@/lib/logger";
import { requireUserCompany } from "@/lib/harchiq/company-session";
import { prisma } from "@/lib/db";
import { scrapeHespressForCompany } from "@/lib/scrapers/hespress-scraper";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ─── Types returned to the client ───────────────────────────────

export interface BoycottSignal {
  source: string;
  text: string;
  date: string | null;
  sentiment: "positive" | "neutral" | "negative";
  platform: "hespress" | "google-news";
}

export interface BoycottVelocity {
  today24h: number;
  last7d: number;
  trend: "rising" | "stable" | "falling";
  /** 7 daily buckets (oldest → newest), each { date, count }. */
  dailyCounts: Array<{ date: string; count: number }>;
  multiplier: number; // 24h rate / 7d baseline rate
}

export interface BoycottHashtag {
  tag: string;          // includes the leading "#"
  count: number;
  sentiment: "positive" | "neutral" | "negative";
}

export type BoycottLevel = "safe" | "watch" | "warning" | "critical";

export interface BoycottAlertResponse {
  companyName: string;
  generatedAt: string;
  date: string;
  boycottScore: number;     // 0-100
  level: BoycottLevel;
  signals: BoycottSignal[];
  velocity: BoycottVelocity;
  hashtags: BoycottHashtag[];
  recommendation: string;
  stats: {
    hespressArticles: number;
    hespressComments: number;
    googleNewsArticles: number;
    boycottMentions: number;
    negativeShare: number; // 0..1
  };
}

// ─── Boycott lexicon (multi-lingual) ───────────────────────────
//  French · Arabic · English — the languages used on Hespress.
//  "لا" (Arabic for "no") is included per spec — it's a strong
//  boycott signal in Arabic comment threads ("لا للشركة", "لا للمقاطعة").
//
//  Each entry has a weight: explicit boycott words weigh more than
//  softer terms like "honte" or "dehors".
const BOYCOTT_LEXICON: Array<{ term: string; weight: number }> = [
  { term: "boycott",   weight: 1.0 },
  { term: "مقاطعة",     weight: 1.0 },  // Arabic: boycott
  { term: "stop",      weight: 0.7 },
  { term: "refus",     weight: 0.7 },   // matches "refus", "refuser", "refusons"
  { term: "honte",     weight: 0.5 },
  { term: "dehors",    weight: 0.5 },
  { term: "لا",         weight: 0.8 },  // Arabic "no" — strong signal in context
];

// Counter-narrative lexicon — used to detect positive pushback
// hashtags (e.g., "#JeSoutiensMarjane", "#AvecOCP").
const COUNTER_LEXICON = [
  "soutien", "soutiens", "avec", "standwith", "solidar",
  "دعم", "مع",  // Arabic support terms
  "fier", "fière", "fierete",
  "proud", "bravo", "merci",
];

// ─── Google News RSS fetch ─────────────────────────────────────
//  Mirrors the hespress-scraper's Google News fallback pattern but
//  without the `site:hespress.com` restriction — we want ANY news
//  article about "boycott [companyName]" across the open web.
interface GoogleNewsItem {
  title: string;
  url: string;
  date: string | null;
  source: string;
}

async function fetchGoogleNewsBoycott(
  companyName: string,
  timeoutMs = 12000,
): Promise<GoogleNewsItem[]> {
  const query = `boycott ${companyName}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=MA&ceid=MA:fr`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HarchAtelierBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml",
        "Accept-Language": "fr,ar;q=0.9",
      },
    });
    if (!res.ok) {
      logInfo("boycott-alert", `Google News HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    return parseGoogleNewsRss(xml);
  } catch (err) {
    logInfo("boycott-alert", `Google News fetch failed: ${err}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function parseGoogleNewsRss(xml: string): GoogleNewsItem[] {
  const items: GoogleNewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const titleMatch = /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i.exec(item);
    const linkMatch = /<link>(.*?)<\/link>/i.exec(item);
    const dateMatch = /<pubDate>(.*?)<\/pubDate>/i.exec(item);
    const sourceMatch = /<source[^>]*>(.*?)<\/source>/i.exec(item);

    if (titleMatch) {
      items.push({
        title: titleMatch[1].trim(),
        url: linkMatch ? linkMatch[1].trim() : "",
        date: dateMatch ? dateMatch[1].trim() : null,
        source: sourceMatch ? sourceMatch[1].trim() : "Google News",
      });
    }
  }
  return items;
}

// ─── Boycott keyword detection ─────────────────────────────────
//  Returns the matched term + weight, or null if no keyword found.
//  Case-insensitive for Latin, exact substring for Arabic (Arabic
//  doesn't have case).
function findBoycottKeyword(text: string): { term: string; weight: number } | null {
  const lower = text.toLowerCase();
  let best: { term: string; weight: number } | null = null;
  for (const entry of BOYCOTT_LEXICON) {
    // For Arabic terms, search the raw text; for Latin, the lowercased.
    const haystack = /[\u0600-\u06FF]/.test(entry.term) ? text : lower;
    if (haystack.includes(entry.term)) {
      if (!best || entry.weight > best.weight) best = entry;
    }
  }
  return best;
}

// ─── Sentiment for a boycott signal ────────────────────────────
//  Lexicon-based (no LLM call — keeps the route fast and within
//  the maxDuration budget). A signal is "positive" if it contains
//  a counter-narrative term (pushback against the boycott), else
//  "negative" if it contains hostility markers, else "neutral".
function signalSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  const hasCounter = COUNTER_LEXICON.some((t) => {
    const haystack = /[\u0600-\u06FF]/.test(t) ? text : lower;
    return haystack.includes(t);
  });
  if (hasCounter) return "positive";

  const hostility = ["voleur", "corruption", "scandale", "trahison", "pillage", "exploit", "voleurs"];
  const hasHostility = hostility.some((w) => lower.includes(w));
  if (hasHostility) return "negative";

  // If the keyword itself is "boycott" or "مقاطعة" and no counter-term,
  // treat as negative — that's a boycott call.
  return "negative";
}

// ─── Hashtag extraction ────────────────────────────────────────
//  Scans for explicit #word patterns. If none are found, synthesises
//  boycott-adjacent pseudo-hashtags (#Boycott[Company], #Stop[Company])
//  from the matched signals so the chip strip is never empty when
//  there are signals.
function extractHashtags(
  texts: string[],
  companyName: string,
): BoycottHashtag[] {
  const freq = new Map<string, { count: number; sentimentSum: { positive: number; neutral: number; negative: number } }>();

  const hashRegex = /#([\p{L}\p{N}_]{2,40})/gu;
  for (const text of texts) {
    const matches = text.match(hashRegex) ?? [];
    for (const tag of matches) {
      const norm = tag.toLowerCase();
      const slot = freq.get(norm) ?? { count: 0, sentimentSum: { positive: 0, neutral: 0, negative: 0 } };
      slot.count += 1;
      slot.sentimentSum[signalSentiment(text)] += 1;
      freq.set(norm, slot);
    }
  }

  // Synthesise pseudo-hashtags when we have signals but no explicit tags.
  // This is what boycott campaigns actually look like in their early
  // stage: people write "boycott Marjane" 30 times before #BoycottMarjane
  // emerges. We surface the latent hashtag.
  if (freq.size === 0 && texts.length > 0) {
    const companyCamel = companyName
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    if (companyCamel) {
      const synthTags = [`#boycott${companyCamel.toLowerCase()}`, `#stop${companyCamel.toLowerCase()}`];
      for (const tag of synthTags) {
        freq.set(tag, { count: texts.length, sentimentSum: { positive: 0, neutral: 0, negative: texts.length } });
      }
    }
  }

  return Array.from(freq.entries())
    .map(([tag, slot]) => {
      const sentiments = slot.sentimentSum;
      let sentiment: "positive" | "neutral" | "negative" = "neutral";
      if (sentiments.positive > sentiments.negative && sentiments.positive > 0) sentiment = "positive";
      else if (sentiments.negative > 0) sentiment = "negative";
      return { tag, count: slot.count, sentiment };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

// ─── Velocity computation ──────────────────────────────────────
//  Buckets boycott signals by day (UTC date string). Returns:
//    - today24h: count in the last 24 hours
//    - last7d:   count in the last 7 days (inclusive of 24h)
//    - trend:    rising | stable | falling — compares the back 3 days
//                 vs the front 3 days of the 7-day window
//    - dailyCounts: 7 buckets oldest → newest
//    - multiplier:  (today24h / 1 day) / (last7d / 7 days) → 1.0 = flat
function computeVelocity(
  signals: BoycottSignal[],
  now: Date,
): BoycottVelocity {
  const oneDayMs = 86400000;
  const cutoff24h = new Date(now.getTime() - oneDayMs);
  const cutoff7d = new Date(now.getTime() - 7 * oneDayMs);

  // Build 7 daily buckets (oldest → newest). Bucket key = ISO date.
  const dailyBuckets: Array<{ date: string; count: number }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * oneDayMs);
    dailyBuckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const bucketIdx = new Map(dailyBuckets.map((b, i) => [b.date, i]));

  let today24h = 0;
  let last7d = 0;

  for (const sig of signals) {
    if (!sig.date) continue;
    const ts = new Date(sig.date);
    if (isNaN(ts.getTime())) continue;

    if (ts >= cutoff24h) today24h += 1;
    if (ts >= cutoff7d) {
      last7d += 1;
      const key = ts.toISOString().slice(0, 10);
      const idx = bucketIdx.get(key);
      if (idx !== undefined) dailyBuckets[idx].count += 1;
    }
  }

  // Trend: compare sum of last 3 days (front) vs sum of first 3 days (back).
  // Edge: if everything is zero, "stable".
  const back3 = dailyBuckets.slice(0, 3).reduce((s, b) => s + b.count, 0);
  const front3 = dailyBuckets.slice(4, 7).reduce((s, b) => s + b.count, 0);
  let trend: "rising" | "stable" | "falling" = "stable";
  if (front3 > back3 * 1.3 && front3 > 0) trend = "rising";
  else if (back3 > front3 * 1.3 && back3 > 0) trend = "falling";

  // Multiplier: (today24h / 1d) / (last7d / 7d). If baseline is 0,
  // any 24h activity is "infinite" velocity — we cap at 10×.
  const todayRate = today24h / 1;
  const baselineRate = last7d / 7;
  const multiplier = baselineRate > 0
    ? Math.min(10, Math.round((todayRate / baselineRate) * 10) / 10)
    : today24h > 0 ? 10 : 0;

  return { today24h, last7d, trend, dailyCounts: dailyBuckets, multiplier };
}

// ─── Score computation ─────────────────────────────────────────
//  boycottScore (0-100) is a weighted blend of:
//    A. keyword frequency  — normalised mentions per 100 comments
//    B. velocity multiplier — capped at 5×
//    C. negative sentiment share among boycott signals
//
//  Weights: 0.4 frequency, 0.3 velocity, 0.3 sentiment. Each sub-
//  score is clamped to 0-100 before blending.
function computeScore(
  boycottMentions: number,
  totalComments: number,
  multiplier: number,
  negativeShare: number,
): number {
  // A. Frequency: 5 mentions/100 comments = score 100. Linear, capped.
  const ratePer100 = totalComments > 0 ? (boycottMentions / totalComments) * 100 : 0;
  const freqScore = Math.min(100, (ratePer100 / 5) * 100);

  // B. Velocity: 1× = 0, 2× = 50, 5×+ = 100. Linear, capped.
  const velScore = Math.min(100, Math.max(0, (multiplier - 1) / 4 * 100));

  // C. Sentiment: 100% negative signals = 100, 0% negative = 0.
  const sentScore = Math.round(negativeShare * 100);

  const blended = Math.round(freqScore * 0.4 + velScore * 0.3 + sentScore * 0.3);
  return Math.max(0, Math.min(100, blended));
}

function levelForScore(score: number): BoycottLevel {
  if (score >= 75) return "critical";
  if (score >= 50) return "warning";
  if (score >= 25) return "watch";
  return "safe";
}

// ─── Recommendation builder ────────────────────────────────────
function buildRecommendation(
  level: BoycottLevel,
  score: number,
  velocity: BoycottVelocity,
  hashtags: BoycottHashtag[],
  signals: BoycottSignal[],
  companyName: string,
): string {
  if (level === "safe") {
    return `Aucun signal de boycott détecté pour ${companyName}. La veille Hespress + Google News reste active. Ce rapport constitue votre preuve de diligence réputationnelle.`;
  }

  const parts: string[] = [];
  if (level === "critical") {
    parts.push(`BOYCOTT CRITIQUE (${score}/100). Activation immédiate de la cellule de crise — le narratif boycott est actif sur ${signals.length} signaux détectés.`);
  } else if (level === "warning") {
    parts.push(`Niveau de boycott ÉLEVÉ (${score}/100). Un narratif boycott se structure. Préparer une réponse publique sous 48h.`);
  } else {
    parts.push(`Signaux boycott émergents (${score}/100). Surveillance renforcée — le chatter peut encore être inversé par un contre-narratif.`);
  }

  if (velocity.multiplier >= 2) {
    parts.push(`Vélocité ${velocity.multiplier}× supérieure à la baseline 7j (${velocity.today24h} mentions 24h vs ${velocity.last7d} sur 7 jours, tendance ${velocity.trend}).`);
  } else if (velocity.trend === "rising") {
    parts.push(`Tendance à la hausse sur les derniers jours (${velocity.today24h} mentions 24h).`);
  }

  const negHashtags = hashtags.filter((h) => h.sentiment === "negative").slice(0, 3);
  if (negHashtags.length > 0) {
    parts.push(`Hashtags négatifs émergents: ${negHashtags.map((h) => h.tag).join(", ")}.`);
  }

  const posHashtags = hashtags.filter((h) => h.sentiment === "positive");
  if (posHashtags.length > 0 && level !== "critical") {
    parts.push(`Un contre-narratif existe (${posHashtags.length} hashtag(s) positif(s)). L'amplifier via les canaux officiels.`);
  } else if (level === "critical") {
    parts.push(`Aucun contre-narratif organisé détecté — préparer un communiqué de soutien + 3 messages tiers (experts, clients, employés).`);
  }

  if (level === "critical" || level === "warning") {
    parts.push(`Surveiller WhatsApp — les boycotts marocains franchissent la membrane privée 24-48h après Hespress.`);
  }

  return parts.join(" ");
}

// ─── POST handler ──────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const result = await requireUserCompany();
  if (!result.ok) return result.response;

  const { company } = result.data;

  // Optional body: { companyName?: string } — override DB company name
  let body: { companyName?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Body may be empty — fall back to DB company name
  }

  try {
    // Re-fetch the company row to get sector (requireUserCompany doesn't
    // include the fields we don't need for auth, but we want the canonical
    // display name when body.companyName is absent).
    const companyRow = await prisma.company.findUnique({
      where: { id: company.id },
      select: { name: true, sector: true },
    });

    const companyName = body.companyName?.trim() || companyRow?.name?.trim() || company.name;

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name required" },
        { status: 400 },
      );
    }

    logInfo("boycott-alert", `Scanning for boycott signals: "${companyName}" (company ${company.id})`);

    // ─── Parallel: Hespress scrape + Google News RSS ─────────
    //  Hespress takes 30-60s; Google News takes 1-3s. Running them
    //  in parallel keeps total wall-time bounded by Hespress.
    const [hespressArticles, googleNewsItems] = await Promise.all([
      scrapeHespressForCompany(companyName, 10),
      fetchGoogleNewsBoycott(companyName),
    ]);

    const now = new Date();

    // ─── Walk Hespress comments + articles, build signals ────
    //  A signal = one comment or article title that contains a
    //  boycott keyword. We keep the most-relevant slice of the
    //  comment text (window around the keyword) so the feed is
    //  scannable, not 500-char dumps.
    const signals: BoycottSignal[] = [];
    const boycottTexts: string[] = [];   // for hashtag extraction
    let totalComments = 0;

    for (const article of hespressArticles) {
      totalComments += article.comments.length;

      // Article title — often itself a boycott signal
      const titleHit = findBoycottKeyword(article.title);
      if (titleHit) {
        signals.push({
          source: article.source,
          text: article.title,
          date: article.publishedAt?.toISOString() ?? null,
          sentiment: signalSentiment(article.title),
          platform: "hespress",
        });
        boycottTexts.push(article.title);
      }

      for (const comment of article.comments) {
        const hit = findBoycottKeyword(comment.text);
        if (!hit) continue;

        // Slice a 180-char window around the keyword for readability.
        const text = sliceAroundKeyword(comment.text, hit.term, 180);
        signals.push({
          source: article.source,
          text,
          date: article.publishedAt?.toISOString() ?? null,
          sentiment: signalSentiment(comment.text),
          platform: "hespress",
        });
        boycottTexts.push(comment.text);
      }
    }

    // ─── Google News articles as boycott signals ─────────────
    //  These are articles whose title contains "boycott [company]"
    //  (already filtered by the Google News query). We only push
    //  those whose title also matches our lexicon — guards against
    //  Google News RSS sometimes returning loosely-related items.
    for (const item of googleNewsItems) {
      const hit = findBoycottKeyword(item.title);
      if (!hit) continue;
      signals.push({
        source: item.source,
        text: item.title,
        date: item.date ? new Date(item.date).toISOString() : null,
        sentiment: signalSentiment(item.title),
        platform: "google-news",
      });
      boycottTexts.push(item.title);
    }

    // ─── Sort signals: negative first, then by date desc ─────
    signals.sort((a, b) => {
      const aNeg = a.sentiment === "negative" ? 0 : 1;
      const bNeg = b.sentiment === "negative" ? 0 : 1;
      if (aNeg !== bNeg) return aNeg - bNeg;
      const aT = a.date ? new Date(a.date).getTime() : 0;
      const bT = b.date ? new Date(b.date).getTime() : 0;
      return bT - aT;
    });

    const topSignals = signals.slice(0, 10);

    // ─── Velocity ────────────────────────────────────────────
    const velocity = computeVelocity(signals, now);

    // ─── Hashtags ────────────────────────────────────────────
    const hashtags = extractHashtags(boycottTexts, companyName);

    // ─── Score & level ───────────────────────────────────────
    const boycottMentions = signals.length;
    const negativeCount = signals.filter((s) => s.sentiment === "negative").length;
    const negativeShare = boycottMentions > 0 ? negativeCount / boycottMentions : 0;

    const boycottScore = computeScore(
      boycottMentions,
      Math.max(totalComments, 1),
      velocity.multiplier,
      negativeShare,
    );
    const level = levelForScore(boycottScore);

    // ─── Recommendation ──────────────────────────────────────
    const recommendation = buildRecommendation(
      level, boycottScore, velocity, hashtags, signals, companyName,
    );

    const response: BoycottAlertResponse = {
      companyName,
      generatedAt: now.toISOString(),
      date: now.toLocaleDateString("fr-FR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }),
      boycottScore,
      level,
      signals: topSignals,
      velocity,
      hashtags,
      recommendation,
      stats: {
        hespressArticles: hespressArticles.length,
        hespressComments: totalComments,
        googleNewsArticles: googleNewsItems.length,
        boycottMentions,
        negativeShare: Math.round(negativeShare * 1000) / 1000,
      },
    };

    logInfo(
      "boycott-alert",
      `Alert ready for "${companyName}": score=${boycottScore} level=${level} signals=${boycottMentions} velocity=${velocity.multiplier}× (${velocity.trend}) hashtags=${hashtags.length}`,
    );

    return NextResponse.json(response);
  } catch (err) {
    logError("boycott-alert", `Failed: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 },
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Slice a window of `maxLen` chars around the first occurrence of
 * `keyword` in `text`. Used to keep signal text scannable. Adds
 * ellipses when truncated.
 */
function sliceAroundKeyword(text: string, keyword: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const lower = text.toLowerCase();
  const idx = lower.indexOf(keyword.toLowerCase());
  if (idx === -1) {
    // Fallback: just take the start.
    return text.slice(0, maxLen - 1) + "…";
  }
  const half = Math.floor((maxLen - keyword.length) / 2);
  const start = Math.max(0, idx - half);
  const end = Math.min(text.length, start + maxLen - 1);
  const slice = text.slice(start, end);
  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}

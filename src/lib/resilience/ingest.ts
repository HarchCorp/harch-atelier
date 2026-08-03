// ═══════════════════════════════════════════════════════════════
//  RESILIENCE ENGINE — INGEST MODULE
//  Handles HarchAtelier Stress-Cases 013, 098, 099
//
//  Pure functions. Covers: cross-media dispatch deduplication via
//  content simhash (013), deleted-article legal archival with
//  "Retiré" tag (098), astroturfing detection via account-age &
//  content-similarity heuristics (099).
// ═══════════════════════════════════════════════════════════════

// ─── Case 013: Content deduplication (AFP dispatch across N media) ─

function normalizeForHash(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^\p{L}\p{N} ]/gu, " ") // keep letters/numbers/spaces only
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000); // cap to avoid hashing huge payloads
}

// 64-bit simhash via rolling token hashes (FNV-1a)
function fnv1a(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function simhash(text: string): bigint {
  const normalized = normalizeForHash(text);
  const tokens = normalized.split(" ").filter((t) => t.length > 2);
  if (tokens.length === 0) return 0n;

  const counts: Record<number, number> = {};
  for (const t of tokens) {
    const h = fnv1a(t);
    counts[h] = (counts[h] || 0) + 1;
  }

  const bits = new Array(64).fill(0);
  for (const [hStr, weight] of Object.entries(counts)) {
    const h = BigInt(hStr);
    for (let i = 0; i < 64; i++) {
      if ((h >> BigInt(i)) & 1n) bits[i] += weight;
      else bits[i] -= weight;
    }
  }

  let result = 0n;
  for (let i = 0; i < 64; i++) {
    if (bits[i] > 0) result |= (1n << BigInt(i));
  }
  return result;
}

function hamming64(a: bigint, b: bigint): number {
  let x = a ^ b;
  let count = 0;
  while (x) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

export interface ArticleFingerprint {
  hash: string;
  hammingDistance: number;
  isDuplicate: boolean;
}

export function fingerprintArticle(text: string): string {
  return simhash(text).toString(16).padStart(16, "0");
}

export function isDuplicate(
  newText: string,
  existingHashes: string[],
  threshold = 4 // ≤4 bit differences on 64-bit simhash ≈ near-identical
): ArticleFingerprint {
  const newHash = simhash(newText);
  let minDist = 64;
  for (const hex of existingHashes) {
    const existing = BigInt("0x" + hex);
    const dist = hamming64(newHash, existing);
    if (dist < minDist) minDist = dist;
  }
  return {
    hash: newHash.toString(16).padStart(16, "0"),
    hammingDistance: minDist,
    isDuplicate: minDist <= threshold,
  };
}

// ─── Case 098: Deleted-article legal archival ───────────────────

export type ArticleStatus = "live" | "retired" | "updated";

export interface ArchivedArticle {
  id: string;
  url: string;
  title: string;
  contentSnapshot: string; // immutable at ingestion time
  firstSeenAt: string; // ISO
  retiredAt: string | null;
  status: ArticleStatus;
  retirementReason?: string;
  hashChainPrev: string | null; // hash-chain link for tamper-evidence
  hashChainSelf: string;
}

export interface ArchiveEvent {
  type: "ingested" | "retired" | "reverified";
  at: string;
  hash: string;
  note: string;
}

// Append-only ledger — entries are never mutated, only superseded.
export class ArticleArchive {
  private articles = new Map<string, ArchivedArticle>();
  private events: ArchiveEvent[] = [];
  private lastHash: string | null = null;

  ingest(article: Omit<ArchivedArticle, "hashChainPrev" | "hashChainSelf" | "status" | "retiredAt">): ArchivedArticle {
    const selfHash = this.computeHash(article.id + article.url + article.contentSnapshot + article.firstSeenAt + (this.lastHash ?? ""));
    const record: ArchivedArticle = {
      ...article,
      status: "live",
      retiredAt: null,
      hashChainPrev: this.lastHash,
      hashChainSelf: selfHash,
    };
    this.articles.set(article.id, record);
    this.lastHash = selfHash;
    this.events.push({ type: "ingested", at: article.firstSeenAt, hash: selfHash, note: `Ingested "${article.title}"` });
    return record;
  }

  retire(id: string, reason: string, at: string): ArchivedArticle | null {
    const existing = this.articles.get(id);
    if (!existing) return null;
    // NEVER delete — create a superseding record that points back
    const selfHash = this.computeHash(existing.id + existing.url + "RETIRED" + at + (this.lastHash ?? ""));
    const retired: ArchivedArticle = {
      ...existing,
      status: "retired",
      retiredAt: at,
      retirementReason: reason,
      hashChainPrev: this.lastHash,
      hashChainSelf: selfHash,
    };
    this.articles.set(id, retired);
    this.lastHash = selfHash;
    this.events.push({ type: "retired", at, hash: selfHash, note: `Article "${existing.title}" marked RETIRÉ (${reason})` });
    return retired;
  }

  verify(id: string): { valid: boolean; expected: string; actual: string } {
    const a = this.articles.get(id);
    if (!a) return { valid: false, expected: "", actual: "" };
    const recomputed = this.computeHash(a.id + a.url + a.contentSnapshot + a.firstSeenAt + (a.hashChainPrev ?? ""));
    return { valid: recomputed === a.hashChainSelf, expected: a.hashChainSelf, actual: recomputed };
  }

  list(): ArchivedArticle[] {
    return Array.from(this.articles.values());
  }

  eventLog(): ArchiveEvent[] {
    return [...this.events];
  }

  private computeHash(input: string): string {
    // Simple deterministic hash (FNV-1a 64-bit-ish) — for demo / tamper-evidence,
    // not cryptographic. In production this would be SHA-256.
    let h1 = 0x811c9dc5;
    let h2 = 0x1000193;
    for (let i = 0; i < input.length; i++) {
      const c = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
    }
    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }
}

// ─── Case 099: Astroturfing / coordinated-fake-review detection ──

export interface PosterAccount {
  id: string;
  handle: string;
  createdAt: string; // ISO
  followers: number;
  priorPosts: number;
}

export interface ReviewPost {
  authorId: string;
  text: string;
  at: string; // ISO
}

export interface AstroturfingResult {
  isCoordinatedCampaign: boolean;
  riskScore: number; // 0..1
  signals: Array<{ name: string; severity: number; detail: string }>;
  flaggedAccounts: string[];
}

export function detectAstroturfing(
  posts: ReviewPost[],
  accounts: Map<string, PosterAccount>,
  threshold = 0.6
): AstroturfingResult {
  const signals: AstroturfingResult["signals"] = [];
  const flaggedAccounts = new Set<string>();

  if (posts.length < 5) {
    return { isCoordinatedCampaign: false, riskScore: 0, signals: [{ name: "Insufficient volume", severity: 0, detail: `${posts.length} posts — below the 5-post coordination threshold.` }], flaggedAccounts: [] };
  }

  // 1. Account-age distribution — how many authors are <30 days old?
  const authorIds = Array.from(new Set(posts.map((p) => p.authorId)));
  let youngAccounts = 0;
  for (const id of authorIds) {
    const acc = accounts.get(id);
    if (!acc) continue;
    const newestPost = posts.filter((p) => p.authorId === id).reduce((max, p) => (p.at > max ? p.at : max), "1970-01-01");
    const ageDays = (new Date(newestPost).getTime() - new Date(acc.createdAt).getTime()) / 86400000;
    if (ageDays < 30) {
      youngAccounts++;
      flaggedAccounts.add(id);
    }
  }
  const youngRatio = youngAccounts / authorIds.length;
  if (youngRatio > 0.4) {
    signals.push({
      name: "Young account concentration",
      severity: youngRatio,
      detail: `${youngAccounts}/${authorIds.length} authors (${(youngRatio * 100).toFixed(0)}%) created <30 days before posting.`,
    });
  }

  // 2. Posting velocity — how tightly clustered are the timestamps?
  const times = posts.map((p) => new Date(p.at).getTime()).sort((a, b) => a - b);
  const span = times[times.length - 1] - times[0];
  const spanHours = span / 3600000;
  const postsPerHour = posts.length / Math.max(spanHours, 0.1);
  if (postsPerHour > 2 && posts.length > 8) {
    signals.push({
      name: "Burst velocity",
      severity: Math.min(1, postsPerHour / 10),
      detail: `${posts.length} posts in ${spanHours.toFixed(1)}h = ${postsPerHour.toFixed(2)} posts/hour.`,
    });
  }

  // 3. Content similarity — pairwise simhash, count near-duplicates
  const hashes = posts.map((p) => simhash(p.text));
  let nearDupPairs = 0;
  for (let i = 0; i < hashes.length; i++) {
    for (let j = i + 1; j < hashes.length; j++) {
      if (hamming64(hashes[i], hashes[j]) <= 8) nearDupPairs++;
    }
  }
  const maxPairs = (posts.length * (posts.length - 1)) / 2;
  const dupRatio = maxPairs > 0 ? nearDupPairs / maxPairs : 0;
  if (dupRatio > 0.2) {
    signals.push({
      name: "Near-duplicate content",
      severity: dupRatio,
      detail: `${nearDupPairs}/${maxPairs} post pairs (${(dupRatio * 100).toFixed(0)}%) are near-duplicates (≤8-bit simhash distance).`,
    });
  }

  // 4. Low-follower / low-activity authors
  let lowCredAuthors = 0;
  for (const id of authorIds) {
    const acc = accounts.get(id);
    if (!acc) continue;
    if (acc.followers < 50 && acc.priorPosts < 10) {
      lowCredAuthors++;
      flaggedAccounts.add(id);
    }
  }
  const lowCredRatio = lowCredAuthors / authorIds.length;
  if (lowCredRatio > 0.5) {
    signals.push({
      name: "Low-credibility author base",
      severity: lowCredRatio,
      detail: `${lowCredAuthors}/${authorIds.length} authors have <50 followers AND <10 prior posts.`,
    });
  }

  const riskScore = Math.min(1, signals.reduce((acc, s) => acc + s.severity * 0.3, 0));
  const isCoordinatedCampaign = riskScore >= threshold;

  return {
    isCoordinatedCampaign,
    riskScore,
    signals,
    flaggedAccounts: Array.from(flaggedAccounts),
  };
}

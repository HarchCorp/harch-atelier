// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.0 — HarchIQ COLLECT STAGE
//  Social-media collector — stubs for Twitter, LinkedIn, Facebook.
//
//  These three platforms require paid API access (Twitter API v2,
//  LinkedIn Marketing API, Facebook Graph API) and explicit terms-
//  of-service review before HarchIQ can ingest from them. This file
//  defines the stable interface so the rest of the COLLECT stage can
//  be wired up today; the bodies return empty arrays with a loud
//  console warning until each integration is built out.
//
//  Integration roadmap (planned):
//    • Twitter API v2  — academic / pro tier, filtered stream
//    • LinkedIn        — Marketing API + Company API (OAuth2)
//    • Facebook        — Graph API, Page-scoped posts only
//
//  Each stub is intentionally non-throwing so the orchestrator can
//  fan out across all collectors in parallel without worrying about
//  one platform's outage blocking the others.
//
//  Task ID: AEGIS-V3-CORE
//  Module:  harchiq/collect/social-collector
// ═══════════════════════════════════════════════════════════════

import type { CollectionResult } from "../types";
import { logWarn } from "@/lib/logger";

// Re-export for ergonomic imports from this module.
export type { CollectionResult } from "../types";

// ─── SHARED OPTIONS ───────────────────────────────────────────────

/**
 * SocialCollectOptions — common tuning knobs for every social collector.
 * Mirrors CollectFromRSSOptions so the orchestrator can pass the same
 * options object to every collector.
 */
export interface SocialCollectOptions {
  /** Max posts to return (default 50). */
  maxPosts?: number;
  /** ISO-2 country filter (default "MA"). */
  country?: string;
  /** Language filter (default "fr"). */
  language?: "fr" | "ar" | "en";
  /** Whether to fetch full thread / reply chains (default false). */
  includeReplies?: boolean;
  /** Lookback window in days (default 30). */
  lookbackDays?: number;
}

const DEFAULTS: Required<SocialCollectOptions> = {
  maxPosts: 50,
  country: "MA",
  language: "fr",
  includeReplies: false,
  lookbackDays: 30,
};

// ─── TWITTER (X) ──────────────────────────────────────────────────

/**
 * collectFromTwitter — stub for Twitter API v2 integration.
 *
 * TODO: implement against the Twitter API v2 filtered stream +
 * recent search endpoints. Requires:
 *   • Bearer token (TWITTER_BEARER_TOKEN env var)
 *   • Academic or Pro tier for >7-day lookback
 *   • Compliance with Twitter's Developer Agreement (no surveillance,
 *     no public redistribution of raw tweets)
 *
 * Until then, returns an empty array with a console warning.
 *
 * @param companyName the company to collect social posts about
 * @param options     optional tuning (see SocialCollectOptions)
 * @returns always [] until the integration is built
 */
export async function collectFromTwitter(
  companyName: string,
  options: SocialCollectOptions = {},
): Promise<CollectionResult[]> {
  // Merge with defaults so the future implementation can rely on them.
  const _opts = { ...DEFAULTS, ...options };

  // TODO: Twitter API v2 integration — see roadmap in file header.
  logWarn("lib.harchiq.collect.social-collector", `[HarchIQ-Collect] Social media collection not yet configured for Twitter (company: "${companyName}")`);

  return [];
}

// ─── LINKEDIN ─────────────────────────────────────────────────────

/**
 * collectFromLinkedIn — stub for LinkedIn Marketing + Company API.
 *
 * TODO: implement against the LinkedIn Marketing API (Company API +
 * UGC Posts API). Requires:
 *   • OAuth2 application (LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET)
 *   • r_organization_social + r_organization_feed scopes
 *   • Per-company access token (member must be an admin of the page)
 *
 * Until then, returns an empty array with a console warning.
 *
 * @param companyName the company to collect social posts about
 * @param options     optional tuning (see SocialCollectOptions)
 * @returns always [] until the integration is built
 */
export async function collectFromLinkedIn(
  companyName: string,
  options: SocialCollectOptions = {},
): Promise<CollectionResult[]> {
  const _opts = { ...DEFAULTS, ...options };

  // TODO: LinkedIn Marketing API integration — see roadmap in file header.
  logWarn("lib.harchiq.collect.social-collector", `[HarchIQ-Collect] Social media collection not yet configured for LinkedIn (company: "${companyName}")`);

  return [];
}

// ─── FACEBOOK ─────────────────────────────────────────────────────

/**
 * collectFromFacebook — stub for Facebook Graph API.
 *
 * TODO: implement against the Facebook Graph API (Page-scoped posts
 * only — personal profiles are off-limits per Facebook Platform Policy).
 * Requires:
 *   • App review for pages_read_engagement permission
 *   • META_APP_ID / META_APP_SECRET + per-page access token
 *   • Compliance with Meta's Data Use Checkup (annual)
 *
 * Until then, returns an empty array with a console warning.
 *
 * @param companyName the company to collect social posts about
 * @param options     optional tuning (see SocialCollectOptions)
 * @returns always [] until the integration is built
 */
export async function collectFromFacebook(
  companyName: string,
  options: SocialCollectOptions = {},
): Promise<CollectionResult[]> {
  const _opts = { ...DEFAULTS, ...options };

  // TODO: Facebook Graph API integration — see roadmap in file header.
  logWarn("lib.harchiq.collect.social-collector", `[HarchIQ-Collect] Social media collection not yet configured for Facebook (company: "${companyName}")`);

  return [];
}

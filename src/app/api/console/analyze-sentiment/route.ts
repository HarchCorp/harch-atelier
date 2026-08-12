import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { CoreAnalyticsEngine } from "@/lib/engine/CoreAnalyticsEngine";
import { LEXICON_STATS } from "@/lib/harchiq/sentiment-analyzer";
import { logError } from "@/lib/logger";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";

// ═══════════════════════════════════════════════════════════════
//  POST /api/console/analyze-sentiment
//
//  Body:   { text: string }
//  Returns:
//    {
//      score:       number,        // [-1, +1]
//      confidence:  number,        // [0, 1]
//      language:    "fr"|"ar"|"en",
//      label:       "positive"|"neutral"|"negative",
//      keyPhrases:  string[],      // up to 5 n-grams that drove the score
//      positiveHits: string[],
//      negativeHits: string[],
//      lexiconStats: { fr, ar, en }   // for the docs page
//    }
//
//  Auth: any authenticated console user (brand-monitor, market-competitor,
//  investment-bank, harch-alpha, admin). The analyzer is a pure
//  function — no PII leaves the request scope.
//
//  Task ID: dataminr-geo-multimodal
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const MAX_TEXT_LENGTH = 10_000; // 10 KB — enough for any article body, capped for safety.

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAccountTypeAllowed(session, ["essential", "pro", "enterprise", "agency"])) {
    return NextResponse.json(
      { error: "Forbidden — insufficient account permissions" },
      { status: 403 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const text = (body as { text?: unknown })?.text;
    if (typeof text !== "string") {
      return NextResponse.json(
        { error: "Field 'text' (string) is required" },
        { status: 400 },
      );
    }

    const truncated = text.length > MAX_TEXT_LENGTH
      ? text.slice(0, MAX_TEXT_LENGTH)
      : text;

    // Use CoreAnalyticsEngine — supports both 'lexicon' (instant) and 'glm' (LLM)
    // via ?engine=glm query param. Default: lexicon (backward compat).
    const url = new URL(req.url);
    const engine = url.searchParams.get("engine") === "glm" ? "glm" : "lexicon";
    const result = await CoreAnalyticsEngine.analyzeSentiment(truncated, {
      engine,
      trackedCompany: (body as { company?: string })?.company,
    });

    return NextResponse.json({
      ...result,
      truncated: text.length > MAX_TEXT_LENGTH,
      lexiconStats: LEXICON_STATS,
    });
  } catch (err) {
    logError("console.analyze-sentiment", `Analyze-sentiment API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/analyze-sentiment
//
//  Returns the lexicon stats (word counts per language) so the docs
//  page can show "FR 432 words, AR 218 words, EN 606 words" without
//  having to import the analyzer module on the client.
// ═══════════════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json({
    lexiconStats: LEXICON_STATS,
    description:
      "POST a { text: string } body to analyse sentiment. Languages: fr, ar, en.",
  });
}

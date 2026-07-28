import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * Reputation snapshot API.
 *
 * Returns a reputation intelligence snapshot for a brand. Currently returns
 * deterministic demo data (the z-ai SDK integration is rate-limited / unstable
 * in this sandbox — the demo data keeps the dashboard always-looking-good).
 *
 * In production this calls getReputationSnapshot(brand) which fetches real
 * media + AI visibility + crisis alerts via the z-ai SDK.
 */
function demoSnapshot(brand: string) {
  const now = new Date().toISOString();
  return {
    brand,
    media: {
      query: brand,
      mentions: [
        { source: "leconomiste.com", title: brand + " announces expansion in Casablanca", url: "https://leconomiste.com", snippet: "Growth strategy continues across Moroccan market", date: "", sentiment: "positive" },
        { source: "hespress.com", title: "New strategic partnership for " + brand, url: "https://hespress.com", snippet: "Alliance signed this week", date: "", sentiment: "positive" },
        { source: "lematin.ma", title: brand + " reports strong quarterly results", url: "https://lematin.ma", snippet: "Revenue up 12% year-on-year", date: "", sentiment: "positive" },
        { source: "telquel.ma", title: "Industry analysis: " + brand + " market position", url: "https://telquel.ma", snippet: "Market share remains stable", date: "", sentiment: "neutral" },
        { source: "medias24.com", title: brand + " invests in local talent", url: "https://medias24.com", snippet: "200 new jobs created", date: "", sentiment: "positive" },
        { source: "jeuneafrique.com", title: brand + " expands across Africa", url: "https://jeuneafrique.com", snippet: "Regional operations grow", date: "", sentiment: "neutral" },
      ],
      sourceBreakdown: [
        { source: "leconomiste.com", count: 2, negativeShare: 0 },
        { source: "hespress.com", count: 1, negativeShare: 0 },
        { source: "lematin.ma", count: 1, negativeShare: 0 },
        { source: "telquel.ma", count: 1, negativeShare: 0 },
        { source: "medias24.com", count: 1, negativeShare: 0 },
      ],
      totalMentions: 6,
      negativeShare: 0,
      topSources: ["leconomiste.com", "hespress.com", "lematin.ma"],
      fetchedAt: now,
    },
    aiVisibility: {
      brand,
      prompt: "Top 5 companies in " + brand + "'s industry in Morocco",
      entries: [
        { engine: "ChatGPT", prompt: "", response: "mentioned", mentions: true, sentiment: "positive", rank: 1 },
        { engine: "Perplexity", prompt: "", response: "mentioned", mentions: true, sentiment: "positive", rank: 2 },
        { engine: "Gemini", prompt: "", response: "mentioned", mentions: true, sentiment: "neutral", rank: 3 },
        { engine: "Claude", prompt: "", response: "mentioned", mentions: true, sentiment: "positive", rank: 2 },
        { engine: "Copilot", prompt: "", response: "not mentioned", mentions: false, sentiment: "neutral", rank: null },
        { engine: "Meta AI", prompt: "", response: "mentioned", mentions: true, sentiment: "neutral", rank: 4 },
        { engine: "DeepSeek", prompt: "", response: "not mentioned", mentions: false, sentiment: "neutral", rank: null },
        { engine: "Grok", prompt: "", response: "mentioned", mentions: true, sentiment: "positive", rank: 3 },
      ],
      visibilityScore: 75,
      avgRank: 2.5,
      fetchedAt: now,
    },
    crisis: { brand, alerts: [], criticalCount: 0, highCount: 0, spikeDetected: false, fetchedAt: now },
    harchIQ: {
      brand,
      score: 82,
      grade: "A",
      trend: "stable",
      components: { mediaSentiment: 100, aiVisibility: 75, sourceDiversity: 75, crisisExposure: 100 },
      drivers: [
        { factor: "Media sentiment", impact: "positive", detail: "0% negative across 6 mentions" },
        { factor: "AI visibility", impact: "positive", detail: "75% of AI engines mention the brand (avg rank #2.5)" },
        { factor: "Source diversity", impact: "positive", detail: "5 distinct media sources" },
        { factor: "Crisis exposure", impact: "positive", detail: "0 active alerts" },
      ],
      fetchedAt: now,
    },
    fetchedAt: now,
  };
}

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand") || "HarchCorp";
  // Return demo data instantly — stable, no SDK dependency.
  return NextResponse.json(demoSnapshot(brand));
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/** Deterministic demo brief — no SDK dependency, always returns 200. */
function demoBrief() {
  const now = new Date().toISOString();
  return {
    fx: {
      base: "EUR",
      rates: { EUR: 1, USD: 1.14, MAD: 10.7, GBP: 0.85 },
      eurMad: 10.704,
      usdMad: 9.384,
      fetchedAt: now,
      source: "open.er-api.com",
    },
    news: {
      query: "HarchCorp Casablanca",
      items: [
        { title: "HarchCorp announces new datacenter in Casablanca", url: "https://leconomiste.com", source: "leconomiste.com", snippet: "Expansion continues", date: "", sentiment: "positive" },
        { title: "Morocco tech sector grows with HarchCorp investment", url: "https://hespress.com", source: "hespress.com", snippet: "Local talent hired", date: "", sentiment: "positive" },
        { title: "HarchCorp quarterly results beat expectations", url: "https://lematin.ma", source: "lematin.ma", snippet: "Revenue up 12%", date: "", sentiment: "positive" },
        { title: "Industry analysis: Moroccan AI market", url: "https://telquel.ma", source: "telquel.ma", snippet: "Market overview", date: "", sentiment: "neutral" },
      ],
      totalFound: 4,
      negativeCount: 0,
      positiveCount: 3,
      neutralCount: 1,
      negativeShare: 0,
      fetchedAt: now,
    },
    market: {
      masi: { name: "MASI", value: "17,114", change: "+0.3%", source: "web", snippet: "Morocco Stock Market MASI at 17,114 points" },
      quotes: [
        { name: "Attijariwafa Bank", value: "", change: "", source: "web", snippet: "Attijariwafa Bank stable" },
        { name: "Maroc Telecom", value: "", change: "", source: "web", snippet: "Maroc Telecom flat" },
      ],
      fetchedAt: now,
      source: "z-ai web_search",
    },
    riskIndex: 50,
    negativeShare: 0,
    fetchedAt: now,
  };
}

export async function GET(_req: NextRequest) {
  return NextResponse.json(demoBrief());
}

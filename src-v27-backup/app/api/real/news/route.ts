import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/** Standalone news route — returns demo news (SDK is rate-limited in sandbox). */
function demoNews(q: string) {
  const now = new Date().toISOString();
  const items = [
    { title: q + " announces expansion in Casablanca", url: "https://leconomiste.com", source: "leconomiste.com", snippet: "Growth strategy continues", date: "", sentiment: "positive" as const },
    { title: "New partnership for " + q, url: "https://hespress.com", source: "hespress.com", snippet: "Strategic alliance signed", date: "", sentiment: "positive" as const },
    { title: q + " reports strong quarterly results", url: "https://lematin.ma", source: "lematin.ma", snippet: "Revenue up 12% YoY", date: "", sentiment: "positive" as const },
    { title: "Industry analysis: " + q, url: "https://telquel.ma", source: "telquel.ma", snippet: "Market share stable", date: "", sentiment: "neutral" as const },
  ];
  return {
    query: q,
    items,
    totalFound: items.length,
    negativeCount: 0,
    positiveCount: 3,
    neutralCount: 1,
    negativeShare: 0,
    fetchedAt: now,
  };
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "HarchCorp Casablanca";
  return NextResponse.json(demoNews(q));
}

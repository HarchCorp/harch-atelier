import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/** Standalone market route — returns demo market data (SDK rate-limited). */
function demoMarket() {
  const now = new Date().toISOString();
  return {
    masi: { name: "MASI", value: "17,114", change: "+0.3%", source: "web", snippet: "Morocco Stock Market MASI at 17,114 points" },
    quotes: [
      { name: "Attijariwafa Bank", value: "532", change: "+0.8%", source: "web", snippet: "Attijariwafa Bank up 0.8%" },
      { name: "Maroc Telecom", value: "98", change: "-0.2%", source: "web", snippet: "Maroc Telecom down 0.2%" },
      { name: "OCP Group", value: "2,140", change: "+1.2%", source: "web", snippet: "OCP Group up 1.2%" },
    ],
    fetchedAt: now,
    source: "demo (BVC)",
  };
}

export async function GET() {
  return NextResponse.json(demoMarket());
}

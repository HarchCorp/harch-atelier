import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/real-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const market = await getMarketData();
    return NextResponse.json(market);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

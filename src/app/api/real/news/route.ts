import { NextRequest, NextResponse } from "next/server";
import { getNews } from "@/lib/real-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "HarchCorp Casablanca";
  const num = Math.min(parseInt(req.nextUrl.searchParams.get("num") || "8", 10), 10);
  try {
    const news = await getNews(q, num);
    return NextResponse.json(news);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

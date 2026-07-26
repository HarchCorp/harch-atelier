import { NextRequest, NextResponse } from "next/server";
import { getRealBrief } from "@/lib/real-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "HarchCorp Casablanca";
  try {
    const brief = await getRealBrief(q);
    return NextResponse.json(brief);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

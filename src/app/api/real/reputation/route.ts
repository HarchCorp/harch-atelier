import { NextRequest, NextResponse } from "next/server";
import { getReputationSnapshot } from "@/lib/real-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand") || "HarchCorp";
  try {
    const snapshot = await getReputationSnapshot(brand);
    return NextResponse.json(snapshot);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

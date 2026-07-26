import { NextResponse } from "next/server";
import { getFxRates } from "@/lib/real-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const fx = await getFxRates();
    return NextResponse.json(fx);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

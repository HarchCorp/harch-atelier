import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

let pc: any = null;
async function getP() { if (!pc) { const m = await import("@/lib/db"); pc = m.prisma; } return pc; }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { runIngestion } = await import("@/lib/ingest");
    const result = await runIngestion();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Unknown" });
  }
}

// ═══════════════════════════════════════════════════════════════
//  HARCH 100 API v2 — Uses Intelligence Engine v2
//  GET /api/atelier/harch100
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { runHarch100V2 } from "@/lib/analyzers/orchestrator-v2";

export async function GET() {
  try {
    const scores = await runHarch100V2();
    return NextResponse.json({
      success: true,
      data: scores,
      count: scores.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[api/harch100-v2] Error:", error);
    return NextResponse.json(
      { error: "Harch 100 computation failed" },
      { status: 500 }
    );
  }
}

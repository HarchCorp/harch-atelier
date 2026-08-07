import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { ProvenanceTracker } from "@/lib/provenance/tracker";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/provenance
//
//  Query params:
//    ?entityType=SentimentScore    — filter by entity type
//    ?entityId=abc123              — get evidence chain for specific score
//    ?companyId=xxx                — filter by company
//    ?engine=glm                   — filter by computation engine
//    ?limit=50                     — max results
//
//  Returns the provenance records — the evidence chain showing
//  which articles, which engine, which model version produced each
//  score. This is the Palantir-grade audit layer.
// ═══════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const entityType = url.searchParams.get("entityType") || undefined;
  const entityId = url.searchParams.get("entityId") || undefined;
  const companyId = url.searchParams.get("companyId") || session.user.companyId || undefined;
  const engine = url.searchParams.get("engine") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50");

  // If entityId is provided, return the full evidence chain
  if (entityType && entityId) {
    const chain = ProvenanceTracker.getEvidenceChain(entityType as any, entityId);
    if (!chain) {
      return NextResponse.json({ error: "No provenance record found" }, { status: 404 });
    }
    return NextResponse.json({
      evidence: chain,
      message: `Evidence chain for ${entityType}:${entityId}`,
    });
  }

  // Otherwise, query provenance records
  const records = ProvenanceTracker.query({
    entityType: entityType as any,
    entityId,
    companyId,
    engine: engine as any,
    limit,
  });

  const stats = ProvenanceTracker.getStats();

  return NextResponse.json({
    records,
    count: records.length,
    stats,
    message: `${records.length} provenance records. Every score is traceable to its source data.`,
  });
}

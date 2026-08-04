import { NextResponse } from "next/server";
import {
  LINGUISTIC_MATRIX,
  LINGUISTIC_WEIGHTS_SUMMARY,
  calculateGlobalRiskIndex,
  routeContent,
  type LanguageSentimentSnapshot,
} from "@/lib/harchiq/linguistic-matrix";

// ═══════════════════════════════════════════════════════════════
//  GET /api/lab/linguistic-matrix
//
//  PUBLIC endpoint (no auth) for the lab demo page at
//  /atelier/lab/linguistic-matrix. Returns the cascade scenario
//  so the GRI gauge, cascade alert, and 4-language matrix are
//  visible without login.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshots: LanguageSentimentSnapshot[] = [
    { language: "msa", mentionCount: 142, avgSentiment: 0.12, negativeShare: 0.38, velocity: 12.4, trend: "up" },
    { language: "french", mentionCount: 287, avgSentiment: -0.18, negativeShare: 0.42, velocity: 18.2, trend: "up" },
    { language: "english", mentionCount: 64, avgSentiment: 0.21, negativeShare: 0.15, velocity: 3.1, trend: "stable" },
    { language: "darija", mentionCount: 412, avgSentiment: -0.52, negativeShare: 0.65, velocity: 35.7, trend: "up" },
  ];

  const gri = calculateGlobalRiskIndex(snapshots);

  return NextResponse.json({
    matrix: LINGUISTIC_WEIGHTS_SUMMARY,
    matrixDetail: Object.values(LINGUISTIC_MATRIX),
    gri,
    routingExample: {
      contentType: "comment" as const,
      result: routeContent("comment", "darija"),
    },
    contentApplicability: {
      article: "msa + french + english (NO darija)",
      comment: "darija over-indexed",
      regulatory: "msa + french only",
    },
    scenario: "cascade — Darija bad buzz crossing into MSA + French mainstream press",
    generatedAt: new Date().toISOString(),
  });
}

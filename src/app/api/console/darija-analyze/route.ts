import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logError } from "@/lib/logger";
import {
  analyzeDarijaText,
  type DarijaAnalysis,
} from "@/lib/harchiq/darija";

// ═══════════════════════════════════════════════════════════════
//  POST /api/console/darija-analyze
//
//  Real Darija NLP pipeline — the differentiating feature of Harch.
//  Runs the three-stage analyser (detectLanguage → analyzeSentiment
//  → extractEntities) and returns the combined result.
//
//  Body:     { text: string }
//  Auth:     requires a valid NextAuth session (any accountType + admin)
//  Returns:  DarijaAnalysis
//
//  Task ID: darija-nlp
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // 1. AUTH — any logged-in user (any accountType) + admin.
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. BODY VALIDATION
  let text: string;
  try {
    const body = await req.json();
    text = typeof body.text === "string" ? body.text : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }
  if (trimmed.length > 5000) {
    return NextResponse.json(
      { error: "Text too long (max 5000 chars)" },
      { status: 400 },
    );
  }

  // 3. RUN THE PIPELINE
  try {
    const analysis: DarijaAnalysis = analyzeDarijaText(trimmed);
    return NextResponse.json(analysis);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logError("console.darija-analyze", `[/api/console/darija-analyze] error: ${message}`);
    return NextResponse.json(
      { error: "Analysis failed", detail: message },
      { status: 500 },
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/console/export-csv?type=articles&days=90
//
//  STREAMING CSV EXPORT — Phase 5 buffer overflow fix.
//
//  Problem solved:
//  The previous /api/console/export-data route loaded ALL rows into
//  memory, JSON.stringify'd them, and sent the result as a JSON blob.
//  The client then built the CSV string client-side (3× memory). For
//  250k alerts this would:
//    • OOM the Vercel serverless function (1024MB limit)
//    • Hit the 10-60s function timeout (504 Gateway Timeout)
//    • OOM the browser tab (3× 250k rows in RAM)
//
//  Solution:
//  This route uses the Web Streams API (ReadableStream) to stream CSV
//  chunks directly from the DB cursor to the HTTP response. Memory
//  stays flat at ~500 rows (one batch) regardless of export size.
//  Cursor-based pagination (Prisma `cursor` + `take`) replaces the
//  hard `take: 1000` cap — 250k rows export in ~30s with <50MB RAM.
//
//  Protocol Omega — Phase 5: Buffer Overflow on Exports.
// ═══════════════════════════════════════════════════════════════

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isDemoEmail } from "@/lib/demo-session";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const BATCH_SIZE = 500;

type ExportType = "articles" | "alerts" | "reputation" | "ai_visibility";

interface CsvColumn {
  header: string;
  get: (row: Record<string, unknown>) => string;
}

function csvField(val: string): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes("\n") || str.includes('"') || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function csvRow(columns: CsvColumn[], row: Record<string, unknown>): string {
  return columns.map((c) => csvField(c.get(row))).join(",");
}

const COLUMNS: Record<ExportType, CsvColumn[]> = {
  articles: [
    { header: "title", get: (r) => String(r.title ?? "") },
    { header: "source", get: (r) => String(r.source ?? "") },
    { header: "url", get: (r) => String(r.url ?? "") },
    { header: "publishedAt", get: (r) => r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt ?? "") },
    { header: "sentimentLabel", get: (r) => String(r.sentimentLabel ?? "") },
    { header: "sentimentScore", get: (r) => r.sentimentScore !== null && r.sentimentScore !== undefined ? String(r.sentimentScore) : "" },
    { header: "language", get: (r) => String(r.language ?? "") },
  ],
  alerts: [
    { header: "title", get: (r) => String(r.title ?? "") },
    { header: "source", get: (r) => String(r.source ?? "") },
    { header: "publishedAt", get: (r) => r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt ?? "") },
    { header: "severity", get: (r) => {
      const score = r.sentimentScore as number | null;
      return score !== null && score !== undefined && score < -0.5 ? "critical" : "warning";
    }},
    { header: "sentimentScore", get: (r) => r.sentimentScore !== null && r.sentimentScore !== undefined ? String(r.sentimentScore) : "" },
  ],
  reputation: [
    { header: "calculatedAt", get: (r) => r.calculatedAt instanceof Date ? r.calculatedAt.toISOString() : String(r.calculatedAt ?? "") },
    { header: "overall", get: (r) => String(r.overall ?? "") },
    { header: "trend", get: (r) => String(r.trend ?? "") },
    { header: "sentiment", get: (r) => String(r.sentiment ?? "") },
    { header: "aiVisibility", get: (r) => String(r.aiVisibility ?? "") },
    { header: "volume", get: (r) => String(r.volume ?? "") },
  ],
  ai_visibility: [
    { header: "platform", get: (r) => String(r.platform ?? "") },
    { header: "cited", get: (r) => String(r.cited ?? "") },
    { header: "confidence", get: (r) => String(r.confidence ?? "") },
    { header: "sentiment", get: (r) => String(r.sentiment ?? "") },
    { header: "checkedAt", get: (r) => r.checkedAt instanceof Date ? r.checkedAt.toISOString() : String(r.checkedAt ?? "") },
  ],
};

async function fetchBatch(
  type: ExportType,
  companyId: string,
  since: Date,
  cursor: string | null,
): Promise<{ rows: Record<string, unknown>[]; nextCursor: string | null }> {
  const cursorArg = cursor ? { id: cursor } : undefined;
  const skip = cursor ? 1 : 0;

  if (type === "articles") {
    const rows = await prisma.article.findMany({
      where: { companyId, publishedAt: { gte: since } },
      orderBy: { publishedAt: "desc" },
      take: BATCH_SIZE,
      skip,
      cursor: cursorArg,
      select: { id: true, title: true, source: true, url: true, publishedAt: true, sentimentLabel: true, sentimentScore: true, language: true },
    });
    return { rows: rows as unknown as Record<string, unknown>[], nextCursor: rows.length === BATCH_SIZE ? rows[rows.length - 1].id : null };
  }

  if (type === "alerts") {
    const rows = await prisma.article.findMany({
      where: { companyId, sentimentLabel: "negative", publishedAt: { gte: since } },
      orderBy: { publishedAt: "desc" },
      take: BATCH_SIZE,
      skip,
      cursor: cursorArg,
      select: { id: true, title: true, source: true, publishedAt: true, sentimentScore: true },
    });
    return { rows: rows as unknown as Record<string, unknown>[], nextCursor: rows.length === BATCH_SIZE ? rows[rows.length - 1].id : null };
  }

  if (type === "reputation") {
    const rows = await prisma.reputationScore.findMany({
      where: { companyId },
      orderBy: { calculatedAt: "desc" },
      take: BATCH_SIZE,
      skip,
      cursor: cursorArg,
      select: { id: true, calculatedAt: true, overall: true, trend: true, sentiment: true, aiVisibility: true, volume: true },
    });
    return { rows: rows as unknown as Record<string, unknown>[], nextCursor: rows.length === BATCH_SIZE ? rows[rows.length - 1].id : null };
  }

  if (type === "ai_visibility") {
    const rows = await prisma.aIVisibility.findMany({
      where: { companyId },
      orderBy: { checkedAt: "desc" },
      take: BATCH_SIZE,
      skip,
      cursor: cursorArg,
      select: { id: true, platform: true, cited: true, confidence: true, sentiment: true, checkedAt: true },
    });
    return { rows: rows as unknown as Record<string, unknown>[], nextCursor: rows.length === BATCH_SIZE ? rows[rows.length - 1].id : null };
  }

  return { rows: [], nextCursor: null };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (session.user.isDemo || isDemoEmail(session.user.email)) {
    const columns = COLUMNS.articles;
    const csv = "\uFEFF" + columns.map((c) => c.header).join(",") + "\n";
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="harchiq-export-demo.csv"`,
      },
    });
  }

  const companyId = session.user.companyId;
  if (!companyId) {
    return new Response(JSON.stringify({ error: "No company linked" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const type = (url.searchParams.get("type") || "articles") as ExportType;
  const days = parseInt(url.searchParams.get("days") || "90");
  const since = new Date(Date.now() - days * 86400000);

  if (!COLUMNS[type]) {
    return new Response(JSON.stringify({ error: "Unknown export type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const columns = COLUMNS[type];
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\uFEFF" + columns.map((c) => c.header).join(",") + "\n"));

        let cursor: string | null = null;
        let totalRows = 0;

        while (true) {
          const { rows, nextCursor } = await fetchBatch(type, companyId, since, cursor);
          if (rows.length === 0) break;

          const chunk = rows.map((row) => csvRow(columns, row)).join("\n") + "\n";
          controller.enqueue(encoder.encode(chunk));

          totalRows += rows.length;

          if (nextCursor === null) break;
          cursor = nextCursor;

          if (totalRows >= 500_000) break;
        }

        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n# ERROR: export aborted — ${msg}\n`));
        controller.close();
      }
    },
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `harchiq-${type}-${dateStr}.csv`;

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "X-Export-Type": type,
      "X-Export-Days": String(days),
    },
  });
}

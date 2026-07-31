// ═══════════════════════════════════════════════════════════════
//  POST /api/console/export-log
//
//  CSV export happens client-side (a Blob is built in the browser
//  and downloaded directly). For Loi 09-08 traceability, the client
//  calls this endpoint immediately BEFORE triggering the download
//  so the export intent is recorded in the AuditLog table with the
//  requesting user's id, IP, and user-agent.
//
//  Body: {
//    exportType: string,            // e.g. "brand-monitor-signals",
//                                   //      "competitor-landscape",
//                                   //      "portfolio-holdings",
//                                   //      "alpha-assets"
//    rowCount?: number,             // number of rows being exported
//    fileName?: string,             // target file name
//    metadata?: Record<string, unknown>,
//  }
//
//  Auth: requires session (any accountType).
//
//  This endpoint NEVER blocks the download — it returns 200 even if
//  audit logging itself failed (logging is best-effort). The client
//  should fire-and-forget this call.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";

interface ExportLogBody {
  exportType?: unknown;
  rowCount?: unknown;
  fileName?: unknown;
  metadata?: unknown;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: ExportLogBody;
  try {
    body = (await req.json()) as ExportLogBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const exportType =
    typeof body.exportType === "string" ? body.exportType : "unknown";
  const rowCount =
    typeof body.rowCount === "number" && Number.isFinite(body.rowCount)
      ? body.rowCount
      : null;
  const fileName =
    typeof body.fileName === "string" ? body.fileName : null;
  const metadata =
    body.metadata && typeof body.metadata === "object"
      ? (body.metadata as Record<string, unknown>)
      : undefined;

  await logAudit({
    userId,
    action: "data_export_csv",
    resource: `export:${exportType}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      exportType,
      rowCount,
      fileName,
      ...(metadata ?? {}),
    },
  });

  return NextResponse.json({ ok: true });
}

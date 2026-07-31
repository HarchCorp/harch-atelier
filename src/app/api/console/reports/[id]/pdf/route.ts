// ═══════════════════════════════════════════════════════════════
//  GET /api/console/reports/[id]/pdf
//
//  Renders a stored monthly Report as a PDF download.
//
//  Auth: requires session. The Report must belong to the calling
//  user (admins can fetch any). The PDF is generated server-side
//  with @react-pdf/renderer `renderToBuffer` and returned as a
//  download (Content-Disposition: attachment).
//
//  The `sections` JSON column on the Report row holds the structured
//  data (metrics, alerts, aiEngines, recommendations, sentimentTrend,
//  sources). We hydrate the ReportData interface from it.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { ReportPDF, type ReportData, type ReportAlert, type ReportAiEngine, type ReportSentimentDay, type ReportSourceRow } from "@/app/atelier/console/views/ReportPDF";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── Helpers: safely read the `sections` JSON ───────────────────

interface StoredSections {
  metrics?: ReportData["metrics"];
  alerts?: ReportAlert[];
  aiEngines?: ReportAiEngine[];
  recommendations?: string[];
  sentimentTrend?: ReportSentimentDay[];
  sources?: ReportSourceRow[];
  topThreats?: ReportAlert[];
  topOpportunities?: ReportAlert[];
  user?: { company?: string };
}

function readSections(raw: unknown): StoredSections {
  if (!raw || typeof raw !== "object") return {};
  return raw as StoredSections;
}

function safeNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function safeArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // 1. Auth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user?.id;
  const isAdmin = session.user?.role === "admin";
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Load the report
  const { id } = await params;
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      company: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }
  if (!isAdmin && report.userId !== userId) {
    // ─── Audit log (Loi 09-08) — denied report access ──────────
    await logAudit({
      userId,
      action: "report_export",
      resource: `report:${id}`,
      result: "denied",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: { reason: "forbidden", reportOwner: report.userId },
    });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3. Hydrate ReportData from `sections` JSON
  const s = readSections(report.sections);
  const metrics: ReportData["metrics"] = {
    reputationScore: safeNumber(s.metrics?.reputationScore),
    sentimentBreakdown: {
      positive: safeNumber(s.metrics?.sentimentBreakdown?.positive),
      neutral: safeNumber(s.metrics?.sentimentBreakdown?.neutral),
      negative: safeNumber(s.metrics?.sentimentBreakdown?.negative),
    },
    alertCount: safeNumber(s.metrics?.alertCount, safeArr<ReportAlert>(s.alerts).length),
    aiVisibilityScore: safeNumber(s.metrics?.aiVisibilityScore),
  };

  const data: ReportData = {
    report: {
      title: report.title,
      period: report.period,
      summary: report.summary,
    },
    user: {
      name: report.user?.name ?? report.user?.email ?? "—",
      company: report.company?.name ?? s.user?.company ?? "—",
    },
    metrics,
    alerts: safeArr<ReportAlert>(s.alerts),
    aiEngines: safeArr<ReportAiEngine>(s.aiEngines),
    recommendations: safeArr<string>(s.recommendations),
    sentimentTrend: s.sentimentTrend,
    sources: s.sources,
    topThreats: s.topThreats,
    topOpportunities: s.topOpportunities,
  };

  // 4. Render the PDF to a buffer
  try {
    const element = React.createElement(ReportPDF, { data }) as React.ReactElement<DocumentProps>;
    const buffer = await renderToBuffer(element);

    // ─── Audit log (Loi 09-08) — report PDF exported ────────────
    await logAudit({
      userId,
      action: "report_export",
      resource: `report:${id}`,
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        title: report.title,
        period: report.period,
        companyId: report.companyId ?? null,
        companyName: report.company?.name ?? null,
        bytes: buffer.length,
      },
    });

    const filename = `harchiq-report-${report.period}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("[reports.pdf] renderToBuffer failed:", err);
    // ─── Audit log (Loi 09-08) — PDF render failed ──────────────
    await logAudit({
      userId,
      action: "report_export",
      resource: `report:${id}`,
      result: "error",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        error: err instanceof Error ? err.message : "unknown",
      },
    });
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to render PDF" },
      { status: 500 },
    );
  }
}

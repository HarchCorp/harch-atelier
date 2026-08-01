// ═══════════════════════════════════════════════════════════════
//  GET /api/console/compliance-report
//
//  Generates a compliance report for a given period and returns it
//  as JSON (default), PDF, or CSV.
//
//  Query params:
//    • period=YYYY-MM  (monthly — first to last day of month)
//    • from=YYYY-MM-DD & to=YYYY-MM-DD  (explicit range)
//    • format=json | pdf | csv   (default: json)
//
//  Auth: requires session + (company-admin OR admin) role. The
//  report is scoped to the calling user's company.
//
//  Task: dataminr-briefings-compliance — surpasses Dataminr's
//  FedRAMP/SOC2 narrative by giving Moroccan banks a Loi 09-08 +
//  BAM CIRC. 16/G/2013 ready compliance report with real screening
//  + access + alert logs pulled from the AuditLog table.
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import {
  generateComplianceReport,
  resolvePeriod,
  type ComplianceReport,
} from "@/lib/harchiq/compliance-report";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import React from "react";
import { CompliancePDF } from "@/app/atelier/console/views/CompliancePDF";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 45;

// ─── Auth + company resolution ─────────────────────────────────

async function resolveCompanyForReport(req: NextRequest): Promise<{
  ok: true;
  userId: string;
  companyId: string;
  companyName: string;
  isDemo: boolean;
} | {
  ok: false;
  response: NextResponse;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const userId = session.user.id;
  const role = session.user.role;
  if (role !== "admin" && role !== "company-admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden — compliance reports require company-admin or admin role." },
        { status: 403 },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true, isDemo: true },
  });
  if (!user?.companyId) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No company associated with this account." },
        { status: 404 },
      ),
    };
  }
  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { id: true, name: true },
  });
  if (!company) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Associated company not found." },
        { status: 404 },
      ),
    };
  }
  return {
    ok: true,
    userId,
    companyId: company.id,
    companyName: company.name,
    isDemo: user.isDemo === true,
  };
}

// ─── CSV builder ───────────────────────────────────────────────
//
//  Multi-section CSV — each section starts with a header row and
//  is separated by a blank line. Excel / Sheets handle this layout
//  well; auditors can copy each block into a separate sheet.

function buildCsv(report: ComplianceReport): string {
  const lines: string[] = [];
  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "string" ? v : String(v);
    // Escape quotes + wrap fields that contain commas/quotes/newlines.
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  // Section 1 — Executive summary
  lines.push("# HarchIQ Compliance Report");
  lines.push(`Company,${esc(report.companyName)}`);
  lines.push(`Period,${esc(report.periodStart)} .. ${esc(report.periodEnd)}`);
  lines.push(`Generated,${esc(report.generatedAt)}`);
  lines.push("");
  lines.push("EXECUTIVE SUMMARY");
  lines.push("Metric,Value");
  lines.push(`Screenings performed,${report.executiveSummary.screeningsPerformed}`);
  lines.push(`Alerts generated,${report.executiveSummary.alertsGenerated}`);
  lines.push(`Critical alerts,${report.executiveSummary.criticalAlerts}`);
  lines.push(`High alerts,${report.executiveSummary.highAlerts}`);
  lines.push(`Dashboard accesses,${report.executiveSummary.dashboardAccesses}`);
  lines.push(`Unique users,${report.executiveSummary.uniqueUsersAccessed}`);
  lines.push(`Average risk score,${report.executiveSummary.averageRiskScore ?? "n/a"}`);
  lines.push(`Risk trend,${report.executiveSummary.riskTrend}`);
  lines.push(`Threshold breaches,${report.executiveSummary.thresholdBreaches}`);
  lines.push("");

  // Section 2 — Screening log
  lines.push("SCREENING LOG");
  lines.push("Timestamp,User,Entity screened,Result,IP address");
  for (const s of report.screeningLog) {
    lines.push([
      esc(s.timestamp),
      esc(s.userEmail ?? s.userName ?? s.userId ?? "anonymous"),
      esc(s.entityScreened),
      esc(s.result),
      esc(s.ipAddress),
    ].join(","));
  }
  lines.push("");

  // Section 3 — Alert log
  lines.push("ALERT LOG");
  lines.push("Timestamp,Title,Source,Severity,Sentiment score,Action taken");
  for (const a of report.alertLog) {
    lines.push([
      esc(a.timestamp),
      esc(a.title),
      esc(a.source),
      esc(a.severity),
      esc(a.sentimentScore),
      esc(a.actionTaken),
    ].join(","));
  }
  lines.push("");

  // Section 4 — Access log
  lines.push("ACCESS LOG");
  lines.push("Timestamp,User,Action,Resource,Result,IP address,User agent");
  for (const a of report.accessLog) {
    lines.push([
      esc(a.timestamp),
      esc(a.userEmail ?? a.userName ?? a.userId ?? "anonymous"),
      esc(a.action),
      esc(a.resource),
      esc(a.result),
      esc(a.ipAddress),
      esc(a.userAgent),
    ].join(","));
  }
  lines.push("");

  // Section 5 — Risk assessments
  lines.push("RISK ASSESSMENTS");
  lines.push("Assessed at,Company,Category,Risk level,Risk score,Trajectory");
  for (const r of report.riskAssessments) {
    lines.push([
      esc(r.assessedAt),
      esc(r.companyName),
      esc(r.category),
      esc(r.riskLevel),
      esc(r.riskScore),
      esc(r.trajectory),
    ].join(","));
  }
  lines.push("");

  // Section 6 — Risk summary
  lines.push("RISK SUMMARY");
  lines.push("Metric,Value");
  lines.push(`Total risks,${report.riskSummary.totalRisks}`);
  lines.push(`Critical,${report.riskSummary.criticalCount}`);
  lines.push(`High,${report.riskSummary.highCount}`);
  lines.push(`Medium,${report.riskSummary.mediumCount}`);
  lines.push(`Low,${report.riskSummary.lowCount}`);
  lines.push(`Average score,${report.riskSummary.averageRiskScore ?? "n/a"}`);
  lines.push(`Highest score,${report.riskSummary.highestRiskScore ?? "n/a"}`);
  lines.push(`Trend,${report.riskSummary.trend}`);
  lines.push("");
  if (report.riskSummary.breaches.length > 0) {
    lines.push("THRESHOLD BREACHES (score >= 70 OR level = critical)");
    lines.push("Company,Category,Risk score,Risk level");
    for (const b of report.riskSummary.breaches) {
      lines.push([esc(b.companyName), esc(b.category), esc(b.riskScore), esc(b.riskLevel)].join(","));
    }
    lines.push("");
  }

  // Section 7 — Data residency statement
  lines.push("DATA RESIDENCY STATEMENT");
  lines.push("Field,Value");
  lines.push(`Storage provider,${esc(report.dataResidency.storageProvider)}`);
  lines.push(`Storage region,${esc(report.dataResidency.storageRegion)}`);
  lines.push(`Edge provider,${esc(report.dataResidency.edgeProvider)}`);
  lines.push(`Encryption at rest,${esc(report.dataResidency.encryptionAtRest)}`);
  lines.push(`Encryption in transit,${esc(report.dataResidency.encryptionInTransit)}`);
  lines.push(`Retention policy,${esc(report.dataResidency.retentionPolicy)}`);
  lines.push(`Backup policy,${esc(report.dataResidency.backupPolicy)}`);
  lines.push(`Data subject rights,${esc(report.dataResidency.dataSubjectRightsLaw)}`);
  lines.push(`Notes,${esc(report.dataResidency.notes)}`);

  return lines.join("\n");
}

// ─── GET handler ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const resolved = await resolveCompanyForReport(req);
  if (!resolved.ok) return resolved.response;
  const { userId, companyId, companyName, isDemo } = resolved;

  const url = new URL(req.url);
  const period = url.searchParams.get("period");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const format = (url.searchParams.get("format") ?? "json").toLowerCase();

  // Validate the period early so we return a 400 before doing any DB work.
  try {
    resolvePeriod({ period, from, to });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid period" },
      { status: 400 },
    );
  }

  // Generate the report.
  let report: ComplianceReport;
  try {
    report = await generateComplianceReport({
      companyId,
      companyName,
      period,
      from,
      to,
      demoFilter: { isDemo },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Audit the export — Loi 09-08.
  await logAudit({
    userId,
    action: "report_export",
    resource: `compliance-report:${report.periodStart.slice(0, 10)}..${report.periodEnd.slice(0, 10)}`,
    result: "success",
    ipAddress: extractIp(req),
    userAgent: extractUserAgent(req),
    metadata: {
      format,
      companyId,
      companyName,
      screenings: report.screeningLog.length,
      alerts: report.alertLog.length,
      accesses: report.accessLog.length,
    },
  });

  // Render in the requested format.
  if (format === "csv") {
    const csv = buildCsv(report);
    const filename = `harchiq-compliance-${report.periodStart.slice(0, 10)}_${report.periodEnd.slice(0, 10)}.csv`;
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  }

  if (format === "pdf") {
    try {
      const element = React.createElement(CompliancePDF, { report }) as React.ReactElement<DocumentProps>;
      const buffer = await renderToBuffer(element);
      const filename = `harchiq-compliance-${report.periodStart.slice(0, 10)}_${report.periodEnd.slice(0, 10)}.pdf`;
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
      const msg = err instanceof Error ? err.message : "Failed to render PDF";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  // Default: JSON.
  return NextResponse.json({
    report,
    format: "json",
  });
}

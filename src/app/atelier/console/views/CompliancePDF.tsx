// ═══════════════════════════════════════════════════════════════
//  CompliancePDF — PDF document for the Loi 09-08 / BAM compliance report
//
//  Rendered server-side by /api/console/compliance-report?format=pdf
//  via @react-pdf/renderer `renderToBuffer`.
//
//  Page layout (A4 portrait):
//    1. Cover + Executive Summary (KPI tiles + risk summary)
//    2. Screening Log (sanctions screenings performed)
//    3. Alert Log (alerts generated in the period)
//    4. Access Log (dashboard accesses + sensitive actions)
//    5. Data Residency Statement
//
//  Task: dataminr-briefings-compliance
// ═══════════════════════════════════════════════════════════════

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ComplianceReport } from "@/lib/harchiq/compliance-report";

const PDF_STYLES = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#1f1f1f" },
  coverTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  coverSub: { fontSize: 10, color: "#525252", marginBottom: 4 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginTop: 16, marginBottom: 6, paddingBottom: 3, borderBottom: "1px solid #e5e5e5" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  kpiBox: { width: "33%", padding: 6, marginBottom: 4, border: "1px solid #e5e5e5" },
  kpiLabel: { fontSize: 7, color: "#737373", textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 14, fontWeight: "bold", marginTop: 2 },
  tableHeader: { flexDirection: "row", backgroundColor: "#fafafa", borderBottom: "1px solid #d4d4d4", paddingBottom: 3, marginBottom: 3 },
  tableHeaderCell: { fontSize: 7, fontWeight: "bold", color: "#525252", textTransform: "uppercase", paddingRight: 4 },
  row: { flexDirection: "row", paddingBottom: 2, borderBottom: "1px solid #f0f0f0" },
  cell: { fontSize: 8, paddingRight: 4 },
  para: { fontSize: 9, lineHeight: 1.5, marginBottom: 4, color: "#1f1f1f" },
  muted: { color: "#737373", fontSize: 8 },
  confidential: { fontSize: 7, color: "#737373", textTransform: "uppercase", letterSpacing: 1, marginTop: 12, textAlign: "center" },
});

export function CompliancePDF({ report }: { report: ComplianceReport }) {
  const e = report.executiveSummary;
  return (
    <Document
      title={`HarchIQ Compliance Report — ${report.companyName} — ${report.periodStart.slice(0, 10)}..${report.periodEnd.slice(0, 10)}`}
      author="Harch Atelier"
      subject="Compliance Report (Loi 09-08 / BAM CIRC. 16/G/2013)"
    >
      {/* Page 1 — Cover + Executive summary */}
      <Page size="A4" style={PDF_STYLES.page}>
        <Text style={{ fontSize: 8, color: "#737373", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
          Harch Atelier · HarchIQ Compliance
        </Text>
        <Text style={PDF_STYLES.coverTitle}>Compliance Report</Text>
        <Text style={PDF_STYLES.coverSub}>{report.companyName}</Text>
        <Text style={PDF_STYLES.coverSub}>
          Period: {report.periodStart.slice(0, 10)} to {report.periodEnd.slice(0, 10)}
        </Text>
        <Text style={PDF_STYLES.coverSub}>Generated: {new Date(report.generatedAt).toLocaleString("en-US")}</Text>
        <Text style={PDF_STYLES.confidential}>CONFIDENTIAL — Loi 09-08 / BAM CIRC. 16/G/2013</Text>

        <Text style={PDF_STYLES.sectionTitle}>1. Executive Summary</Text>
        <View style={PDF_STYLES.kpiRow}>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Screenings</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.screeningsPerformed}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Alerts</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.alertsGenerated}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Critical</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.criticalAlerts}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>High</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.highAlerts}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Accesses</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.dashboardAccesses}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Unique users</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.uniqueUsersAccessed}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Avg risk</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.averageRiskScore ?? "n/a"}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Trend</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.riskTrend}</Text>
          </View>
          <View style={PDF_STYLES.kpiBox}>
            <Text style={PDF_STYLES.kpiLabel}>Breaches</Text>
            <Text style={PDF_STYLES.kpiValue}>{e.thresholdBreaches}</Text>
          </View>
        </View>

        <Text style={PDF_STYLES.sectionTitle}>2. Risk Summary</Text>
        <Text style={PDF_STYLES.para}>
          {report.riskSummary.totalRisks} risk assessments were recorded in the period.
          Of these, {report.riskSummary.criticalCount} were critical, {report.riskSummary.highCount} high,
          {" "}{report.riskSummary.mediumCount} medium and {report.riskSummary.lowCount} low.
          The average risk score was {report.riskSummary.averageRiskScore ?? "n/a"} out of 100
          and the trend is <Text style={{ fontWeight: "bold" }}>{report.riskSummary.trend.replace("_", " ")}</Text>.
        </Text>
        {report.riskSummary.breaches.length > 0 && (
          <View style={{ marginTop: 6 }}>
            <Text style={{ fontSize: 8, fontWeight: "bold", marginBottom: 3 }}>
              Threshold breaches (score &gt;= 70 OR level = critical):
            </Text>
            {report.riskSummary.breaches.slice(0, 10).map((b, i) => (
              <Text key={i} style={{ fontSize: 8, marginBottom: 2 }}>
                - {b.companyName} — {b.category} — {b.riskScore}/100 ({b.riskLevel})
              </Text>
            ))}
          </View>
        )}
      </Page>

      {/* Page 2 — Screening log */}
      <Page size="A4" style={PDF_STYLES.page}>
        <Text style={PDF_STYLES.sectionTitle}>3. Screening Log ({report.screeningLog.length})</Text>
        <Text style={PDF_STYLES.para}>
          Every sanctions screening performed against OFAC / EU / UN lists during the period.
        </Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "20%" }]}>Timestamp</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "25%" }]}>User</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "30%" }]}>Entity screened</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "10%" }]}>Result</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "15%" }]}>IP</Text>
        </View>
        {report.screeningLog.length === 0 ? (
          <Text style={PDF_STYLES.muted}>No screenings recorded in this period.</Text>
        ) : (
          report.screeningLog.slice(0, 40).map((s) => (
            <View key={s.id} style={PDF_STYLES.row} wrap={false}>
              <Text style={[PDF_STYLES.cell, { width: "20%" }]}>{s.timestamp.slice(0, 16).replace("T", " ")}</Text>
              <Text style={[PDF_STYLES.cell, { width: "25%" }]}>{s.userEmail ?? s.userName ?? "anonymous"}</Text>
              <Text style={[PDF_STYLES.cell, { width: "30%" }]}>{s.entityScreened}</Text>
              <Text style={[PDF_STYLES.cell, { width: "10%" }]}>{s.result}</Text>
              <Text style={[PDF_STYLES.cell, { width: "15%" }]}>{s.ipAddress ?? "—"}</Text>
            </View>
          ))
        )}
        {report.screeningLog.length > 40 && (
          <Text style={PDF_STYLES.muted}>
            + {report.screeningLog.length - 40} more entries (see CSV export for the full log).
          </Text>
        )}
      </Page>

      {/* Page 3 — Alert log */}
      <Page size="A4" style={PDF_STYLES.page}>
        <Text style={PDF_STYLES.sectionTitle}>4. Alert Log ({report.alertLog.length})</Text>
        <Text style={PDF_STYLES.para}>
          Every alert generated by HarchIQ during the period (negative-coverage articles + high/critical risk assessments).
        </Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "20%" }]}>Timestamp</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "45%" }]}>Title</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "15%" }]}>Source</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "10%" }]}>Severity</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "10%" }]}>Action</Text>
        </View>
        {report.alertLog.length === 0 ? (
          <Text style={PDF_STYLES.muted}>No alerts in this period.</Text>
        ) : (
          report.alertLog.slice(0, 40).map((a) => (
            <View key={a.id} style={PDF_STYLES.row} wrap={false}>
              <Text style={[PDF_STYLES.cell, { width: "20%" }]}>{a.timestamp.slice(0, 16).replace("T", " ")}</Text>
              <Text style={[PDF_STYLES.cell, { width: "45%" }]}>{a.title.slice(0, 90)}</Text>
              <Text style={[PDF_STYLES.cell, { width: "15%" }]}>{a.source.slice(0, 20)}</Text>
              <Text style={[PDF_STYLES.cell, { width: "10%" }]}>{a.severity}</Text>
              <Text style={[PDF_STYLES.cell, { width: "10%" }]}>{a.actionTaken ?? "—"}</Text>
            </View>
          ))
        )}
        {report.alertLog.length > 40 && (
          <Text style={PDF_STYLES.muted}>
            + {report.alertLog.length - 40} more entries (see CSV export for the full log).
          </Text>
        )}
      </Page>

      {/* Page 4 — Access log */}
      <Page size="A4" style={PDF_STYLES.page}>
        <Text style={PDF_STYLES.sectionTitle}>5. Access Log ({report.accessLog.length})</Text>
        <Text style={PDF_STYLES.para}>
          Every dashboard access + sensitive action performed by users in the same company.
        </Text>
        <View style={PDF_STYLES.tableHeader}>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "18%" }]}>Timestamp</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "22%" }]}>User</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "18%" }]}>Action</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "22%" }]}>Resource</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "10%" }]}>Result</Text>
          <Text style={[PDF_STYLES.tableHeaderCell, { width: "10%" }]}>IP</Text>
        </View>
        {report.accessLog.length === 0 ? (
          <Text style={PDF_STYLES.muted}>No accesses recorded in this period.</Text>
        ) : (
          report.accessLog.slice(0, 40).map((a) => (
            <View key={a.id} style={PDF_STYLES.row} wrap={false}>
              <Text style={[PDF_STYLES.cell, { width: "18%" }]}>{a.timestamp.slice(0, 16).replace("T", " ")}</Text>
              <Text style={[PDF_STYLES.cell, { width: "22%" }]}>{a.userEmail ?? a.userName ?? "anonymous"}</Text>
              <Text style={[PDF_STYLES.cell, { width: "18%" }]}>{a.action}</Text>
              <Text style={[PDF_STYLES.cell, { width: "22%" }]}>{a.resource.slice(0, 30)}</Text>
              <Text style={[PDF_STYLES.cell, { width: "10%" }]}>{a.result}</Text>
              <Text style={[PDF_STYLES.cell, { width: "10%" }]}>{a.ipAddress ?? "—"}</Text>
            </View>
          ))
        )}
        {report.accessLog.length > 40 && (
          <Text style={PDF_STYLES.muted}>
            + {report.accessLog.length - 40} more entries (see CSV export for the full log).
          </Text>
        )}
      </Page>

      {/* Page 5 — Data residency */}
      <Page size="A4" style={PDF_STYLES.page}>
        <Text style={PDF_STYLES.sectionTitle}>6. Data Residency Statement</Text>
        <Text style={PDF_STYLES.para}>
          <Text style={{ fontWeight: "bold" }}>Storage provider:</Text> {report.dataResidency.storageProvider}
        </Text>
        <Text style={PDF_STYLES.para}>
          <Text style={{ fontWeight: "bold" }}>Storage region:</Text> {report.dataResidency.storageRegion}
        </Text>
        <Text style={PDF_STYLES.para}>
          <Text style={{ fontWeight: "bold" }}>Edge provider:</Text> {report.dataResidency.edgeProvider}
        </Text>
        <Text style={PDF_STYLES.para}>
          <Text style={{ fontWeight: "bold" }}>Encryption at rest:</Text> {report.dataResidency.encryptionAtRest}
        </Text>
        <Text style={PDF_STYLES.para}>
          <Text style={{ fontWeight: "bold" }}>Encryption in transit:</Text> {report.dataResidency.encryptionInTransit}
        </Text>
        <Text style={PDF_STYLES.sectionTitle}>Retention Policy</Text>
        <Text style={PDF_STYLES.para}>{report.dataResidency.retentionPolicy}</Text>
        <Text style={PDF_STYLES.sectionTitle}>Backup Policy</Text>
        <Text style={PDF_STYLES.para}>{report.dataResidency.backupPolicy}</Text>
        <Text style={PDF_STYLES.sectionTitle}>Data Subject Rights</Text>
        <Text style={PDF_STYLES.para}>{report.dataResidency.dataSubjectRightsLaw}</Text>
        <Text style={PDF_STYLES.sectionTitle}>Notes</Text>
        <Text style={PDF_STYLES.para}>{report.dataResidency.notes}</Text>
        <Text style={PDF_STYLES.confidential}>
          END OF REPORT — Generated by Harch Atelier HarchIQ Compliance Engine
        </Text>
      </Page>
    </Document>
  );
}

export default CompliancePDF;

"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
//  EXPORT PANEL — CSV/PDF export of dashboard data
//
//  Lets the Dircom export:
//    • Articles (with sentiment, source, date)
//    • Alerts (with severity, status, timestamp)
//    • Reputation scores (historical)
//    • AI Visibility data
//
//  Pattern: Meltwater export + Brandwatch download center.
//  Generates CSV client-side from the API data.
// ═══════════════════════════════════════════════════════════════

const C = {
  surface: "#FFFFFF",
  surfaceAlt: "#F4F4F5",
  border: "#E5E5E5",
  text: "#0A0A0A",
  textSec: "#525252",
  textMuted: "#71717A",
  accent: "#78716c",
  cta: "#10b981",
  fontSans: "'Inter', system-ui, sans-serif",
  fontMono: "'Space Mono', monospace",
};

type ExportType = "articles" | "alerts" | "reputation" | "ai_visibility";
type DateRange = "24h" | "7d" | "30d" | "90d";

const EXPORT_OPTIONS: { type: ExportType; label: string; icon: string; desc: string }[] = [
  { type: "articles", label: "Articles", icon: "📰", desc: "All articles with sentiment, source, date, URL" },
  { type: "alerts", label: "Alerts", icon: "⚠️", desc: "All alerts with severity, status, timestamp" },
  { type: "reputation", label: "Reputation Scores", icon: "📊", desc: "Historical reputation scores over time" },
  { type: "ai_visibility", label: "AI Visibility", icon: "🤖", desc: "LLM citation data per engine" },
];

function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row => headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = String(val).replace(/"/g, '""');
      return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
    }).join(",")),
  ].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const [selected, setSelected] = useState<ExportType>("articles");
  const [dateRange, setDateRange] = useState<DateRange>("7d");
  const [exporting, setExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const days = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 }[dateRange];
      const res = await fetch(`/api/console/export-data?type=${selected}&days=${days}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const rows = data.rows || data.articles || data.items || [];
      if (rows.length > 0) {
        const filename = `harch_${selected}_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`;
        downloadCSV(filename, rows);
        setLastExport(`${rows.length} rows exported → ${filename}`);
      } else {
        setLastExport("No data to export for this period");
      }
    } catch {
      setLastExport("Export failed — try again");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: C.fontMono, fontSize: "11px", fontWeight: 700, color: C.text, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "4px" }}>
          Export & Download
        </div>
        <div style={{ fontSize: "13px", color: C.textSec }}>Export dashboard data as CSV for reporting and analysis</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "20px", alignItems: "start" }}>
        {/* Left: Export type selection */}
        <div>
          <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            What to export
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {EXPORT_OPTIONS.map(opt => (
              <button
                key={opt.type}
                onClick={() => setSelected(opt.type)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px",
                  background: selected === opt.type ? C.surfaceAlt : C.surface,
                  border: `1px solid ${selected === opt.type ? C.accent : C.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "20px" }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: C.text }}>{opt.label}</div>
                  <div style={{ fontSize: "11px", color: C.textMuted }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Date range */}
          <div style={{ marginTop: "12px" }}>
            <div style={{ fontFamily: C.fontMono, fontSize: "10px", fontWeight: 700, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
              Date range
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {(["24h", "7d", "30d", "90d"] as DateRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: `1px solid ${dateRange === range ? C.text : C.border}`,
                    background: dateRange === range ? C.text : C.surface,
                    color: dateRange === range ? "#fff" : C.textSec,
                    fontFamily: C.fontMono,
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Export button + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center", minWidth: "180px" }}>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: "14px 24px",
              background: exporting ? C.border : C.cta,
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontFamily: C.fontSans,
              fontSize: "14px",
              fontWeight: 600,
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {exporting ? "⏳ Exporting…" : "📥 Export CSV"}
          </button>
          {lastExport && (
            <div style={{
              padding: "8px 12px",
              background: lastExport.includes("failed") ? "#fef2f2" : C.surfaceAlt,
              borderRadius: "6px",
              fontSize: "11px",
              color: lastExport.includes("failed") ? "#991b1b" : C.textSec,
              fontFamily: C.fontMono,
              textAlign: "center",
              maxWidth: "180px",
            }}>
              {lastExport}
            </div>
          )}
          <div style={{ fontSize: "10px", color: C.textMuted, textAlign: "center" }}>
            CSV format with UTF-8 BOM<br />Excel-compatible
          </div>
        </div>
      </div>
    </div>
  );
}

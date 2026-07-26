"use client";

import type { RiskEvent } from "@/lib/mock-data";
import type { ActionState } from "@/lib/risk-store";

/** Convert a RiskEvent row to a CSV-safe line. */
function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const actionLabel: Record<ActionState, string> = {
  pending: "Pending",
  acknowledged: "Acknowledged",
  escalated: "Escalated",
  watching: "Watching",
};

const headers = ["Event ID", "Date", "Pillar", "Title", "Articles", "Sentiment", "Severity", "Status"];

/** Build a CSV string from a list of risk events + their action states. */
export function buildEventsCsv(
  events: RiskEvent[],
  actions: Record<string, ActionState>,
): string {
  const rows = events.map((e) => {
    const status = actions[e.id] ?? "pending";
    return [
      e.id,
      e.date,
      e.pillar,
      e.title,
      e.articles,
      e.sentiment,
      e.severity,
      actionLabel[status],
    ]
      .map(csvEscape)
      .join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

/** Trigger a browser download of a CSV string. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke the object URL after a short delay to ensure the download starts.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

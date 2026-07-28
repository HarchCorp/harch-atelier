"use client";

import type { ActivityEntry, SavedView } from "@/lib/risk-store";

/** Shape of the export/import file. */
export interface SavedViewsFile {
  version: 1;
  exportedAt: string;
  views: SavedView[];
}

/** Build the JSON content for a saved-views export. */
export function buildSavedViewsJson(views: SavedView[]): string {
  const payload: SavedViewsFile = {
    version: 1,
    exportedAt: new Date().toISOString(),
    views,
  };
  return JSON.stringify(payload, null, 2);
}

/** Trigger a browser download of a JSON file. */
export function downloadJson(filename: string, json: string): void {
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Parse + validate an imported JSON string into SavedView[]. Throws on invalid shape. */
export function parseSavedViewsJson(json: string): SavedView[] {
  const data = JSON.parse(json);
  if (!data || typeof data !== "object") {
    throw new Error("Invalid file: not a JSON object.");
  }
  const views = Array.isArray(data.views) ? data.views : Array.isArray(data) ? data : null;
  if (!views) {
    throw new Error("Invalid file: no 'views' array found.");
  }
  return views.map((v: unknown, i: number) => {
    const obj = v as Record<string, unknown>;
    if (!obj || typeof obj !== "object") {
      throw new Error(`View ${i}: not an object.`);
    }
    const filters = obj.filters as Record<string, unknown> | undefined;
    if (!filters || typeof filters !== "object") {
      throw new Error(`View ${i}: missing 'filters' object.`);
    }
    return {
      id: typeof obj.id === "string" ? obj.id : `view-imported-${Date.now().toString(36)}-${i}`,
      name: typeof obj.name === "string" ? obj.name : `Imported view ${i + 1}`,
      filters: {
        pillar: (filters.pillar as string) ?? "all",
        severity: (filters.severity as string) ?? "all",
        status: (filters.status as string) ?? "all",
        source: (filters.source as string) ?? "all",
        region: (filters.region as string) ?? "all",
        query: (filters.query as string) ?? "",
      },
      createdAt: typeof obj.createdAt === "number" ? obj.createdAt : Date.now(),
    } as SavedView;
  });
}

/* ------------------------------------------------------------------ */
/*  Activity feed export (CSV + JSON)                                 */
/* ------------------------------------------------------------------ */

const activityHeaders = ["Timestamp", "Type", "Label", "Detail"];

function activityCsvEscape(value: string | undefined): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a CSV string from activity entries. */
export function buildActivityCsv(activity: ActivityEntry[]): string {
  const rows = activity.map((a) =>
    [
      new Date(a.ts).toISOString(),
      a.type,
      a.label,
      a.detail ?? "",
    ]
      .map(activityCsvEscape)
      .join(","),
  );
  return [activityHeaders.join(","), ...rows].join("\n");
}

/** Build a JSON string from activity entries. */
export function buildActivityJson(activity: ActivityEntry[]): string {
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: activity.length,
      activity,
    },
    null,
    2,
  );
}


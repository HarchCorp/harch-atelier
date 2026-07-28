"use client";

import * as React from "react";
import { ChartCard } from "@/components/dataviz/chart-card";
import { useRiskStore, type ActivityType, type ActivityEntry } from "@/lib/risk-store";
import { buildActivityCsv, buildActivityJson, downloadJson } from "@/lib/store-io";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ArrowUpRight,
  Bell,
  Save,
  FolderOpen,
  Copy,
  GitMerge,
  Trash2,
  RotateCcw,
  History,
  CheckCheck,
  Download,
} from "lucide-react";

const typeMeta: Record<ActivityType, { icon: React.ElementType; tint: string }> = {
  acknowledge: { icon: CheckCircle2, tint: "text-emerald-600 bg-emerald-50" },
  escalate: { icon: ArrowUpRight, tint: "text-amber-600 bg-amber-50" },
  watch: { icon: Bell, tint: "text-sky-600 bg-sky-50" },
  "bulk-acknowledge": { icon: CheckCheck, tint: "text-emerald-600 bg-emerald-50" },
  "bulk-escalate": { icon: ArrowUpRight, tint: "text-amber-600 bg-amber-50" },
  "save-view": { icon: Save, tint: "text-violet-600 bg-violet-50" },
  "load-view": { icon: FolderOpen, tint: "text-slate-600 bg-slate-100" },
  "duplicate-view": { icon: Copy, tint: "text-sky-600 bg-sky-50" },
  "merge-views": { icon: GitMerge, tint: "text-violet-600 bg-violet-50" },
  "delete-view": { icon: Trash2, tint: "text-rose-600 bg-rose-50" },
  "reset-workspace": { icon: RotateCcw, tint: "text-rose-600 bg-rose-50" },
};

function useRelativeLabel(ts: number): string {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const id = setInterval(() => tick(), 30_000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function ActivityRow({ entry }: { entry: ActivityEntry }) {
  const meta = typeMeta[entry.type];
  const Icon = meta.icon;
  const rel = useRelativeLabel(entry.ts);
  return (
    <div className="group flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50">
      <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", meta.tint)}>
        <Icon className="h-3 w-3" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-medium text-slate-800">{entry.label}</span>
          <span className="tabular shrink-0 text-[10px] text-slate-400">{rel}</span>
        </div>
        {entry.detail ? (
          <p className="mt-0.5 truncate text-[10px] text-slate-400">{entry.detail}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const activity = useRiskStore((s) => s.activity);
  const clearActivity = useRiskStore((s) => s.clearActivity);

  const handleExportCsv = () => {
    if (activity.length === 0) {
      toast.error("No activity to export", { description: "Perform an action first." });
      return;
    }
    const csv = buildActivityCsv(activity);
    const ts = new Date().toISOString().slice(0, 10);
    // Reuse downloadJson's mechanism but with CSV content type
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `harch-activity-${ts}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${activity.length} entr${activity.length > 1 ? "ies" : "y"} to CSV`);
  };

  const handleExportJson = () => {
    if (activity.length === 0) {
      toast.error("No activity to export", { description: "Perform an action first." });
      return;
    }
    const json = buildActivityJson(activity);
    const ts = new Date().toISOString().slice(0, 10);
    downloadJson(`harch-activity-${ts}.json`, json);
    toast.success(`Exported ${activity.length} entr${activity.length > 1 ? "ies" : "y"} to JSON`);
  };

  return (
    <ChartCard
      id="activity"
      title="Activity Feed"
      subtitle="Audit trail · last 50 actions"
      action={
        <div className="flex items-center gap-2">
          <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
            {activity.length}
          </span>
          {activity.length > 0 ? (
            <>
              <button
                type="button"
                onClick={handleExportCsv}
                className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                title="Export activity as CSV"
              >
                <Download className="h-3 w-3" />
                CSV
              </button>
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                title="Export activity as JSON"
              >
                <Download className="h-3 w-3" />
                JSON
              </button>
              <button
                type="button"
                onClick={clearActivity}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                title="Clear activity feed"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            </>
          ) : null}
        </div>
      }
      footer={
        <span>
          {activity.length > 0
            ? `${activity.length} action${activity.length > 1 ? "s" : ""} recorded · persisted across reloads`
            : "No activity yet — acknowledge an event or save a view to populate the feed."}
        </span>
      }
      bodyClassName="p-0"
    >
      <div className="harch-scroll max-h-[340px] overflow-y-auto p-1.5">
        {activity.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-slate-400">
            <History className="h-6 w-6 text-slate-300" />
            <span className="text-[12px] font-medium">No activity yet</span>
            <span className="text-[10px]">Actions will appear here as you work.</span>
          </div>
        ) : (
          activity.map((entry) => (
            <ActivityRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </ChartCard>
  );
}

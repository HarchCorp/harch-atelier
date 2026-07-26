"use client";

import * as React from "react";
import { Bell, CheckCircle2, ArrowUpRight, Inbox, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  alertItems,
  riskEvents,
  severityColor,
  type AlertItem,
  type AlertStatus,
  type RiskPillar,
} from "@/lib/mock-data";
import {
  useRiskStore,
  actionStateMeta,
  actionToAlertStatus,
} from "@/lib/risk-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const pillarTint: Record<RiskPillar, string> = {
  Regulatory: "bg-violet-50 text-violet-700",
  Cyber: "bg-cyan-50 text-cyan-700",
  Financial: "bg-sky-50 text-sky-700",
  ESG: "bg-emerald-50 text-emerald-700",
  Geopolitical: "bg-amber-50 text-amber-700",
  Reputational: "bg-rose-50 text-rose-700",
};

function useRelativeLabel(iso: string): string {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const id = setInterval(() => tick(), 30_000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

interface AlertsPopoverProps {
  onOpenAlert?: (a: AlertItem) => void;
}

function AlertRow({ a, onOpenAlert }: { a: AlertItem; onOpenAlert?: (a: AlertItem) => void }) {
  const sc = severityColor[a.severity];
  const rel = useRelativeLabel(a.triggeredAt);
  const action = useRiskStore((s) => (a.eventId ? s.actions[a.eventId] ?? "pending" : "pending"));
  const read = useRiskStore((s) => s.readAlerts[a.id] === true);
  const markRead = useRiskStore((s) => s.markAlertRead);

  // Live status from the store overrides the mock status when an action has been taken.
  const liveStatus: AlertStatus =
    action !== "pending" ? actionToAlertStatus(action) : a.status;
  const statusMeta: Record<AlertStatus, { label: string; chip: string }> = {
    new: { label: "New", chip: "bg-rose-50 text-rose-700" },
    acknowledged: { label: "Acked", chip: "bg-emerald-50 text-emerald-700" },
    escalated: { label: "Escalated", chip: "bg-amber-50 text-amber-700" },
  };
  const st = statusMeta[liveStatus];

  return (
    <button
      type="button"
      onClick={() => {
        markRead(a.id);
        onOpenAlert?.(a);
      }}
      className={cn(
        "group flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-slate-50",
        read && "opacity-60",
      )}
    >
      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", sc.dot, read && "opacity-50")} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn("rounded px-1 py-px text-[9px] font-medium", pillarTint[a.pillar])}>
            {a.pillar}
          </span>
          <span className={cn("rounded px-1 py-px text-[9px] font-semibold uppercase", st.chip)}>
            {st.label}
          </span>
          {!read && liveStatus === "new" ? (
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title="Unread" />
          ) : null}
          <span className="ml-auto tabular text-[10px] text-slate-400">{rel}</span>
        </div>
        <p className={cn("mt-1 truncate text-[12px]", read ? "font-normal text-slate-500" : "font-medium text-slate-800 group-hover:text-slate-900")}>
          {a.title}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-semibold capitalize", sc.text)}>
            {a.severity}
          </span>
          <span className="tabular text-[10px] text-slate-400">{a.id}</span>
        </div>
      </div>
    </button>
  );
}

export function AlertsPopover({ onOpenAlert }: AlertsPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const { readAlerts, actions, markAllAlertsRead, acknowledgeAll } = useRiskStore();

  // Unread = new + not read + no action taken.
  const newCount = alertItems.filter((a) => {
    if (readAlerts[a.id]) return false;
    if (a.eventId && actions[a.eventId] && actions[a.eventId] !== "pending") return false;
    return a.status === "new";
  }).length;

  const handleMarkAllRead = () => {
    markAllAlertsRead(alertItems.map((a) => a.id));
    toast.success("All alerts marked as read", {
      description: `${alertItems.length} alerts cleared from the unread queue.`,
    });
  };

  const handleAcknowledgeAll = () => {
    const alertIds = alertItems.map((a) => a.id);
    const eventIds = alertItems
      .map((a) => a.eventId)
      .filter((id): id is string => Boolean(id));
    acknowledgeAll(alertIds, eventIds);
    toast.success("All alerts acknowledged", {
      description: `${eventIds.length} events marked as acknowledged.`,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label={`Alerts — ${newCount} new`}
        >
          <Bell className="h-4 w-4" />
          {newCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
              {newCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[360px] p-0"
        sideOffset={6}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Inbox className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[12px] font-semibold text-slate-800">Alerts</span>
            <Badge variant="secondary" className="h-4 px-1 text-[9px] font-semibold">
              {alertItems.length}
            </Badge>
            {newCount > 0 ? (
              <span className="tabular text-[10px] font-medium text-rose-600">{newCount} unread</span>
            ) : null}
          </div>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-[10px] font-medium text-slate-500 hover:text-slate-700"
          >
            <CheckCheck className="h-3 w-3" />
            Mark all read
          </button>
        </div>
        <div className="harch-scroll max-h-[340px] overflow-y-auto">
          {alertItems.map((a) => (
            <AlertRow key={a.id} a={a} onOpenAlert={onOpenAlert} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAcknowledgeAll}
            className="h-7 gap-1 px-2 text-[11px] text-slate-600"
          >
            <CheckCircle2 className="h-3 w-3" />
            Acknowledge all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-[11px] text-slate-600 hover:text-slate-900"
          >
            View all
            <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

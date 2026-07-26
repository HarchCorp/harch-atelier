"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEventsForEntity, severityColor, sentimentColor, type RiskEvent } from "@/lib/mock-data";
import { useActionState } from "@/lib/risk-store";
import { cn } from "@/lib/utils";
import { Building2, ChevronRight, ExternalLink } from "lucide-react";

interface EntityProfileDialogProps {
  entity: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEvent?: (e: RiskEvent) => void;
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function EventMiniRow({ e, onSelect }: { e: RiskEvent; onSelect?: (e: RiskEvent) => void }) {
  const sc = severityColor[e.severity];
  const snt = sentimentColor[e.sentiment];
  const action = useActionState(e.id);
  const dimmed = action === "acknowledged";
  return (
    <button
      type="button"
      onClick={() => onSelect?.(e)}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-50",
        dimmed && "opacity-55",
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", sc.dot)} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium text-slate-800 group-hover:text-slate-900">{e.title}</div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="tabular">{formatDate(e.date)}</span>
          <span className={cn("capitalize", snt.text)}>{e.sentiment}</span>
          <span className="tabular">{e.articles} art.</span>
        </div>
      </div>
      <ChevronRight className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-slate-500" />
    </button>
  );
}

export function EntityProfileDialog({ entity, open, onOpenChange, onSelectEvent }: EntityProfileDialogProps) {
  // Genuinely related events via the entityIndex (no heuristic).
  const relatedEvents = React.useMemo(() => {
    if (!entity) return [];
    return getEventsForEntity(entity);
  }, [entity]);

  const stats = React.useMemo(() => {
    if (!entity) return { events: 0, articles: 0, critical: 0, negative: 0 };
    return {
      events: relatedEvents.length,
      articles: relatedEvents.reduce((s, e) => s + e.articles, 0),
      critical: relatedEvents.filter((e) => e.severity === "critical").length,
      negative: relatedEvents.filter((e) => e.sentiment === "negative").length,
    };
  }, [entity, relatedEvents]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-0">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            {entity ?? "Entity"}
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-500">
            Risk profile · related events + coverage stats
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Events</div>
              <div className="tabular text-[16px] font-bold text-slate-900">{stats.events}</div>
            </div>
            <div className="rounded-md bg-slate-50 px-2 py-1.5 text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Articles</div>
              <div className="tabular text-[16px] font-bold text-slate-900">{stats.articles}</div>
            </div>
            <div className="rounded-md bg-rose-50 px-2 py-1.5 text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-rose-500">Critical</div>
              <div className="tabular text-[16px] font-bold text-rose-700">{stats.critical}</div>
            </div>
            <div className="rounded-md bg-amber-50 px-2 py-1.5 text-center">
              <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Negative</div>
              <div className="tabular text-[16px] font-bold text-amber-700">{stats.negative}</div>
            </div>
          </div>

          {/* Related events */}
          <div className="mt-4">
            <h4 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Related events
            </h4>
            <div className="space-y-0.5">
              {relatedEvents.map((e) => (
                <EventMiniRow key={e.id} e={e} onSelect={onSelectEvent} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[10px] text-slate-400">
              Profile generated from {relatedEvents.length} related events
            </span>
            <button className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900">
              View full profile
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

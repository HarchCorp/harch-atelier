"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRiskStore, filterRiskEvents, type SavedView } from "@/lib/risk-store";
import { riskEvents, severityColor, type RiskEvent } from "@/lib/mock-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GitCompare, ArrowRight, Minus, Plus, GitMerge } from "lucide-react";

interface CompareViewsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectEvent?: (e: RiskEvent) => void;
}

function EventChip({ e, onSelect }: { e: RiskEvent; onSelect?: (e: RiskEvent) => void }) {
  const sc = severityColor[e.severity];
  return (
    <button
      type="button"
      onClick={() => onSelect?.(e)}
      className="group flex w-full items-center gap-1.5 rounded-md border border-slate-100 bg-white px-2 py-1 text-left text-[11px] transition-colors hover:border-slate-300 hover:bg-slate-50"
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", sc.dot)} />
      <span className="truncate font-medium text-slate-700 group-hover:text-slate-900">{e.title}</span>
      <span className="tabular shrink-0 text-[9px] text-slate-400">{e.id}</span>
    </button>
  );
}

export function CompareViewsDialog({ open, onOpenChange, onSelectEvent }: CompareViewsDialogProps) {
  const savedViews = useRiskStore((s) => s.savedViews);
  const actions = useRiskStore((s) => s.actions);
  const mergeViews = useRiskStore((s) => s.mergeViews);
  const [viewAId, setViewAId] = React.useState<string>("");
  const [viewBId, setViewBId] = React.useState<string>("");
  const [mergeName, setMergeName] = React.useState("");

  const viewA = savedViews.find((v) => v.id === viewAId);
  const viewB = savedViews.find((v) => v.id === viewBId);

  const diff = React.useMemo(() => {
    if (!viewA || !viewB) return null;
    const setA = new Set(filterRiskEvents(riskEvents, viewA.filters, actions).map((e) => e.id));
    const setB = new Set(filterRiskEvents(riskEvents, viewB.filters, actions).map((e) => e.id));
    const intersection = riskEvents.filter((e) => setA.has(e.id) && setB.has(e.id));
    const onlyA = riskEvents.filter((e) => setA.has(e.id) && !setB.has(e.id));
    const onlyB = riskEvents.filter((e) => !setA.has(e.id) && setB.has(e.id));
    return { intersection, onlyA, onlyB, totalA: setA.size, totalB: setB.size };
  }, [viewA, viewB, actions]);

  // Auto-select the first two views when opening.
  React.useEffect(() => {
    if (open && savedViews.length >= 2) {
      if (!viewAId || !savedViews.find((v) => v.id === viewAId)) setViewAId(savedViews[0].id);
      if (!viewBId || !savedViews.find((v) => v.id === viewBId)) setViewBId(savedViews[1].id);
    }
  }, [open, savedViews, viewAId, viewBId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0">
        <DialogHeader className="border-b border-slate-100 px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <GitCompare className="h-4 w-4 text-slate-500" />
            Compare Views
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-500">
            Diff the filtered event sets of two saved views.
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 py-4">
          {savedViews.length < 2 ? (
            <div className="py-8 text-center text-slate-400">
              <GitCompare className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-[13px] font-medium">Need at least 2 saved views to compare</p>
              <p className="mt-1 text-[11px]">Save two or more views first, then come back here.</p>
            </div>
          ) : (
            <>
              {/* View selectors */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">View A</label>
                  <Select value={viewAId} onValueChange={setViewAId}>
                    <SelectTrigger className="h-8 border-slate-200 text-[12px] text-slate-700">
                      <SelectValue placeholder="Select view A" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedViews.map((v) => (
                        <SelectItem key={v.id} value={v.id} disabled={v.id === viewBId}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ArrowRight className="mt-5 h-4 w-4 shrink-0 text-slate-300" />
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-400">View B</label>
                  <Select value={viewBId} onValueChange={setViewBId}>
                    <SelectTrigger className="h-8 border-slate-200 text-[12px] text-slate-700">
                      <SelectValue placeholder="Select view B" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedViews.map((v) => (
                        <SelectItem key={v.id} value={v.id} disabled={v.id === viewAId}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {diff ? (
                <div className="mt-4 space-y-3">
                  {/* Summary stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-md border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-center">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600">Intersection</div>
                      <div className="tabular text-[18px] font-bold text-emerald-700">{diff.intersection.length}</div>
                      <div className="text-[9px] text-emerald-500">in both</div>
                    </div>
                    <div className="rounded-md border border-sky-100 bg-sky-50/50 px-3 py-2 text-center">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-sky-600">Only in A</div>
                      <div className="tabular text-[18px] font-bold text-sky-700">{diff.onlyA.length}</div>
                      <div className="truncate text-[9px] text-sky-500">{viewA?.name}</div>
                    </div>
                    <div className="rounded-md border border-amber-100 bg-amber-50/50 px-3 py-2 text-center">
                      <div className="text-[9px] font-semibold uppercase tracking-wide text-amber-600">Only in B</div>
                      <div className="tabular text-[18px] font-bold text-amber-700">{diff.onlyB.length}</div>
                      <div className="truncate text-[9px] text-amber-500">{viewB?.name}</div>
                    </div>
                  </div>

                  {/* Intersection */}
                  {diff.intersection.length > 0 ? (
                    <div>
                      <h4 className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                        <Plus className="h-3 w-3" />
                        In both ({diff.intersection.length})
                      </h4>
                      <div className="space-y-1">
                        {diff.intersection.map((e) => <EventChip key={e.id} e={e} onSelect={onSelectEvent} />)}
                      </div>
                    </div>
                  ) : null}

                  {/* Only in A */}
                  {diff.onlyA.length > 0 ? (
                    <div>
                      <h4 className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-600">
                        <Minus className="h-3 w-3" />
                        Only in “{viewA?.name}” ({diff.onlyA.length})
                      </h4>
                      <div className="space-y-1">
                        {diff.onlyA.map((e) => <EventChip key={e.id} e={e} onSelect={onSelectEvent} />)}
                      </div>
                    </div>
                  ) : null}

                  {/* Only in B */}
                  {diff.onlyB.length > 0 ? (
                    <div>
                      <h4 className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600">
                        <Minus className="h-3 w-3" />
                        Only in “{viewB?.name}” ({diff.onlyB.length})
                      </h4>
                      <div className="space-y-1">
                        {diff.onlyB.map((e) => <EventChip key={e.id} e={e} onSelect={onSelectEvent} />)}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="py-8 text-center text-[12px] text-slate-400">
                  Select two views to compare.
                </div>
              )}

              {/* Merge action */}
              {diff ? (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <input
                    value={mergeName}
                    onChange={(e) => setMergeName(e.target.value)}
                    placeholder={`Merged: ${viewA?.name} + ${viewB?.name}`}
                    className="h-8 flex-1 rounded-md border border-slate-200 px-2 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!viewA || !viewB) return;
                      mergeViews(viewA.id, viewB.id, mergeName);
                      toast.success("Views merged", {
                        description: `Created "${mergeName.trim() || `${viewA.name} + ${viewB.name}`}" from ${viewA.name} + ${viewB.name}.`,
                      });
                      setMergeName("");
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800"
                  >
                    <GitMerge className="h-3.5 w-3.5" />
                    Merge into new view
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

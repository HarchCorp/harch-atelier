"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartCard } from "@/components/dataviz/chart-card";
import {
  severityColor,
  type WatchlistSignal,
  type RiskPillar,
} from "@/lib/mock-data";
import { useSignalPulse } from "@/hooks/use-signal-pulse";
import { TrendingDown, TrendingUp, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const pillarColor: Record<RiskPillar, string> = {
  Regulatory: "text-violet-700 bg-violet-50",
  Cyber: "text-cyan-700 bg-cyan-50",
  Financial: "text-sky-700 bg-sky-50",
  ESG: "text-emerald-700 bg-emerald-50",
  Geopolitical: "text-amber-700 bg-amber-50",
  Reputational: "text-rose-700 bg-rose-50",
};

/** Convert an ISO timestamp into a live "Xs ago" label that ticks every second. */
function useRelativeLabel(iso: string | undefined): string {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const id = setInterval(() => tick(), 1000);
    return () => clearInterval(id);
  }, []);
  if (!iso) return "—";
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function Row({ s, flash }: { s: WatchlistSignal; flash: boolean }) {
  const sc = severityColor[s.severity];
  const up = s.delta >= 0;
  const updatedLabel = useRelativeLabel(s.updatedAt);
  return (
    <TableRow
      className={cn(
        "h-9 border-slate-100 transition-colors hover:bg-slate-50/70",
        flash && "bg-amber-50/60",
      )}
    >
      <TableCell className="py-0 pl-4 pr-3 align-middle">
        <div className="flex items-center gap-2">
          <span className="tabular rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">{s.ticker}</span>
        </div>
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <span className="text-[12px] font-medium text-slate-800">{s.signal}</span>
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <span className={cn("inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium", pillarColor[s.pillar])}>
          {s.pillar}
        </span>
      </TableCell>
      <TableCell className="py-0 pr-3 align-middle">
        <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium capitalize", sc.bg, sc.text)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
          {s.severity}
        </span>
      </TableCell>
      <TableCell className="py-0 pr-3 text-right align-middle">
        <span className={cn("tabular inline-flex items-center justify-end gap-0.5 text-[12px] font-semibold", up ? "text-emerald-700" : "text-rose-700")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{s.delta.toFixed(1)}
        </span>
      </TableCell>
      <TableCell className="py-0 pr-3 text-right align-middle">
        <span className="tabular text-[12px] font-semibold text-slate-700">{s.articles}</span>
      </TableCell>
      <TableCell className="py-0 pl-3 pr-4 text-right align-middle">
        <span className="tabular text-[11px] text-slate-400">{updatedLabel}</span>
      </TableCell>
    </TableRow>
  );
}

export function WatchlistSignals() {
  const { signals, connected } = useSignalPulse();

  // Track which signals just changed to flash them briefly.
  const prevRef = React.useRef<WatchlistSignal[]>(signals);
  const [flashIds, setFlashIds] = React.useState<Set<string>>(new Set());
  React.useEffect(() => {
    const changed = new Set<string>();
    for (const s of signals) {
      const prev = prevRef.current.find((p) => p.id === s.id);
      if (prev && (prev.delta !== s.delta || prev.articles !== s.articles)) {
        changed.add(s.id);
      }
    }
    if (changed.size > 0) {
      setFlashIds(changed);
      const id = setTimeout(() => setFlashIds(new Set()), 1200);
      prevRef.current = signals;
      return () => clearTimeout(id);
    }
    prevRef.current = signals;
  }, [signals]);

  const down = signals.filter((s) => s.delta < 0).length;
  const up = signals.filter((s) => s.delta >= 0).length;

  return (
    <ChartCard
      title="Watchlist Signals"
      subtitle="HarchCorp · live signal feed"
      action={
        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span
            className={cn(
              "flex items-center gap-1 rounded px-1.5 py-0.5 font-medium",
              connected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
            )}
          >
            <Radio className={cn("h-3 w-3", connected && "animate-pulse")} />
            {connected ? "LIVE" : "connecting…"}
          </span>
          <span className="flex items-center gap-1 text-rose-600"><TrendingDown className="h-3 w-3" />{down} down</span>
          <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3 w-3" />{up} up</span>
        </div>
      }
      bodyClassName="p-0"
      footer={<span>Streaming via signal-pulse service (port 3003). Updates every 4–7s.</span>}
    >
      <div className="harch-scroll max-h-[320px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-8 border-slate-100 bg-slate-50/60 hover:bg-slate-50/60">
              <TableHead className="h-8 py-0 pl-4 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ticker</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Signal</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pillar</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Severity</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Δ Sent.</TableHead>
              <TableHead className="h-8 py-0 pr-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500"># Articles</TableHead>
              <TableHead className="h-8 py-0 pl-3 pr-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {signals.map((s) => (
              <Row key={s.id} s={s} flash={flashIds.has(s.id)} />
            ))}
          </TableBody>
        </Table>
      </div>
    </ChartCard>
  );
}

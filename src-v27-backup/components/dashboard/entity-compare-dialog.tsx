"use client";

/**
 * Harch Atelier — Entity Comparison Dialog (V13.1)
 *
 * Pick 2-3 entities from the directory and compare them side by side:
 *  - Financial KPI table (revenue, net income, assets, mkt cap, P/E, employees)
 *  - 6-pillar risk radar overlay
 *  - 12-month sentiment trend multi-line
 *  - Composite risk score + sentiment gauge per entity
 *
 * Reuses entities-data. Triggered from the Command Palette or a button.
 */
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Plus, GitCompare, Trophy, TrendingUp, TrendingDown } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  entityDirectory,
  formatMAD,
  formatCompactMAD,
  sectorColor,
  type Entity,
  type EntitySector,
} from "@/lib/entities-data";

const COMPARE_COLORS = ["#0ea5e9", "#10b981", "#f43f5e"];

interface EntityCompareDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Initial entity ids to pre-select. */
  initialIds?: string[];
}

const pillarKeys: { key: keyof Entity["riskPillars"]; label: string }[] = [
  { key: "regulatory", label: "Regulatory" },
  { key: "cyber", label: "Cyber" },
  { key: "financial", label: "Financial" },
  { key: "esg", label: "ESG" },
  { key: "geopolitical", label: "Geopolitical" },
  { key: "reputational", label: "Reputational" },
];

const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function EntityCompareDialog({ open, onOpenChange, initialIds }: EntityCompareDialogProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>(initialIds ?? []);

  // Reset to initial when reopened.
  React.useEffect(() => {
    if (open) setSelectedIds(initialIds?.length ? initialIds : ["HRCH", "ATW", "OCP"]);
  }, [open, initialIds]);

  const selected = React.useMemo(
    () => selectedIds.map((id) => entityDirectory.find((e) => e.id === id)).filter(Boolean) as Entity[],
    [selectedIds],
  );

  const available = React.useMemo(
    () => entityDirectory.filter((e) => !selectedIds.includes(e.id)).slice(0, 60),
    [selectedIds],
  );

  const radarData = React.useMemo(
    () =>
      pillarKeys.map((p) => {
        const row: Record<string, string | number> = { pillar: p.label };
        selected.forEach((e, i) => {
          row[`e${i}`] = e.riskPillars[p.key];
        });
        return row;
      }),
    [selected],
  );

  const sentimentData = React.useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => {
        const row: Record<string, string | number> = { month: monthLabels[m] };
        selected.forEach((e, i) => {
          row[`e${i}`] = e.sentimentTrend12m[m] ?? 0;
        });
        return row;
      }),
    [selected],
  );

  const removeEntity = (id: string) =>
    setSelectedIds((prev) => prev.filter((x) => x !== id));

  const addEntity = (id: string) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds((prev) => [...prev, id]);
  };

  // Per-metric winner.
  const winner = (getter: (e: Entity) => number, higherBetter: boolean) => {
    if (selected.length < 2) return -1;
    let bestIdx = 0;
    let best = getter(selected[0]);
    for (let i = 1; i < selected.length; i++) {
      const v = getter(selected[i]);
      if (higherBetter ? v > best : v < best) {
        best = v;
        bestIdx = i;
      }
    }
    return bestIdx;
  };

  const financialRows: {
    label: string;
    get: (e: Entity) => string;
    raw: (e: Entity) => number;
    higherBetter: boolean;
    suffix?: string;
  }[] = [
    {
      label: "Revenue (MAD M)",
      get: (e) => formatCompactMAD(e.revenueM),
      raw: (e) => e.revenueM,
      higherBetter: true,
    },
    {
      label: "Net Income (MAD M)",
      get: (e) => formatCompactMAD(e.netIncomeM),
      raw: (e) => e.netIncomeM,
      higherBetter: true,
    },
    {
      label: "Total Assets (MAD M)",
      get: (e) => formatCompactMAD(e.assetsM),
      raw: (e) => e.assetsM,
      higherBetter: true,
    },
    {
      label: "Market Cap (MAD M)",
      get: (e) => (e.mktCapM != null ? formatCompactMAD(e.mktCapM) : "—"),
      raw: (e) => e.mktCapM ?? -Infinity,
      higherBetter: true,
    },
    {
      label: "P/E Ratio",
      get: (e) => (e.peRatio != null ? e.peRatio.toFixed(1) : "—"),
      raw: (e) => e.peRatio ?? Infinity,
      higherBetter: false,
    },
    {
      label: "Dividend Yield",
      get: (e) => (e.dividendYield != null ? `${e.dividendYield.toFixed(2)}%` : "—"),
      raw: (e) => e.dividendYield ?? -Infinity,
      higherBetter: true,
      suffix: "%",
    },
    {
      label: "Employees",
      get: (e) => e.employees.toLocaleString("en-US"),
      raw: (e) => e.employees,
      higherBetter: true,
    },
    {
      label: "Risk Score",
      get: (e) => e.riskScore.toFixed(1),
      raw: (e) => e.riskScore,
      higherBetter: false,
      suffix: "/100",
    },
    {
      label: "Net Sentiment",
      get: (e) => `${e.sentiment > 0 ? "+" : ""}${e.sentiment}`,
      raw: (e) => e.sentiment,
      higherBetter: true,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl gap-0 p-0">
        <DialogHeader className="border-b border-slate-200 px-5 py-3.5">
          <DialogTitle className="flex items-center gap-2 text-[15px] font-bold tracking-tight text-slate-900">
            <GitCompare className="h-4 w-4 text-violet-600" />
            Compare Entities
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-500">
            Side-by-side benchmarking of up to 3 entities — financials, risk pillars, sentiment.
          </DialogDescription>
        </DialogHeader>

        <div className="harch-scroll max-h-[72vh] overflow-y-auto px-5 py-4">
          {/* Selected entity chips + add */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {selected.map((e, i) => {
              const tint = sectorColor[e.sector as EntitySector] ?? "bg-slate-100 text-slate-700";
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1 pl-2 pr-1.5 shadow-sm"
                  style={{ borderLeftColor: COMPARE_COLORS[i], borderLeftWidth: 3 }}
                >
                  <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", tint)}>
                    {e.ticker ?? e.id}
                  </span>
                  <span className="text-[12px] font-medium text-slate-800">{e.name}</span>
                  <button
                    type="button"
                    onClick={() => removeEntity(e.id)}
                    className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Remove ${e.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
            {selected.length < 3 ? (
              <Select value="" onValueChange={addEntity}>
                <SelectTrigger className="h-8 w-[180px] gap-1.5 border-dashed border-slate-300 text-[12px] font-medium text-slate-500">
                  <Plus className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Add entity" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {available.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-[12px]">
                      <span className="font-semibold">{e.ticker ?? e.id}</span>
                      <span className="ml-1.5 text-slate-500">{e.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-[11px] text-slate-400">Max 3 entities</span>
            )}
          </div>

          {selected.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-[13px] text-slate-400">
              Add at least one entity to compare.
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Financial comparison table */}
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Financial & Risk Comparison
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="py-2 pl-3 pr-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Metric
                        </th>
                        {selected.map((e, i) => (
                          <th
                            key={e.id}
                            className="px-3 py-2 text-right text-[11px] font-bold"
                            style={{ color: COMPARE_COLORS[i] }}
                          >
                            <div className="flex flex-col items-end">
                              <span>{e.name}</span>
                              <span className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
                                {e.ticker ?? e.id} · {e.sector}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {financialRows.map((row) => {
                        const wIdx = winner(row.raw, row.higherBetter);
                        return (
                          <tr key={row.label} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                            <td className="py-1.5 pl-3 pr-3 text-[11px] font-medium text-slate-600">
                              {row.label}
                              {row.suffix ? (
                                <span className="ml-0.5 text-[9px] text-slate-400">{row.suffix}</span>
                              ) : null}
                            </td>
                            {selected.map((e, i) => (
                              <td
                                key={e.id}
                                className={cn(
                                  "tabular px-3 py-1.5 text-right text-[12px] font-semibold",
                                  i === wIdx && selected.length > 1
                                    ? "text-emerald-700"
                                    : "text-slate-700",
                                )}
                              >
                                <span className="inline-flex items-center gap-1">
                                  {i === wIdx && selected.length > 1 ? (
                                    <Trophy className="h-3 w-3 text-amber-500" />
                                  ) : null}
                                  {row.get(e)}
                                </span>
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Risk radar overlay */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Risk Pillar Overlay
                    </span>
                    <span className="text-[10px] text-slate-400">0–100 (lower = safer)</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData} outerRadius="72%">
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: "#64748b" }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      {selected.map((e, i) => (
                        <Radar
                          key={e.id}
                          name={e.ticker ?? e.id}
                          dataKey={`e${i}`}
                          stroke={COMPARE_COLORS[i]}
                          fill={COMPARE_COLORS[i]}
                          fillOpacity={0.08}
                          strokeWidth={1.8}
                        />
                      ))}
                      <RTooltip
                        contentStyle={{
                          fontSize: 11,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sentiment trend multi-line */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      12-Month Sentiment Trend
                    </span>
                    <span className="text-[10px] text-slate-400">-100 to +100</span>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={sentimentData} margin={{ top: 5, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[-100, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <RTooltip
                        contentStyle={{
                          fontSize: 11,
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      {selected.map((e, i) => (
                        <Line
                          key={e.id}
                          type="monotone"
                          dataKey={`e${i}`}
                          name={e.ticker ?? e.id}
                          stroke={COMPARE_COLORS[i]}
                          strokeWidth={1.8}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Per-entity summary cards */}
              <div className={cn("grid grid-cols-1 gap-3", selected.length > 1 && "sm:grid-cols-2", selected.length > 2 && "lg:grid-cols-3")}>
                {selected.map((e, i) => {
                  const tint = sectorColor[e.sector as EntitySector] ?? "bg-slate-100 text-slate-700";
                  const sentUp = e.sentiment >= 0;
                  return (
                    <div
                      key={e.id}
                      className="rounded-xl border border-slate-200 bg-white p-3"
                      style={{ borderTopColor: COMPARE_COLORS[i], borderTopWidth: 3 }}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-bold uppercase", tint)}>
                          {e.ticker ?? e.id}
                        </span>
                        <span className="flex-1 truncate text-[12px] font-semibold text-slate-800">{e.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                          <div className="text-[9px] uppercase tracking-wide text-slate-400">Risk</div>
                          <div className="tabular text-[14px] font-bold text-slate-800">{e.riskScore.toFixed(1)}</div>
                        </div>
                        <div className="rounded-md bg-slate-50 px-2 py-1.5">
                          <div className="text-[9px] uppercase tracking-wide text-slate-400">Sentiment</div>
                          <div className={cn("tabular flex items-center gap-0.5 text-[14px] font-bold", sentUp ? "text-emerald-700" : "text-rose-700")}>
                            {sentUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {e.sentiment > 0 ? "+" : ""}{e.sentiment}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium text-slate-600">
                          {e.sector}
                        </Badge>
                        <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium text-slate-600">
                          {e.hq}
                        </Badge>
                        <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium capitalize text-slate-600">
                          {e.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-[10px] text-slate-400">
            Comparing {selected.length} of 3 max · data is mock-deterministic
          </span>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-7 text-[12px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

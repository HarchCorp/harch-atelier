"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  CalendarDays,
  CreditCard,
  Database,
  Download,
  FileText,
  HardDrive,
  Receipt,
  Users,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChartCard } from "@/components/dataviz/chart-card";
import { DeferredChart } from "@/components/dataviz/chart-skeleton";
import { SectionHeader, StatusChip } from "../section-header";
import {
  PanelCard,
  PanelHeader,
  ProgressBar,
  StaggerGrid,
  StatTile,
  Tag,
  type RoleAccent,
} from "../design-system";
import type { SectionComponentProps } from "@/components/dashboard/section-registry";
import {
  billingSummary,
  formatUSD,
  invoices,
  monthlyCost12m,
  usageMeters,
  type Invoice,
  type MonthlyCost,
  type UsageMeter,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Usage meter — premium PanelCard with ProgressBar                   */
/* ------------------------------------------------------------------ */

const meterAccent: Record<UsageMeter["tone"], RoleAccent> = {
  emerald: "emerald",
  violet: "violet",
  sky: "cyan",
  amber: "amber",
  rose: "rose",
};

const meterProgressTone: Record<UsageMeter["tone"], "emerald" | "violet" | "sky" | "amber" | "rose"> = {
  emerald: "emerald",
  violet: "violet",
  sky: "sky",
  amber: "amber",
  rose: "rose",
};

const meterIcon: Record<UsageMeter["tone"], React.FC<{ className?: string }>> = {
  emerald: Database,
  violet: Zap,
  sky: Users,
  amber: HardDrive,
  rose: ArrowUpRight,
};

const meterChipClasses: Record<UsageMeter["tone"], string> = {
  emerald: "bg-emerald-100",
  violet: "bg-violet-100",
  sky: "bg-sky-100",
  amber: "bg-amber-100",
  rose: "bg-rose-100",
};

const meterIconClasses: Record<UsageMeter["tone"], string> = {
  emerald: "text-emerald-700",
  violet: "text-violet-700",
  sky: "text-sky-700",
  amber: "text-amber-700",
  rose: "text-rose-700",
};

const fmtCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;

function UsageMeterCard({ meter, index }: { meter: UsageMeter; index: number }) {
  const pct = Math.min(100, (meter.used / meter.quota) * 100);
  const Icon = meterIcon[meter.tone];
  const isOver = pct > 85;
  const accent = isOver ? "rose" : meterAccent[meter.tone];
  return (
    <PanelCard accent={accent} delay={index * 0.03} className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", meterChipClasses[meter.tone])}>
            <Icon className={cn("h-3.5 w-3.5", meterIconClasses[meter.tone])} />
          </span>
          <span className="card-title">{meter.label}</span>
        </div>
        <span className={cn("tabular text-[11px] font-bold", isOver ? "text-rose-700" : "text-slate-700")}>
          {pct.toFixed(1)}%
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar
          value={pct}
          tone={isOver ? "rose" : meterProgressTone[meter.tone]}
          height={6}
          threshold={85}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
        <span className="tabular">
          {fmtCompact(meter.used)} / {fmtCompact(meter.quota)} {meter.unit}
        </span>
        <span className={cn("tabular font-semibold", isOver ? "text-rose-700" : "text-slate-500")}>
          {fmtCompact(meter.quota - meter.used)} {meter.unit} left
        </span>
      </div>
    </PanelCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Monthly cost chart                                                 */
/* ------------------------------------------------------------------ */

function CostTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length || !label) return null;
  const cost = payload.find((p) => p.dataKey === "cost")?.value ?? 0;
  const overage = payload.find((p) => p.dataKey === "overage")?.value ?? 0;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label} 2025</div>
      <div className="tabular mt-1 text-[14px] font-bold text-slate-900">{formatUSD(cost + overage)}</div>
      <div className="mt-0.5 flex items-center justify-between gap-4 text-[10px]">
        <span className="text-slate-500">Base {formatUSD(cost)}</span>
        {overage > 0 ? (
          <span className="font-semibold text-amber-700">+{formatUSD(overage)} overage</span>
        ) : null}
      </div>
    </div>
  );
}

function MonthlyCostChart() {
  return (
    <DeferredChart height="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={monthlyCost12m as MonthlyCost[]} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={{ stroke: "#cbd5e1" }} tickLine={false} />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            domain={[15000, "auto"]}
          />
          <Tooltip content={<CostTooltip />} />
          <Area type="monotone" dataKey="cost" stroke="#0ea5e9" strokeWidth={1.8} fill="url(#costGrad)" />
          <Line type="monotone" dataKey="overage" stroke="#f59e0b" strokeWidth={1.6} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </DeferredChart>
  );
}

/* ------------------------------------------------------------------ */
/*  Invoice status tag                                                 */
/* ------------------------------------------------------------------ */

const invoiceStatusTone: Record<Invoice["status"], "positive" | "warning" | "negative" | "neutral"> = {
  paid: "positive",
  pending: "warning",
  overdue: "negative",
  draft: "neutral",
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function Billing(_: SectionComponentProps) {
  const totalYtd = monthlyCost12m.reduce((s, m) => s + m.cost + m.overage, 0);
  const mrr = billingSummary.mrr;
  const mrrDelta = billingSummary.mrrDelta;
  const nextRenewal = billingSummary.renewalDate;
  const overageYtd = monthlyCost12m.reduce((s, m) => s + m.overage, 0);
  const invoicesPaid = invoices.filter((i) => i.status === "paid").length;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeader
        sectionId="admin-billing"
        accountType="admin"
        accent="sky"
        statusChips={
          <>
            <StatusChip label={billingSummary.plan} tone="neutral" icon={CreditCard} />
            <StatusChip label={`Renews ${nextRenewal}`} tone="neutral" icon={CalendarDays} />
          </>
        }
        kpis={
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatTile
              label="MRR"
              value={formatUSD(mrr)}
              delta={`${mrrDelta >= 0 ? "+" : ""}${formatUSD(mrrDelta)}`}
              deltaTone={mrrDelta >= 0 ? "positive" : "negative"}
              hint="vs prior month"
              icon={CreditCard}
              accent="slate"
            />
            <StatTile label="YTD Spend" value={formatUSD(totalYtd)} hint="Across 11 months" icon={Receipt} accent="slate" />
            <StatTile label="Plan" value={billingSummary.plan} hint={`Renews ${nextRenewal}`} icon={CalendarDays} accent="cyan" />
            <StatTile label="Avg / month" value={formatUSD(Math.round(totalYtd / monthlyCost12m.length))} hint="Equal-weighted" icon={Receipt} accent="slate" />
            <StatTile label="Overage YTD" value={formatUSD(overageYtd)} hint="Usage above quota" icon={ArrowUpRight} accent="amber" />
            <StatTile label="Invoices paid" value={`${invoicesPaid}/${invoices.length}`} hint="Last 8 months" icon={FileText} accent="emerald" />
          </StaggerGrid>
        }
      />

      {/* Plan card + monthly cost trend */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <PanelCard accent="slate">
          <PanelHeader
            title="Plan"
            subtitle={billingSummary.plan}
            icon={CreditCard}
            accent="slate"
          />
          <div className="flex flex-col gap-3 p-4 text-[12px]">
            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wide text-slate-300">Current plan</span>
                <CreditCard className="h-4 w-4 text-sky-300" />
              </div>
              <div className="mt-1 text-[22px] font-bold">{billingSummary.plan}</div>
              <div className="text-[11px] text-slate-300">Annual subscription · renews {billingSummary.renewalDate}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="text-slate-400">Seats</div>
                  <div className="tabular font-semibold">25</div>
                </div>
                <div>
                  <div className="text-slate-400">Articles / mo</div>
                  <div className="tabular font-semibold">5M</div>
                </div>
                <div>
                  <div className="text-slate-400">GLM-4 calls / mo</div>
                  <div className="tabular font-semibold">1M</div>
                </div>
                <div>
                  <div className="text-slate-400">Storage</div>
                  <div className="tabular font-semibold">2 TB</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="card-title">Payment method</div>
              <div className="mt-0.5 text-[12px] font-medium text-slate-700">{billingSummary.paymentMethod}</div>
              <div className="mt-0.5 text-[10px] text-slate-500">Billing contact: {billingSummary.billingContact}</div>
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
              <Download className="h-3.5 w-3.5" /> Download statement
            </Button>
          </div>
        </PanelCard>
        <ChartCard
          title="Monthly Cost Trend"
          subtitle="Base subscription + usage overages · trailing 12 months"
          className="xl:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center gap-1 text-sky-700"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Base</span>
              <span className="inline-flex items-center gap-1 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Overage</span>
            </div>
          }
          footer={`MRR ${formatUSD(mrr)} · Δ ${mrrDelta >= 0 ? "+" : ""}${formatUSD(mrrDelta)} vs prior month`}
        >
          <MonthlyCostChart />
        </ChartCard>
      </div>

      {/* Usage meters */}
      <PanelCard>
        <PanelHeader
          title="Usage Meters"
          subtitle="Current billing cycle · consumption vs quota"
          icon={Database}
          accent="slate"
          action={
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {usageMeters.length} meters
            </span>
          }
        />
        <div className="p-3">
          <StaggerGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {usageMeters.map((m, i) => (
              <UsageMeterCard key={m.id} meter={m} index={i} />
            ))}
          </StaggerGrid>
        </div>
      </PanelCard>

      {/* Invoices table */}
      <ChartCard
        title="Invoices"
        subtitle="Recent invoices · download PDF"
        bodyClassName="p-0"
        action={
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {invoices.length} invoices · YTD {formatUSD(invoices.reduce((s, i) => s + i.amount, 0))}
          </span>
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="text-[10px] uppercase tracking-wide text-slate-500">
              <TableHead>Invoice</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">PDF</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv: Invoice) => (
              <TableRow key={inv.id} className="text-[12px] hover:bg-slate-50/60">
                <TableCell className="font-semibold text-slate-900">{inv.id}</TableCell>
                <TableCell className="text-slate-600">{inv.period}</TableCell>
                <TableCell className="tabular text-slate-600">{inv.date}</TableCell>
                <TableCell className="tabular text-right font-semibold text-slate-800">{formatUSD(inv.amount)}</TableCell>
                <TableCell>
                  <Tag tone={invoiceStatusTone[inv.status]}>{inv.status}</Tag>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-slate-600 hover:bg-slate-100">
                    <Download className="h-3.5 w-3.5" /> PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ChartCard>
    </div>
  );
}

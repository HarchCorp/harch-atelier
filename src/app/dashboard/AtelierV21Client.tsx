"use client";
import * as React from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import type { AccountType } from "@/lib/mock-data";
import "./atelier-v21.css";

const metaByAccount: Record<AccountType, { title: string; description: string }> = {
  admin: { title: "Operations Console", description: "Full-spectrum intelligence across every monitored entity." },
  trader: { title: "Signal Desk", description: "Pre-market intelligence and OSINT signals for BVC positions." },
  legal: { title: "Due Diligence Terminal", description: "Adverse media, sanctions screening, ownership intelligence." },
  market: { title: "Market Intelligence", description: "Share of voice, competitive benchmarking, risk matrix." },
  self: { title: "My Watch", description: "Personalized monitoring for your tracked entities." },
  pr: { title: "Crisis & Reputation Console", description: "Real-time sentiment velocity and crisis-level alerts." },
};

function Empty({ title, desc }: { title: string; desc?: string }) {
  return <div className="flex flex-col items-center justify-center py-12 text-center"><div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 mb-3"><span className="text-slate-300 text-[16px]">○</span></div><p className="text-[12px] font-medium text-slate-500">{title}</p>{desc ? <p className="mt-1 text-[10px] text-slate-400 max-w-[260px]">{desc}</p> : null}</div>;
}

function Card({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 px-4 py-3"><h3 className="card-title">{title}</h3>{sub ? <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p> : null}</div><div className="p-4">{children}</div></div>;
}

function KPIs({ data }: { data: any }) {
  const k = data.kpis;
  const cards = [
    { l: "Composite Risk Index", v: k.riskIndex.toFixed(1), u: "/100", c: "text-rose-600", b: "bg-rose-50" },
    { l: "Coverage Volume", v: k.coverage30d.toLocaleString(), u: "articles", c: "text-sky-600", b: "bg-sky-50" },
    { l: "Negative Share", v: `${k.negativeShare}`, u: "%", c: "text-amber-600", b: "bg-amber-50" },
    { l: "Active Alerts", v: `${k.activeAlerts}`, u: "open", c: "text-violet-600", b: "bg-violet-50" },
  ];
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(x => <div key={x.l} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${x.b}`}><span className={`text-[10px] font-bold ${x.c}`}>●</span></span></div><div className="mt-2 flex items-baseline gap-1"><span className="tabular text-[26px] font-bold text-slate-900">{x.v}</span><span className="text-[12px] font-medium text-slate-400">{x.u}</span></div><p className="mt-1 text-[10px] text-slate-400">{x.l}</p></div>)}</div>;
}

function EventsTable({ data }: { data: any }) {
  return <Card title="Risk Events" sub="Negative coverage detected by HarchIQ">{data.riskEvents.length === 0 ? <Empty title="No negative coverage detected" desc="Risk events will appear here once HarchIQ identifies adverse media." /> : <div className="harch-scroll max-h-[340px] overflow-y-auto"><table className="w-full"><thead><tr className="h-8 border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-500"><th className="py-0 pr-3 text-left">Date</th><th className="py-0 pr-3 text-left">Pillar</th><th className="py-0 pr-3 text-left">Headline</th><th className="py-0 pr-3 text-left">Source</th><th className="py-0 text-right">Severity</th></tr></thead><tbody>{data.riskEvents.slice(0, 20).map((e: any) => <tr key={e.id} className="group h-8 border-b border-slate-50 hover:bg-slate-50"><td className="py-0 pr-3 text-[11px] text-slate-500 tabular">{e.date}</td><td className="py-0 pr-3 text-[11px] text-slate-600">{e.pillar}</td><td className="py-0 pr-3 text-[12px] font-medium text-slate-800 truncate max-w-[300px]">{e.title}</td><td className="py-0 pr-3 text-[11px] text-slate-500 truncate max-w-[100px]">{e.source}</td><td className="py-0 text-right"><span className={`text-[10px] font-semibold capitalize ${e.severity === "critical" ? "text-rose-600" : e.severity === "high" ? "text-orange-600" : e.severity === "medium" ? "text-amber-600" : "text-slate-400"}`}>{e.severity}</span></td></tr>)}</tbody></table></div>}</Card>;
}

function Coverage({ data }: { data: any }) {
  return <Card title="Media Coverage" sub="Article volume · last 30 days">{data.coverage30d.length === 0 ? <Empty title="No coverage data" desc="Article counts will appear once sources are monitored." /> : <div className="space-y-1">{data.coverage30d.slice(-14).map((d: any) => { const t = d.positive + d.negative; return <div key={d.date} className="flex items-center gap-2"><span className="tabular w-16 text-[10px] text-slate-400">{d.date.slice(5)}</span><div className="flex h-4 flex-1 gap-0.5"><div className="h-full rounded-l bg-emerald-400" style={{ width: `${t > 0 ? d.positive / t * 100 : 0}%` }} /><div className="h-full rounded-r bg-rose-400" style={{ width: `${t > 0 ? d.negative / t * 100 : 0}%` }} /></div><span className="tabular w-8 text-right text-[10px] font-semibold text-slate-600">{t}</span></div>; })}</div>}</Card>;
}

function SoV({ data }: { data: any }) {
  const total = data.shareOfVoice.reduce((s: number, c: any) => s + c.value, 0) || 1;
  return <Card title="Share of Voice" sub="Coverage by company">{data.shareOfVoice.length === 0 || total === 0 ? <Empty title="No share of voice data" desc="Company coverage will appear once articles are indexed." /> : <div className="space-y-2">{data.shareOfVoice.map((c: any, i: number) => <div key={c.name} className="flex items-center gap-2"><span className="w-32 truncate text-[11px] font-medium text-slate-700">{c.name}</span><div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${i === 0 ? "bg-slate-800" : "bg-slate-400"}`} style={{ width: `${c.value / total * 100}%` }} /></div><span className="tabular w-10 text-right text-[11px] font-semibold text-slate-700">{c.value}</span></div>)}</div>}</Card>;
}

function Sources({ data }: { data: any }) {
  return <Card title="Top Sources" sub="Outlets driving coverage">{data.topSources.length === 0 ? <Empty title="No source data" desc="Source distribution will appear once articles are scraped." /> : <div className="space-y-1.5">{data.topSources.map((s: any) => <div key={s.source} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50"><span className="flex-1 truncate text-[12px] font-medium text-slate-700">{s.source}</span><div className="flex h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="bg-emerald-500" style={{ width: `${s.articles > 0 ? s.positive / s.articles * 100 : 0}%` }} /><div className="bg-slate-300" style={{ width: `${s.articles > 0 ? s.neutral / s.articles * 100 : 0}%` }} /><div className="bg-rose-500" style={{ width: `${s.articles > 0 ? s.negative / s.articles * 100 : 0}%` }} /></div><span className="tabular w-8 text-right text-[12px] font-bold text-slate-800">{s.articles}</span></div>)}</div>}</Card>;
}

function Pillars({ data }: { data: any }) {
  return <Card title="Risk Pillars" sub="Exposure by category">{data.pillarAgg.length === 0 ? <Empty title="No risk pillar data" desc="Risk categories will appear once adverse media is detected." /> : <div className="space-y-2">{data.pillarAgg.map((p: any) => <div key={p.pillar} className="flex items-center gap-2"><span className="w-28 truncate text-[11px] font-medium text-slate-700">{p.pillar}</span><div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${p.exposure}%` }} /></div><span className="tabular w-8 text-right text-[11px] font-bold text-slate-800">{p.events}</span></div>)}</div>}</Card>;
}

export default function AtelierV21Client({ data }: { data: any }) {
  const [accountType, setAccountType] = React.useState<AccountType>("market");
  const meta = metaByAccount[accountType];
  return (
    <DashboardShell accountType={accountType} onAccountTypeChange={setAccountType} onOpenPalette={() => {}} onOpenAlert={() => {}} title={meta.title} description={meta.description}>
      {!data.hasData ? (
        <div className="flex min-h-[60vh] flex-col items-center justify-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm mb-4"><span className="text-[28px] text-slate-300">◉</span></div><h2 className="text-[18px] font-bold text-slate-900">No intelligence data yet</h2><p className="mt-2 max-w-[400px] text-center text-[13px] text-slate-500">The HarchIQ engine hasn't scanned any media sources yet. Once articles are ingested and analyzed, risk events, sentiment trends, and coverage analytics will appear here in real time.</p><div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Engine: Standby</span><span className="h-3 w-px bg-slate-200" /><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-slate-300" />Sources: 0 monitored</span></div></div>
      ) : (
        <div className="flex flex-col gap-5">
          <KPIs data={data} />
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2"><EventsTable data={data} /><Coverage data={data} /></div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2"><SoV data={data} /><Sources data={data} /></div>
          <Pillars data={data} />
        </div>
      )}
    </DashboardShell>
  );
}

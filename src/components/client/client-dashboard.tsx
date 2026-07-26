"use client";

import * as React from "react";
import { ShieldCheck, LogOut, ExternalLink, Sparkles, Bell, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReputationConsole } from "@/components/dashboard/reputation-console";
import { useRealData } from "@/hooks/use-real-data";
import type { ReputationSnapshot } from "@/lib/real-data";
import { useClientStore } from "@/lib/client-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  return Math.floor(s / 3600) + "h ago";
}

export function ClientDashboard() {
  const session = useClientStore((s) => s.session);
  const logout = useClientStore((s) => s.logout);
  const brand = session?.brand || "HarchCorp";
  const { data, loading, refetch } = useRealData<ReputationSnapshot>(
    "/api/real/reputation?brand=" + encodeURIComponent(brand),
    { pollMs: 10 * 60 * 1000 },
  );

  const handleLogout = () => {
    logout();
    toast.success("Signed out", { description: "Your session has been cleared." });
    setTimeout(() => window.location.reload(), 300);
  };

  const handleExportReport = () => {
    if (!data) return;
    const payload = {
      brand,
      generatedAt: new Date().toISOString(),
      contactName: session?.contactName,
      plan: session?.plan,
      harchIQ: data.harchIQ,
      media: { totalMentions: data.media.totalMentions, negativeShare: data.media.negativeShare, topSources: data.media.topSources, recentMentions: data.media.mentions.slice(0, 5) },
      aiVisibility: { score: data.aiVisibility.visibilityScore, avgRank: data.aiVisibility.avgRank, engines: data.aiVisibility.entries.map((e) => ({ engine: e.engine, mentions: e.mentions, rank: e.rank })) },
      crisis: { alertsCount: data.crisis.alerts.length, critical: data.crisis.criticalCount, spike: data.crisis.spikeDetected, recentAlerts: data.crisis.alerts.slice(0, 3).map((a) => ({ severity: a.severity, title: a.title, source: a.source, timeToImpact: a.timeToImpact })) },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = brand.toLowerCase().replace(/\s+/g, "-") + "-reputation-report.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported", { description: a.download });
  };

  if (!session) return null;
  const iq = data?.harchIQ;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700 shadow">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tight text-slate-900">Harch<span className="text-slate-400">Atelier</span></span>
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-slate-400">Client Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => toast.info("Alerts", { description: data?.crisis?.alerts.length + " active alerts for " + brand })} className="h-8 gap-1.5 px-2.5 text-[12px] text-slate-600">
            <Bell className="h-3.5 w-3.5" />
            {data?.crisis?.alerts.length ? (
              <span className="tabular rounded-full bg-rose-100 px-1.5 text-[9px] font-bold text-rose-700">{data.crisis.alerts.length}</span>
            ) : null}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportReport} disabled={!data} className="h-8 gap-1.5 px-2.5 text-[12px] text-slate-600">
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export report</span>
          </Button>
          <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1 sm:flex">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
              {session.contactName.charAt(0)}
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-semibold text-slate-800">{session.contactName}</span>
              <span className="text-[9px] text-slate-400">{session.brand} · {session.plan}</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="h-8 gap-1.5 border-slate-200 px-2.5 text-[12px] text-slate-600">
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 lg:px-6">
        {/* Hero greeting */}
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl">
          <div className="absolute" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300">Welcome back</p>
              <h1 className="mt-1 text-[24px] font-bold tracking-tight">{session.contactName}</h1>
              <p className="mt-1 text-[13px] text-slate-300">
                Monitoring reputation for <span className="font-semibold text-white">{brand}</span> · {session.plan} plan
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                Last updated {data ? timeAgo(data.fetchedAt) : "…"} · auto-refreshes every 10 min
              </p>
            </div>
            {iq ? (
              <div className="flex items-center gap-4 rounded-xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">HarchIQ</span>
                  <span className={cn("tabular text-[32px] font-bold leading-none", iq.score >= 80 ? "text-emerald-300" : iq.score >= 60 ? "text-amber-300" : "text-rose-300")}>{iq.score}</span>
                  <span className="text-[10px] text-slate-400">/100 · grade {iq.grade}</span>
                </div>
                <div className="h-12 w-px bg-white/10" />
                <div className="flex flex-col gap-1">
                  {Object.entries(iq.components).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2">
                      <span className="w-24 text-[9px] uppercase tracking-wide text-slate-400">{k.replace(/([A-Z])/g, " $1").trim()}</span>
                      <div className="h-1 w-20 overflow-hidden rounded-full bg-white/10">
                        <div className={cn("h-full rounded-full", v > 70 ? "bg-emerald-400" : v > 50 ? "bg-amber-400" : "bg-rose-400")} style={{ width: v + "%" }} />
                      </div>
                      <span className="tabular w-6 text-[9px] font-bold text-slate-300">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Reputation Console — the 4 pillars */}
        <ReputationConsole brand={brand} />

        {/* Crisis alerts summary (if any) */}
        {data?.crisis?.alerts.length ? (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-rose-600" />
                <h3 className="text-[13px] font-bold text-rose-900">Crisis Alerts ({data.crisis.alerts.length})</h3>
                {data.crisis.spikeDetected ? (
                  <Badge className="bg-rose-600 text-[9px] font-bold uppercase text-white hover:bg-rose-600">Spike detected</Badge>
                ) : null}
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.info("WhatsApp alerts", { description: "In production, these alerts are sent to your WhatsApp within 5 minutes." })} className="h-7 text-[11px] text-rose-700">
                Configure WhatsApp <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2">
              {data.crisis.alerts.slice(0, 3).map((a) => (
                <div key={a.id} className="flex items-start gap-2 rounded-lg bg-white p-2 ring-1 ring-rose-100">
                  <span className={cn("mt-0.5 rounded px-1.5 py-px text-[8px] font-bold uppercase", a.severity === "critical" ? "bg-rose-600 text-white" : a.severity === "high" ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700")}>{a.severity}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-slate-800">{a.title}</p>
                    <p className="text-[10px] text-slate-400">{a.source} · respond within {a.timeToImpact} min</p>
                  </div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer link back to operator console */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Sparkles className="h-3 w-3" />
          <span>This is your client view. For the full operator console,</span>
          <Link href="/" className="font-medium text-emerald-600 hover:underline">open the dashboard →</Link>
        </div>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3 text-[10px] text-slate-400 lg:px-6">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Harch Atelier · Client Portal</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">v25</span>
          </div>
          <span>© 2025 HarchCorp · AI Reputation Intelligence for Africa</span>
        </div>
      </footer>
    </div>
  );
}

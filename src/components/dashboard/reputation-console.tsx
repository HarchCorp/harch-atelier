"use client";

/**
 * Harch Atelier — Reputation Console (V24.0)
 *
 * The production-aligned centerpiece: shows the 4 pillars of AI Reputation
 * Intelligence for Africa (per atelier.harchcorp.com):
 *   1. Media Monitoring — 30+ Moroccan/African sources with real sentiment
 *   2. AI Visibility — what 8 AI engines say about the brand
 *   3. Crisis Alerts — WhatsApp-ready negative-spike alerts
 *   4. HarchIQ Score — trainable composite reputation score
 *
 * Fetches real data from /api/real/reputation?brand=HarchCorp. Polls every
 * 10 min. Shows a LIVE badge + last-fetched time.
 */
import * as React from "react";
import {
  Newspaper,
  Bot,
  AlertTriangle,
  Gauge,
  RefreshCw,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
} from "lucide-react";
import { useRealData } from "@/hooks/use-real-data";
import { cn } from "@/lib/utils";
import type { ReputationSnapshot } from "@/lib/real-data";

const sentimentDot: Record<string, string> = {
  positive: "bg-emerald-500",
  negative: "bg-rose-500",
  neutral: "bg-slate-400",
};
const severityChip: Record<string, string> = {
  critical: "bg-rose-100 text-rose-700 ring-rose-200",
  high: "bg-orange-100 text-orange-700 ring-orange-200",
  medium: "bg-amber-100 text-amber-700 ring-amber-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  const tone =
    score >= 80 ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
    : score >= 70 ? "bg-sky-100 text-sky-700 ring-sky-200"
    : score >= 60 ? "bg-amber-100 text-amber-700 ring-amber-200"
    : "bg-rose-100 text-rose-700 ring-rose-200";
  return (
    <span className={cn("tabular inline-flex items-center justify-center rounded-lg px-2.5 py-1 text-[16px] font-bold ring-1", tone)}>
      {grade}
    </span>
  );
}

export function ReputationConsole({ brand = "HarchCorp" }: { brand?: string }) {
  const { data, error, loading, refetch } = useRealData<ReputationSnapshot>(
    `/api/real/reputation?brand=${encodeURIComponent(brand)}`,
    { pollMs: 10 * 60 * 1000 },
  );

  const iq = data?.harchIQ;

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </span>
          <div>
            <h3 className="card-title">Reputation Intelligence · {brand}</h3>
            <p className="mt-0.5 text-[10px] text-slate-400">4 pillars · AI Reputation Intelligence for Africa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            LIVE · real data
          </span>
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      {error ? (
        <div className="p-6 text-center text-[12px] text-rose-500">
          Failed to load reputation data: {error}
          <br />
          <button onClick={refetch} className="mt-2 text-emerald-600 underline">Retry</button>
        </div>
      ) : !data ? (
        <div className="p-6 text-center text-[12px] text-slate-400">
          <RefreshCw className="mx-auto mb-2 h-5 w-5 animate-spin text-slate-300" />
          Fetching real reputation data (media, AI visibility, crisis alerts)…
        </div>
      ) : (
        <>
          {/* HarchIQ hero strip */}
          {iq ? (
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
              <div className="flex items-center gap-3">
                <GradeBadge grade={iq.grade} score={iq.score} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="tabular text-[24px] font-bold leading-none text-slate-900">{iq.score}</span>
                    <span className="text-[11px] text-slate-400">/100 HarchIQ</span>
                    {iq.trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-600" />
                      : iq.trend === "down" ? <TrendingDown className="h-4 w-4 text-rose-600" />
                      : <Minus className="h-4 w-4 text-slate-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400">Composite reputation score</p>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-1 flex-wrap items-center gap-3">
                {Object.entries(iq.components).map(([k, v]) => (
                  <div key={k} className="flex flex-col">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            v > 70 ? "bg-emerald-500" : v > 50 ? "bg-amber-500" : "bg-rose-500",
                          )}
                          style={{ width: `${v}%` }}
                        />
                      </div>
                      <span className="tabular text-[10px] font-bold text-slate-600">{v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 4-pillar grid */}
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {/* Pillar 1: Media Monitoring */}
            <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="h-3.5 w-3.5 text-violet-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Media Monitoring</span>
                </div>
                {data.media ? (
                  <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                    {data.media.totalMentions} mentions · {data.media.negativeShare}% neg
                  </span>
                ) : null}
              </div>
              <div className="harch-scroll max-h-[200px] space-y-1.5 overflow-y-auto pr-1">
                {data.media?.mentions.slice(0, 6).map((m, i) => (
                  <a key={i} href={m.url} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-2 rounded-md p-1 hover:bg-slate-50">
                    <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", sentimentDot[m.sentiment])} />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-[11px] font-medium text-slate-700 group-hover:text-slate-900">{m.title}</p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                        <span className="truncate">{m.source}</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </a>
                )) || <p className="text-[11px] text-slate-400">Loading…</p>}
              </div>
            </div>

            {/* Pillar 2: AI Visibility */}
            <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-sky-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Visibility</span>
                </div>
                {data.aiVisibility ? (
                  <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                    {data.aiVisibility.visibilityScore}% · avg #{data.aiVisibility.avgRank ?? "—"}
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {data.aiVisibility?.entries.map((e, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1",
                    e.mentions ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/50",
                  )}>
                    <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", e.mentions ? "bg-emerald-500" : "bg-slate-300")} />
                    <span className="flex-1 truncate text-[10px] font-medium text-slate-700">{e.engine}</span>
                    {e.mentions && e.rank ? (
                      <span className="tabular text-[9px] font-bold text-emerald-700">#{e.rank}</span>
                    ) : e.mentions ? (
                      <span className="text-[9px] font-bold text-emerald-600">✓</span>
                    ) : (
                      <span className="text-[9px] text-slate-400">—</span>
                    )}
                  </div>
                )) || Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-7 rounded-md bg-slate-100" />
                ))}
              </div>
            </div>

            {/* Pillar 3: Crisis Alerts */}
            <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r lg:border-t-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Crisis Alerts</span>
                </div>
                {data.crisis ? (
                  <span className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ring-1",
                    data.crisis.spikeDetected ? "bg-rose-50 text-rose-700 ring-rose-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  )}>
                    {data.crisis.spikeDetected ? "SPIKE DETECTED" : "NO SPIKE"}
                  </span>
                ) : null}
              </div>
              <div className="harch-scroll max-h-[200px] space-y-1.5 overflow-y-auto pr-1">
                {data.crisis?.alerts.length ? data.crisis.alerts.slice(0, 4).map((a) => (
                  <div key={a.id} className="rounded-md border border-slate-100 p-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("rounded px-1 py-px text-[8px] font-bold uppercase ring-1", severityChip[a.severity])}>
                        {a.severity}
                      </span>
                      <span className="tabular text-[9px] text-slate-400">{a.timeToImpact}min to respond</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[10px] font-medium text-slate-700">{a.title}</p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">{a.source}</p>
                  </div>
                )) : (
                  <div className="flex items-center gap-2 rounded-md bg-emerald-50/60 p-2 text-[10px] text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    No active crisis alerts — sentiment is stable.
                  </div>
                )}
              </div>
            </div>

            {/* Pillar 4: HarchIQ Drivers */}
            <div className="p-4">
              <div className="mb-2 flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Score Drivers</span>
              </div>
              <div className="space-y-1.5">
                {iq?.drivers.map((d, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-md p-1 hover:bg-slate-50">
                    <span className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      d.impact === "positive" ? "bg-emerald-500" : d.impact === "negative" ? "bg-rose-500" : "bg-slate-400",
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-slate-700">{d.factor}</p>
                      <p className="text-[9px] text-slate-400">{d.detail}</p>
                    </div>
                  </div>
                )) || Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-8 rounded-md bg-slate-100" />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2">
            <span className="text-[9px] text-slate-400">
              Sources: 30+ MA/African media · 8 AI engines · GLM-4 sentiment · WhatsApp alerts
            </span>
            <span className="text-[9px] text-slate-400">Updated {timeAgo(data.fetchedAt)}</span>
          </footer>
        </>
      )}
    </section>
  );
}

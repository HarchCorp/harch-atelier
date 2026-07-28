"use client";

/**
 * RealDataPanel — a premium widget showing LIVE real data:
 *  - FX rates (EUR/MAD, USD/MAD) from open.er-api.com
 *  - Latest news with GLM-classified sentiment (green/amber/red dots)
 *  - MASI index + market quotes from web search
 *
 * Rendered on the dashboard so the user immediately sees REAL data (not mock).
 * Polls every 5 min. Shows a "LIVE · real data" badge + last-fetched time.
 */
import * as React from "react";
import { Newspaper, TrendingUp, RefreshCw, ExternalLink, Globe2 } from "lucide-react";
import { useRealData } from "@/hooks/use-real-data";
import { cn } from "@/lib/utils";
import type { RealBrief } from "@/lib/real-data";

const sentimentDot: Record<string, string> = {
  positive: "bg-emerald-500",
  negative: "bg-rose-500",
  neutral: "bg-slate-400",
};
const sentimentText: Record<string, string> = {
  positive: "text-emerald-700",
  negative: "text-rose-700",
  neutral: "text-slate-500",
};

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function RealDataPanel() {
  const { data, error, loading, refetch } = useRealData<RealBrief>("/api/real/brief?q=HarchCorp+Casablanca", {
    pollMs: 5 * 60 * 1000,
  });

  return (
    <section className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-50">
            <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
          </span>
          <div>
            <h3 className="card-title">Real-Time Intelligence</h3>
            <p className="mt-0.5 text-[10px] text-slate-400">Live FX · news + GLM sentiment · market quotes</p>
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

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
        {/* FX rates */}
        <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-sky-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">FX Rates</span>
          </div>
          {error ? (
            <p className="text-[11px] text-rose-500">FX unavailable</p>
          ) : !data?.fx ? (
            <div className="space-y-2">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-slate-500">EUR/MAD</span>
                <span className="tabular text-[18px] font-bold text-slate-900">{data.fx.eurMad.toFixed(3)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-slate-500">USD/MAD</span>
                <span className="tabular text-[18px] font-bold text-slate-900">{data.fx.usdMad.toFixed(3)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-[11px] font-medium text-slate-500">GBP/MAD</span>
                <span className="tabular text-[14px] font-semibold text-slate-700">{data.fx.rates.GBP.toFixed(3)}</span>
              </div>
              <p className="pt-1 text-[9px] text-slate-400">Source: {data.fx.source} · {timeAgo(data.fx.fetchedAt)}</p>
            </div>
          )}
        </div>

        {/* MASI + market */}
        <div className="border-b border-slate-100 p-4 lg:border-b-0 lg:border-r">
          <div className="mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">BVC / MASI</span>
          </div>
          {error || !data?.market ? (
            <p className="text-[11px] text-slate-400">Market loading…</p>
          ) : (
            <div className="space-y-2">
              {data.market.masi ? (
                <div className="rounded-md bg-amber-50 px-2 py-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] font-bold text-amber-800">MASI Index</span>
                    <span className="tabular text-[16px] font-bold text-amber-900">{data.market.masi.value}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[9px] text-amber-700">{data.market.masi.snippet.slice(0, 80)}…</p>
                </div>
              ) : null}
              {data.market.quotes.slice(0, 2).map((q, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px]">
                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                  <span className="line-clamp-2 text-slate-600">{q.snippet.slice(0, 90)}</span>
                </div>
              ))}
              <p className="pt-1 text-[9px] text-slate-400">Source: {data.market.source} · {timeAgo(data.market.fetchedAt)}</p>
            </div>
          )}
        </div>

        {/* News + sentiment */}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">News + Sentiment</span>
            </div>
            {data?.news ? (
              <span className="tabular rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                {data.news.negativeShare}% neg
              </span>
            ) : null}
          </div>
          {error ? (
            <p className="text-[11px] text-rose-500">News unavailable</p>
          ) : !data?.news?.items.length ? (
            <p className="text-[11px] text-slate-400">Fetching news…</p>
          ) : (
            <div className="harch-scroll max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
              {data.news.items.slice(0, 6).map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-md p-1 transition-colors hover:bg-slate-50"
                >
                  <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", sentimentDot[item.sentiment])} />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-medium text-slate-700 group-hover:text-slate-900">
                      {item.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[9px] text-slate-400">
                      <span className={sentimentText[item.sentiment]}>{item.sentiment}</span>
                      <span>·</span>
                      <span className="truncate">{item.source}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {data?.news ? (
            <p className="mt-2 text-[9px] text-slate-400">
              {data.news.totalFound} articles · GLM-4 classified · {timeAgo(data.news.fetchedAt)}
            </p>
          ) : null}
        </div>
      </div>

      {/* Footer: composite risk from real data */}
      {data ? (
        <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2">
          <span className="text-[10px] text-slate-500">
            Real composite risk index:{" "}
            <span className={cn("tabular font-bold", data.riskIndex > 70 ? "text-rose-700" : data.riskIndex > 55 ? "text-amber-700" : "text-emerald-700")}>
              {data.riskIndex.toFixed(1)}/100
            </span>
            <span className="ml-1.5 text-slate-400">derived from {data.news.totalFound} news items</span>
          </span>
          <span className="text-[9px] text-slate-400">Updated {timeAgo(data.fetchedAt)}</span>
        </footer>
      ) : null}
    </section>
  );
}

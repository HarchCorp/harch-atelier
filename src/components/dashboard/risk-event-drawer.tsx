"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Globe,
  Globe2,
  Users2,
  Newspaper,
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  Bell,
  ShieldAlert,
  ShieldCheck,
  Clock,
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Layers3,
  RotateCcw,
} from "lucide-react";
import {
  getArticlesFor,
  getEntitiesFor,
  regionNames,
  sentimentColor,
  severityColor,
  type RiskEvent,
} from "@/lib/mock-data";
import { useRiskStore, useActionState, type ActionState } from "@/lib/risk-store";
import { EntityProfileDialog } from "./entity-profile-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RiskEventDrawerProps {
  event: RiskEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pillarTint: Record<string, string> = {
  Regulatory: "bg-violet-50 text-violet-700 ring-violet-200",
  Cyber: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Financial: "bg-sky-50 text-sky-700 ring-sky-200",
  ESG: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Geopolitical: "bg-amber-50 text-amber-700 ring-amber-200",
  Reputational: "bg-rose-50 text-rose-700 ring-rose-200",
};

const tierLabel: Record<string, string> = {
  tier1: "Tier 1 · Legacy",
  tier2: "Tier 2 · Trade",
  tier3: "Tier 3 · Long-tail",
};

function formatRelative(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.round(diffMs / 3_600_000);
  if (diffH < 1) return "just now";
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `${diffD}d ago`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const languageLabel: Record<string, string> = {
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  zh: "Chinese",
};

function GlmSummary({ event }: { event: RiskEvent }) {
  // Deterministic GLM-4 style synthesis (no network call).
  const tone =
    event.sentiment === "negative"
      ? "adverse"
      : event.sentiment === "positive"
        ? "favorable"
        : "neutral";
  const intensity =
    event.severity === "critical"
      ? "elevated and accelerating"
      : event.severity === "high"
        ? "elevated"
        : event.severity === "medium"
          ? "moderate"
          : "low-grade";
  const reach = event.articles * 4_200;
  return (
    <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-violet-600" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          GLM-4 Synthesis
        </span>
        <Badge variant="secondary" className="ml-auto h-4 px-1.5 text-[9px] font-medium">
          auto-generated
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-slate-700">
        Coverage of the <span className="font-semibold text-slate-900">{event.pillar.toLowerCase()}</span> signal{" "}
        <span className="font-medium text-slate-900">&ldquo;{event.title}&rdquo;</span> is currently{" "}
        <span className="font-semibold text-slate-900">{tone}</span> with{" "}
        <span className="font-semibold text-slate-900">{intensity}</span> media velocity. An estimated{" "}
        <span className="tabular font-semibold text-slate-900">{reach.toLocaleString()}</span> readers have been
        exposed across <span className="tabular font-semibold text-slate-900">{event.articles}</span> deduplicated
        articles. Top-tier outlets dominate the narrative frame; recommend a coordinated holding statement and a
        48-hour sentiment re-baseline.
      </p>
    </div>
  );
}

function ArticleRow({ a }: { a: import("@/lib/mock-data").Article }) {
  const snt = sentimentColor[a.sentiment];
  return (
    <a
      href={a.url}
      onClick={(e) => e.preventDefault()}
      className="group flex items-start gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
    >
      <span className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", snt.dot)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[12px] font-medium text-slate-800 group-hover:text-slate-900">
            {a.headline}
          </span>
          <ExternalLink className="h-3 w-3 shrink-0 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-400">
          <span className="font-medium text-slate-500">{a.source}</span>
          <span className="rounded bg-slate-100 px-1 py-px text-[9px] font-medium text-slate-500">
            {tierLabel[a.tier]}
          </span>
          <span className="flex items-center gap-0.5">
            <Globe className="h-2.5 w-2.5" />
            {languageLabel[a.language]}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            {formatRelative(a.publishedAt)}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="tabular text-[11px] font-semibold text-slate-700">
          {(a.reach / 1000).toFixed(0)}k
        </div>
        <div className="text-[9px] uppercase tracking-wide text-slate-400">reach</div>
      </div>
    </a>
  );
}

function Breadcrumb({ event, onClose }: { event: RiskEvent; onClose: () => void }) {
  const setFilter = useRiskStore((s) => s.setFilter);
  const regionLabel = regionNames[event.region] ?? event.region;
  const applyRegion = () => {
    setFilter("region", event.region);
    toast.success(`Filtered by region: ${regionLabel}`, {
      description: `Showing events in ${regionLabel}.`,
    });
    onClose();
  };
  const applyPillar = () => {
    setFilter("pillar", event.pillar);
    toast.success(`Filtered by pillar: ${event.pillar}`, {
      description: `Showing ${event.pillar} events.`,
    });
    onClose();
  };
  return (
    <nav aria-label="Event context" className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
      <button
        type="button"
        onClick={applyRegion}
        className="flex items-center gap-1 rounded px-1 py-0.5 font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        title={`Filter by region: ${regionLabel}`}
      >
        <Globe2 className="h-3 w-3" />
        {regionLabel}
      </button>
      <ChevronRight className="h-3 w-3 text-slate-300" />
      <button
        type="button"
        onClick={applyPillar}
        className="flex items-center gap-1 rounded px-1 py-0.5 font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
        title={`Filter by pillar: ${event.pillar}`}
      >
        <Layers3 className="h-3 w-3" />
        {event.pillar}
      </button>
      <ChevronRight className="h-3 w-3 text-slate-300" />
      <span className="flex items-center gap-1 px-1 py-0.5 font-semibold text-slate-700">
        <ShieldCheck className="h-3 w-3" />
        <span className="tabular">{event.id}</span>
      </span>
    </nav>
  );
}

export function RiskEventDrawer({ event, open, onOpenChange }: RiskEventDrawerProps) {
  const articles = React.useMemo(() => (event ? getArticlesFor(event) : []), [event]);
  const entities = React.useMemo(
    () => (event ? getEntitiesFor(event, event.title.length) : []),
    [event],
  );
  const sc = event ? severityColor[event.severity] : null;
  const snt = event ? sentimentColor[event.sentiment] : null;

  // Shared action state from the Zustand store (syncs with table + alerts).
  const actionState = useActionState(event?.id);
  const setAction = useRiskStore((s) => s.setAction);
  const [entityOpen, setEntityOpen] = React.useState<string | null>(null);

  const fireAction = React.useCallback(
    (action: ActionState) => {
      if (!event) return;
      setAction(event.id, action, event.title);
      const label =
        action === "acknowledged"
          ? "Acknowledged"
          : action === "escalated"
            ? "Escalated"
            : action === "watching"
              ? "Added to watchlist"
              : "";
      const verb =
        action === "acknowledged"
          ? "acknowledged"
          : action === "escalated"
            ? "escalated to the incident channel"
            : action === "watching"
              ? "added to your watchlist"
              : "";
      toast.success(`${label}: ${event.title}`, {
        description: `Event ${event.id} has been ${verb}.`,
      });
    },
    [event, setAction],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="harch-scroll w-full overflow-y-auto border-slate-200 bg-white p-0 sm:max-w-[560px]"
      >
        {event && sc && snt ? (
          <div className="flex h-full flex-col">
            {/* Header band */}
            <div className={cn("border-b px-5 pb-4 pt-4", sc.bg)}>
              <SheetHeader className="space-y-0 p-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
                      sc.bg,
                      sc.text,
                      sc.ring,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                    {event.severity}
                  </span>
                  <span
                    className={cn(
                      "inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset",
                      pillarTint[event.pillar],
                    )}
                  >
                    {event.pillar}
                  </span>
                  <span className="ml-auto tabular text-[10px] font-medium text-slate-500">
                    {event.id}
                  </span>
                </div>
                <SheetTitle className="text-left text-[16px] font-bold leading-snug text-slate-900">
                  {event.title}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Risk event detail: {event.title}
                </SheetDescription>
              </SheetHeader>

              {/* Quick stats grid */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-md bg-white/70 px-2.5 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Articles</div>
                  <div className="tabular text-[16px] font-bold text-slate-900">{event.articles}</div>
                </div>
                <div className="rounded-md bg-white/70 px-2.5 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Sentiment</div>
                  <div className={cn("flex items-center gap-1 text-[13px] font-semibold capitalize", snt.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", snt.dot)} />
                    {event.sentiment}
                  </div>
                </div>
                <div className="rounded-md bg-white/70 px-2.5 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">Detected</div>
                  <div className="tabular text-[12px] font-semibold text-slate-700">
                    {formatRelative(event.date)}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="harch-scroll flex-1 overflow-y-auto px-5 py-4">
              {/* Drill-up breadcrumb */}
              <Breadcrumb event={event} onClose={() => onOpenChange(false)} />

              {/* GLM summary */}
              <div className="mt-3">
                <GlmSummary event={event} />
              </div>

              {/* Affected entities */}
              <section className="mt-4">
                <div className="flex items-center gap-1.5">
                  <Users2 className="h-3.5 w-3.5 text-slate-400" />
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Affected entities
                  </h4>
                  <span className="text-[9px] text-slate-300">· click for profile</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entities.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEntityOpen(e)}
                      className="group inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white hover:text-slate-900"
                      title={`Open profile for ${e}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-slate-600" />
                      {e}
                      <ExternalLink className="h-2.5 w-2.5 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </section>

              <Separator className="my-4 bg-slate-100" />

              {/* Articles list */}
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Newspaper className="h-3.5 w-3.5 text-slate-400" />
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Source articles
                    </h4>
                  </div>
                  <span className="tabular text-[10px] text-slate-400">
                    {articles.length} of {event.articles}
                  </span>
                </div>
                <div className="mt-2 space-y-0.5">
                  {articles.map((a) => (
                    <ArticleRow key={a.id} a={a} />
                  ))}
                </div>
              </section>
            </div>

            {/* Footer actions */}
            <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => fireAction("acknowledged")}
                  disabled={actionState === "acknowledged"}
                  className={cn(
                    "h-8 gap-1.5",
                    actionState === "acknowledged"
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-slate-900 text-white hover:bg-slate-800",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {actionState === "acknowledged" ? "Acknowledged" : "Acknowledge"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fireAction("escalated")}
                  disabled={actionState === "escalated"}
                  className={cn(
                    "h-8 gap-1.5 border-slate-200 bg-white",
                    actionState === "escalated" && "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-50",
                  )}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {actionState === "escalated" ? "Escalated" : "Escalate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fireAction("watching")}
                  disabled={actionState === "watching"}
                  className={cn(
                    "h-8 gap-1.5 border-slate-200 bg-white",
                    actionState === "watching" && "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-50",
                  )}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {actionState === "watching" ? "Watching" : "Watch"}
                </Button>
                {actionState !== "pending" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAction(event.id, "pending", event.title);
                      toast.success(`Reverted "${event.title}"`, {
                        description: "Action state cleared — event is now pending.",
                      });
                    }}
                    className="h-8 gap-1 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    title="Reset to pending"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revert
                  </Button>
                ) : null}
                <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
                  <ShieldAlert className="h-3 w-3" />
                  Last GLM pass {formatDateTime(event.date)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
      <EntityProfileDialog
        entity={entityOpen}
        open={entityOpen !== null}
        onOpenChange={(v) => { if (!v) setEntityOpen(null); }}
      />
    </Sheet>
  );
}

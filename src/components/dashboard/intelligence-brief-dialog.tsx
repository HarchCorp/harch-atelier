"use client";

/**
 * Harch Atelier — Daily Intelligence Brief Dialog (V22.0)
 *
 * A premium, auto-generated morning brief that synthesizes the platform's
 * data into a narrative summary. Role-aware: each account type gets a
 * personalized executive summary + recommended actions.
 *
 * Features:
 *  - Gradient hero with risk-level badge, date, role personalization.
 *  - Executive summary narrative.
 *  - 4 sections (Top Risks, Coverage Pulse, SoV, Watchlist) with narratives,
 *    data chips, and ranked items.
 *  - Recommended Actions panel (role-scoped).
 *  - Export (JSON) + Regenerate (re-rolls seed) + Print.
 *  - Staggered entrance animations, hover lifts, premium typography.
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
  Sparkles,
  RefreshCw,
  Download,
  Printer,
  AlertTriangle,
  Newspaper,
  PieChart,
  Radio,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  ArrowRight,
  Globe2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  generateBrief,
  riskLevelMeta,
  chipToneClass,
  itemToneClass,
  type IntelligenceBrief,
  type BriefSection,
} from "@/lib/intelligence-brief";
import { useRealData } from "@/hooks/use-real-data";
import type { RealBrief } from "@/lib/real-data";
import type { AccountType } from "@/lib/mock-data";

/* ------------------------------------------------------------------ */
/*  Icon resolver (maps string names → lucide components)              */
/* ------------------------------------------------------------------ */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  Newspaper,
  PieChart,
  Radio,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
};

function BriefIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? FileText;
  return <Icon className={className} />;
}

/* ------------------------------------------------------------------ */
/*  Section card                                                       */
/* ------------------------------------------------------------------ */
function BriefSectionCard({ section, index }: { section: BriefSection; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200">
            <BriefIcon name={section.icon} className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
            {section.title}
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {section.chips.map((chip) => (
            <span
              key={chip.label}
              className={cn(
                "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ring-1",
                chipToneClass[chip.tone],
              )}
            >
              {chip.label}: <span className="font-bold">{chip.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Narrative */}
      <div className="px-4 py-3">
        <p className="text-[12px] leading-relaxed text-slate-600">{section.narrative}</p>
      </div>

      {/* Items */}
      <div className="flex flex-col">
        {section.items.map((item, i) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center gap-3 border-t border-slate-50 border-l-[3px] px-4 py-2 transition-colors hover:bg-slate-50/60",
              itemToneClass[item.tone],
            )}
          >
            <span className="tabular w-5 shrink-0 text-center text-[10px] font-bold text-slate-300">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-slate-800">{item.title}</p>
              <p className="truncate text-[10px] text-slate-400">{item.detail}</p>
            </div>
            {item.metric ? (
              <span
                className={cn(
                  "tabular shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ring-1",
                  item.tone === "negative"
                    ? "bg-rose-50 text-rose-700 ring-rose-200"
                    : item.tone === "warning"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : item.tone === "positive"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-slate-100 text-slate-600 ring-slate-200",
                )}
              >
                {item.metric}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dialog                                                        */
/* ------------------------------------------------------------------ */

interface IntelligenceBriefDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  accountType: AccountType;
}

export function IntelligenceBriefDialog({ open, onOpenChange, accountType }: IntelligenceBriefDialogProps) {
  const [seed, setSeed] = React.useState<number>(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
    );
    return dayOfYear * 1000 + now.getHours();
  });
  const [brief, setBrief] = React.useState<IntelligenceBrief | null>(null);
  const { data: realBrief } = useRealData<RealBrief>("/api/real/brief?q=HarchCorp+Casablanca", {
    pollMs: 5 * 60 * 1000,
    skip: !open,
  });

  // Regenerate when opened or when role/seed changes.
  React.useEffect(() => {
    if (open) {
      setBrief(generateBrief(accountType, seed));
    }
  }, [open, accountType, seed]);

  const handleRegenerate = () => {
    const now = new Date();
    const newSeed = now.getTime() % 1000000;
    setSeed(newSeed);
    toast.success("Brief regenerated", {
      description: `New seed ${newSeed} · narrative re-synthesized.`,
      icon: <RefreshCw className="h-4 w-4" />,
    });
  };

  const handleExport = () => {
    if (!brief) return;
    const payload = {
      version: 1,
      generatedAt: brief.generatedAt,
      role: brief.role,
      seed: brief.seed,
      headline: brief.headline,
      riskLevel: brief.riskLevel,
      riskScore: brief.riskScore,
      executiveSummary: brief.executiveSummary,
      sections: brief.sections,
      recommendedActions: brief.recommendedActions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `harch-brief-${brief.role}-${brief.seed}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Brief exported", {
      description: `harch-brief-${brief.role}-${brief.seed}.json`,
      icon: <Download className="h-4 w-4" />,
    });
  };

  const handlePrint = () => {
    window.print();
    toast.info("Print dialog opened", {
      description: "Use 'Save as PDF' to archive this brief.",
      icon: <Printer className="h-4 w-4" />,
    });
  };

  const levelMeta = brief ? riskLevelMeta[brief.riskLevel] : riskLevelMeta.stable;
  const levelColorClass: Record<string, { bg: string; text: string; ring: string; glow: string }> = {
    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-300", ring: "ring-emerald-500/30", glow: "bg-emerald-500/15" },
    amber: { bg: "bg-amber-500/20", text: "text-amber-300", ring: "ring-amber-500/30", glow: "bg-amber-500/15" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-300", ring: "ring-orange-500/30", glow: "bg-orange-500/15" },
    rose: { bg: "bg-rose-500/20", text: "text-rose-300", ring: "ring-rose-500/30", glow: "bg-rose-500/15" },
  };
  const lc = levelColorClass[levelMeta.color] ?? levelColorClass.emerald;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Daily Intelligence Brief</DialogTitle>
          <DialogDescription>Auto-generated morning brief for {accountType}.</DialogDescription>
        </DialogHeader>

        {/* Hero banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-white">
          <div className={cn("absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl", lc.glow)} />
          <div className="absolute -bottom-12 left-1/4 h-40 w-40 rounded-full bg-slate-500/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1", lc.bg, lc.ring)}>
                <BriefIcon name={levelMeta.icon} className={cn("h-5 w-5", lc.text)} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[18px] font-bold tracking-tight">Daily Intelligence Brief</h2>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1", lc.bg, lc.text, lc.ring)}>
                    {levelMeta.label}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  {brief?.dateLabel ?? "—"} · {accountType} workspace
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-white">{brief?.headline ?? "—"}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Regenerate</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="h-8 gap-1.5 px-2.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <Printer className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Risk score + key metrics strip */}
          <div className="relative mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Risk Index</span>
              <span className="tabular text-[22px] font-bold leading-none text-white">
                {brief?.riskScore.toFixed(1) ?? "—"}
              </span>
              <span className="text-[10px] text-slate-400">/100</span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              <span>Auto-synthesized from {brief?.sections.reduce((s, sec) => s + sec.items.length, 0) ?? 0} data signals</span>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="harch-scroll max-h-[60vh] overflow-y-auto bg-slate-50/50 px-5 py-4">
          <AnimatePresence mode="wait">
            {brief ? (
              <motion.div
                key={brief.briefId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Executive summary */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Executive Summary
                    </h3>
                  </div>
                  <p className="text-[12.5px] leading-relaxed text-slate-700">{brief.executiveSummary}</p>
                </motion.div>

                {/* Real-time data banner (live FX + news + market) */}
                {realBrief ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100">
                          <Globe2 className="h-3.5 w-3.5 text-emerald-700" />
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          Live Market Data
                        </h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        REAL · live
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">EUR/MAD</p>
                        <p className="tabular text-[16px] font-bold text-slate-900">{realBrief.fx.eurMad.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">USD/MAD</p>
                        <p className="tabular text-[16px] font-bold text-slate-900">{realBrief.fx.usdMad.toFixed(3)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">News (real)</p>
                        <p className="tabular text-[16px] font-bold text-slate-900">{realBrief.news.totalFound}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Neg share</p>
                        <p className="tabular text-[16px] font-bold text-slate-900">{realBrief.news.negativeShare}%</p>
                      </div>
                    </div>
                    <p className="mt-2 text-[9px] text-slate-400">
                      Source: open.er-api.com (FX) + z-ai web_search + GLM-4 sentiment · fetched {new Date(realBrief.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </motion.div>
                ) : null}

                {/* Sections */}
                {brief.sections.map((section, i) => (
                  <BriefSectionCard key={section.id} section={section} index={i} />
                ))}

                {/* Recommended actions */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="overflow-hidden rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50 to-white shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-100/60 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-800 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-700">
                        Recommended Actions
                      </h3>
                    </div>
                    <Badge className="bg-slate-700 text-[9px] font-bold uppercase tracking-wide text-white hover:bg-slate-700">
                      {brief.recommendedActions.length} items · {brief.role}
                    </Badge>
                  </div>
                  <div className="flex flex-col">
                    {brief.recommendedActions.map((action, i) => (
                      <div
                        key={action.id}
                        className={cn(
                          "group flex items-center gap-3 border-t border-slate-100 border-l-[3px] px-4 py-2.5 transition-colors hover:bg-slate-50",
                          itemToneClass[action.tone],
                        )}
                      >
                        <span className="tabular flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] font-semibold text-slate-800">{action.title}</p>
                          <p className="text-[10px] text-slate-400">{action.detail}</p>
                        </div>
                        {action.metric ? (
                          <span
                            className={cn(
                              "tabular shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ring-1",
                              action.tone === "negative"
                                ? "bg-rose-50 text-rose-700 ring-rose-200"
                                : action.tone === "warning"
                                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                                  : action.tone === "positive"
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : "bg-slate-100 text-slate-600 ring-slate-200",
                            )}
                          >
                            {action.metric}
                          </span>
                        ) : null}
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <div className="flex h-40 items-center justify-center text-[12px] text-slate-400">
                Generating brief…
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <Clock className="h-3 w-3" />
            <span>
              Generated {brief ? new Date(brief.generatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—"}
            </span>
            <span className="mx-1">·</span>
            <span>Seed {brief?.seed ?? "—"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} className="h-7 text-[11px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

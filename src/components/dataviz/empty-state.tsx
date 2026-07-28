"use client";
import { cn } from "@/lib/utils";
export function EmptyState({ title, description, className }: { title: string; description?: string; className?: string }) {
  return <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}><div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 mb-3"><span className="text-slate-300 text-[16px]">○</span></div><p className="text-[12px] font-medium text-slate-500">{title}</p>{description ? <p className="mt-1 text-[10px] text-slate-400 max-w-[260px]">{description}</p> : null}</div>;
}

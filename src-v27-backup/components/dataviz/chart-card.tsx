"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  className?: string;
  /** Anchor id for command-palette jump-to. */
  id?: string;
  /** Right-aligned header slot (legend, toggle, count). */
  action?: React.ReactNode;
  /** Footer slot (summary line, source). */
  footer?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * Standard chrome for every Harch Atelier dataviz widget:
 * white card, slate-200 border, shadow-sm, 11px uppercase slate-500 title.
 */
export function ChartCard({
  title,
  subtitle,
  className,
  id,
  action,
  footer,
  bodyClassName,
  children,
}: ChartCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md hover:border-slate-300 scroll-mt-20",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="min-w-0">
          <h3 className="card-title truncate">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{subtitle}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn("min-w-0 flex-1 p-4", bodyClassName)}>{children}</div>
      {footer ? (
        <footer className="border-t border-slate-100 px-4 py-2.5 text-[11px] text-slate-500">
          {footer}
        </footer>
      ) : null}
    </section>
  );
}

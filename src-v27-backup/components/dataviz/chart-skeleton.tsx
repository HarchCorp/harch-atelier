"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Lightweight skeleton for chart bodies while recharts computes its layout.
 * Shows animated shimmer blocks sized to match a typical chart area.
 */
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full w-full flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-12 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="mt-2 flex flex-1 items-end gap-1.5">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse rounded-t bg-gradient-to-t from-slate-100 to-slate-200"
            style={{ height: `${30 + ((i * 37) % 60)}%` }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="h-2 w-32 animate-pulse rounded bg-slate-100" />
        <div className="h-2 w-16 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}

/**
 * Mount-aware wrapper: renders children after the first paint cycle,
 * showing a skeleton in the meantime. Eliminates the brief empty-Container
 * flash before recharts measures its ResponsiveContainer.
 */
export function DeferredChart({
  children,
  height = "h-[300px]",
}: {
  children: React.ReactNode;
  height?: string;
}) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    // Defer to next frame so the skeleton paints first.
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <div className={cn("w-full", height)}>
      {ready ? children : <ChartSkeleton className="h-full" />}
    </div>
  );
}

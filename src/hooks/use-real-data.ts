"use client";

/**
 * useRealData — client hook for fetching real data from the /api/real/* routes.
 *
 * SWR-like: fetches on mount, polls every `pollMs`, exposes {data, error, loading}.
 * Used by the KpiStrip, Intelligence Brief, and the real-data dashboard widget
 * so the user sees LIVE real data (FX, news+sentiment, market quotes).
 */
import { useEffect, useState, useCallback } from "react";

interface UseRealDataOptions {
  pollMs?: number;
  /** Skip the initial fetch (e.g. until a dialog opens). */
  skip?: boolean;
}

interface UseRealDataResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useRealData<T>(path: string, opts: UseRealDataOptions = {}): UseRealDataResult<T> {
  const { pollMs = 5 * 60 * 1000, skip = false } = opts;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (skip) return;
    let cancelled = false;
    setLoading(true);
    fetch(path)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = (await r.json()) as T;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [path, skip, tick]);

  // Polling
  useEffect(() => {
    if (skip || pollMs <= 0) return;
    const id = setInterval(() => refetch(), pollMs);
    return () => clearInterval(id);
  }, [refetch, pollMs, skip]);

  return { data, error, loading, refetch };
}

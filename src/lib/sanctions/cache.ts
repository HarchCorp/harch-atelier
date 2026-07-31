// ═══════════════════════════════════════════════════════════════
//  SANCTIONS CACHE — 24h TTL, Prisma-backed with filesystem fallback
//
//  The 3 sanctions lists are large (OFAC ~50MB raw JSON, EU ~14MB
//  XML, UN ~2.2MB XML). Re-downloading on every screening request
//  would be both slow and abusive towards the upstream hosts. This
//  module provides a unified cache with the following semantics:
//
//    • Cached entries are stored as JSON in the SanctionsCache Prisma
//      model (one row per list: OFAC / EU / UN).
//    • A cache row is considered FRESH for 24h from `downloadedAt`.
//      After 24h it is STALE — screening still serves stale data
//      (so the user is never blocked on a network blip) but a
//      background refresh is triggered.
//    • If a refresh fails, the previous cache row is preserved and
//      a warning is logged. The route continues serving stale data
//      and surfaces a `stale: true` flag to the caller.
//    • If NO cache row exists at all (first run / cold start), the
//      route triggers a synchronous download. This is slow on the
//      first hit but subsequent hits are O(parse JSON).
//    • A filesystem mirror under `/tmp/sanctions-cache/` provides a
//      last-resort fallback when the DB is unreachable (e.g. during
//      Neon brief connection blips).
//
//  SERVER-SIDE ONLY. Never expose the cached lists to the client.
// ═══════════════════════════════════════════════════════════════

import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import {
  downloadOFAC,
  downloadEU,
  downloadUN,
  type DownloadResult,
  type SanctionsEntry,
  type SanctionsListCode,
} from "./downloader";
import { logInfo, logError } from "@/lib/logger";

// ─── Constants ───────────────────────────────────────────────────

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const FS_CACHE_DIR = path.join(
  process.env.TMPDIR || "/tmp",
  "sanctions-cache",
);

// ─── Types ───────────────────────────────────────────────────────

export interface CacheRow {
  list: SanctionsListCode;
  entries: SanctionsEntry[];
  entryCount: number;
  downloadedAt: Date;
  sourceUrl: string;
  byteSize: number;
  stale: boolean;       // true iff older than CACHE_TTL_MS
  fromFilesystem: boolean; // true iff served from FS fallback (DB was unreachable)
}

export interface CachedLists {
  ofac: CacheRow | null;
  eu: CacheRow | null;
  un: CacheRow | null;
  totalEntries: number;
  staleLists: SanctionsListCode[]; // which lists were served stale
  warnings: string[];
}

export interface RefreshSummary {
  ofac: { entries: number; downloaded: boolean; sourceUrl: string; warnings: string[]; error?: string };
  eu:   { entries: number; downloaded: boolean; sourceUrl: string; warnings: string[]; error?: string };
  un:   { entries: number; downloaded: boolean; sourceUrl: string; warnings: string[]; error?: string };
  totalEntries: number;
  refreshedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────

function isStale(downloadedAt: Date, now = new Date()): boolean {
  return now.getTime() - downloadedAt.getTime() > CACHE_TTL_MS;
}

function fsPathFor(list: SanctionsListCode): string {
  return path.join(FS_CACHE_DIR, `${list}.json`);
}

async function writeFsCache(
  list: SanctionsListCode,
  payload: {
    entries: SanctionsEntry[];
    sourceUrl: string;
    byteSize: number;
    downloadedAt: string;
  },
): Promise<void> {
  try {
    await fs.mkdir(FS_CACHE_DIR, { recursive: true });
    await fs.writeFile(
      fsPathFor(list),
      JSON.stringify(payload),
      "utf8",
    );
  } catch (err) {
    // FS cache is best-effort — never fail the request because of it.
    logError("sanctions-cache", `FS write failed for ${list}: ${(err as Error).message}`);
  }
}

async function readFsCache(list: SanctionsListCode): Promise<CacheRow | null> {
  try {
    const raw = await fs.readFile(fsPathFor(list), "utf8");
    const parsed = JSON.parse(raw) as {
      entries: SanctionsEntry[];
      sourceUrl: string;
      byteSize: number;
      downloadedAt: string;
    };
    const downloadedAt = new Date(parsed.downloadedAt);
    return {
      list,
      entries: parsed.entries,
      entryCount: parsed.entries.length,
      downloadedAt,
      sourceUrl: parsed.sourceUrl,
      byteSize: parsed.byteSize,
      stale: isStale(downloadedAt),
      fromFilesystem: true,
    };
  } catch {
    return null;
  }
}

// ─── Single-list fetch + persist ─────────────────────────────────

async function persistDownload(result: DownloadResult): Promise<CacheRow> {
  const data = JSON.stringify(result.entries);
  // upsert: replace any existing row for this list.
  await prisma.sanctionsCache.upsert({
    where: { list: result.list },
    create: {
      list: result.list,
      data,
      entryCount: result.entries.length,
      downloadedAt: result.downloadedAt,
      sourceUrl: result.sourceUrl,
      byteSize: result.byteSize,
    },
    update: {
      data,
      entryCount: result.entries.length,
      downloadedAt: result.downloadedAt,
      sourceUrl: result.sourceUrl,
      byteSize: result.byteSize,
    },
  });

  // Mirror to filesystem for the DB-unreachable fallback path.
  await writeFsCache(result.list, {
    entries: result.entries,
    sourceUrl: result.sourceUrl,
    byteSize: result.byteSize,
    downloadedAt: result.downloadedAt.toISOString(),
  });

  return {
    list: result.list,
    entries: result.entries,
    entryCount: result.entries.length,
    downloadedAt: result.downloadedAt,
    sourceUrl: result.sourceUrl,
    byteSize: result.byteSize,
    stale: false,
    fromFilesystem: false,
  };
}

// ─── Read a single list from cache (DB → FS → fresh download) ────

async function getCachedList(list: SanctionsListCode): Promise<CacheRow | null> {
  // 1. Try Prisma.
  try {
    const row = await prisma.sanctionsCache.findUnique({ where: { list } });
    if (row) {
      let entries: SanctionsEntry[] = [];
      try {
        entries = JSON.parse(row.data) as SanctionsEntry[];
      } catch {
        // Corrupt cache row — fall through to FS / fresh download.
        entries = [];
      }
      if (entries.length > 0) {
        return {
          list,
          entries,
          entryCount: row.entryCount,
          downloadedAt: row.downloadedAt,
          sourceUrl: row.sourceUrl || "",
          byteSize: row.byteSize || 0,
          stale: isStale(row.downloadedAt),
          fromFilesystem: false,
        };
      }
    }
  } catch (err) {
    logError("sanctions-cache", `Prisma read failed for ${list}: ${(err as Error).message}`);
  }

  // 2. FS fallback.
  const fsRow = await readFsCache(list);
  if (fsRow) return fsRow;

  // 3. Nothing cached at all.
  return null;
}

// ─── Force-refresh a single list ─────────────────────────────────

async function refreshList(list: SanctionsListCode): Promise<{
  row: CacheRow | null;
  downloaded: boolean;
  sourceUrl: string;
  warnings: string[];
  error?: string;
}> {
  try {
    const result =
      list === "OFAC" ? await downloadOFAC() :
      list === "EU"   ? await downloadEU()   :
                        await downloadUN();
    if (result.entries.length === 0) {
      return {
        row: null,
        downloaded: false,
        sourceUrl: result.sourceUrl,
        warnings: result.warnings,
        error: `Download succeeded but produced 0 entries (likely a parser issue)`,
      };
    }
    const row = await persistDownload(result);
    logInfo(
      "sanctions-cache",
      `Refreshed ${list}: ${row.entryCount} entries from ${row.sourceUrl} (${(row.byteSize / 1024 / 1024).toFixed(1)} MB)`,
    );
    return {
      row,
      downloaded: true,
      sourceUrl: row.sourceUrl,
      warnings: result.warnings,
    };
  } catch (err) {
    const msg = (err as Error).message;
    logError("sanctions-cache", `Refresh failed for ${list}: ${msg}`);
    return {
      row: null,
      downloaded: false,
      sourceUrl: "",
      warnings: [],
      error: msg,
    };
  }
}

// ─── Public: refresh all 3 lists (called by cron) ────────────────

export async function refreshAllSanctionsLists(): Promise<RefreshSummary> {
  const [ofac, eu, un] = await Promise.all([
    refreshList("OFAC"),
    refreshList("EU"),
    refreshList("UN"),
  ]);

  const totalEntries =
    (ofac.row?.entryCount ?? 0) +
    (eu.row?.entryCount ?? 0) +
    (un.row?.entryCount ?? 0);

  return {
    ofac: {
      entries: ofac.row?.entryCount ?? 0,
      downloaded: ofac.downloaded,
      sourceUrl: ofac.sourceUrl,
      warnings: ofac.warnings,
      error: ofac.error,
    },
    eu: {
      entries: eu.row?.entryCount ?? 0,
      downloaded: eu.downloaded,
      sourceUrl: eu.sourceUrl,
      warnings: eu.warnings,
      error: eu.error,
    },
    un: {
      entries: un.row?.entryCount ?? 0,
      downloaded: un.downloaded,
      sourceUrl: un.sourceUrl,
      warnings: un.warnings,
      error: un.error,
    },
    totalEntries,
    refreshedAt: new Date().toISOString(),
  };
}

// ─── Public: get all 3 lists for screening ───────────────────────
//
//  Reads cached entries; if a list is missing entirely (cold start),
//  triggers a synchronous download for that list. If a list is
//  stale, returns it anyway (don't block the user on a slow
//  refresh) — the caller can decide whether to trigger a background
//  refresh separately.

export async function getSanctionsLists(): Promise<CachedLists> {
  const warnings: string[] = [];

  // Read all 3 from cache in parallel.
  const [ofacRow, euRow, unRow] = await Promise.all([
    getCachedList("OFAC"),
    getCachedList("EU"),
    getCachedList("UN"),
  ]);

  // Cold-start: if a list is missing entirely, download it now
  // (synchronously — first request will be slow, but the cache is
  // then warm for subsequent requests).
  const ensureDownloaded = async (
    list: SanctionsListCode,
    row: CacheRow | null,
  ): Promise<CacheRow | null> => {
    if (row) return row;
    warnings.push(`Cold start: ${list} not cached, downloading synchronously...`);
    const result = await refreshList(list);
    if (result.row) return result.row;
    warnings.push(
      result.error
        ? `Cold start download failed for ${list}: ${result.error}`
        : `Cold start download produced no entries for ${list}`,
    );
    return null;
  };

  const [ofac, eu, un] = await Promise.all([
    ensureDownloaded("OFAC", ofacRow),
    ensureDownloaded("EU", euRow),
    ensureDownloaded("UN", unRow),
  ]);

  const staleLists: SanctionsListCode[] = [];
  if (ofac?.stale) staleLists.push("OFAC");
  if (eu?.stale) staleLists.push("EU");
  if (un?.stale) staleLists.push("UN");
  if (staleLists.length > 0) {
    warnings.push(
      `Stale lists served: ${staleLists.join(", ")} (older than 24h — cron refresh pending or failed).`,
    );
  }

  const totalEntries =
    (ofac?.entryCount ?? 0) + (eu?.entryCount ?? 0) + (un?.entryCount ?? 0);

  return {
    ofac,
    eu,
    un,
    totalEntries,
    staleLists,
    warnings,
  };
}

// ─── Public: gather entries into a flat array (for matcher) ──────

export function flattenLists(cached: CachedLists): SanctionsEntry[] {
  const out: SanctionsEntry[] = [];
  if (cached.ofac) out.push(...cached.ofac.entries);
  if (cached.eu) out.push(...cached.eu.entries);
  if (cached.un) out.push(...cached.un.entries);
  return out;
}

// ─── Public: cache metadata (for /api/investor/screen status) ────

export interface CacheStatus {
  ofac: { entryCount: number; downloadedAt: string | null; stale: boolean; sourceUrl: string | null } | null;
  eu:   { entryCount: number; downloadedAt: string | null; stale: boolean; sourceUrl: string | null } | null;
  un:   { entryCount: number; downloadedAt: string | null; stale: boolean; sourceUrl: string | null } | null;
  totalEntries: number;
}

export function getCacheStatus(cached: CachedLists): CacheStatus {
  const shape = (row: CacheRow | null) =>
    row
      ? {
          entryCount: row.entryCount,
          downloadedAt: row.downloadedAt.toISOString(),
          stale: row.stale,
          sourceUrl: row.sourceUrl || null,
        }
      : null;
  return {
    ofac: shape(cached.ofac),
    eu: shape(cached.eu),
    un: shape(cached.un),
    totalEntries: cached.totalEntries,
  };
}

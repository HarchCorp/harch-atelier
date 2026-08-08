// ═══════════════════════════════════════════════════════════════
//  GET /api/investor/entity-graph
//
//  Section 4 — Entity & Risk Graph.
//
//  Connects REAL OFAC screening to a React Flow entity graph that
//  the Investor Desk renders in place of the previous "derived"
//  UBO topology.
//
//  Pipeline (all server-side):
//    1. Load the user's portfolio holdings (Portfolio → PortfolioHolding
//       → Company).
//    2. Load cached OFAC/EU/UN entries (SanctionsCache via the
//       existing cache module — 27K+ entries).
//    3. For each holding company, run screenName() to find matches
//       above the 0.7 threshold (lower than the default 0.86 so
//       "watch" tier fuzzy matches surface as amber in the graph).
//    4. Build React Flow nodes:
//         - portfolio (book) node(s)
//         - holding company nodes (colored by OFAC status)
//    5. Build React Flow edges:
//         - portfolio → company (ownership, weight %)
//         - company → company (same-sector cross-holding)
//    6. Compute cross-entity RISK PROPAGATION: any holding that
//       is directly linked (ownership or sector) to a flagged
//       entity gets `propagatedRisk: true` and an amber border in
//       the UI (compliance officers see contagion risk).
//
//  Node colour legend:
//    green  — clean (no matches above 0.7)
//    amber  — watch  (top similarity 0.7..0.86)
//    red    — flagged (top similarity ≥ 0.86)
//
//  Response shape (React Flow):
//    {
//      nodes: Node<EntityGraphNodeData>[],
//      edges: Edge[],
//      meta: { totalScreened, flaggedCount, watchCount, cleanCount,
//              propagatedCount, totalEntriesScreened, screenedAt,
//              cacheStatus, stale, warnings }
//    }
//
//  Auth: requires session + accountType === "investment-bank" (or admin).
//  The full sanctions list NEVER leaves the server — only the
//  matched entries above 0.7 are returned to the client.
//
//  Task ID: signal-entity-graph
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db";
import { getSanctionsLists, flattenLists, getCacheStatus, type CacheStatus } from "@/lib/sanctions/cache";
import {
  screenName,
  matchTier,
  type SanctionsMatch,
  type ScreeningResult,
} from "@/lib/sanctions/matcher";
import { demoFilterFromSession } from "@/lib/harchiq/company-session";
import { logInfo, logWarn, logError } from "@/lib/logger";
import { logAudit, extractIp, extractUserAgent } from "@/lib/harchiq/audit-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// Cold-start may download OFAC + EU + UN (~66MB total). Subsequent
// hits are O(parse JSON) and finish in <1s.
export const maxDuration = 120;

// ─── Public types (mirrored by the client) ───────────────────────

export type OfacStatus = "clean" | "watch" | "flagged";

export interface EntityGraphNodeData {
  label: string;
  /** Node kind — drives which React Flow renderer to use. */
  kind: "portfolio" | "company";
  /** Holding weight (0-1) on the portfolio → company edge. */
  weight?: number;
  /** Company sector (for same-sector edge derivation). */
  sector?: string;
  /** Latest reputation score 0-100 (or null if no ReputationScore yet). */
  reputationScore?: number | null;
  /** Risk score 0-100 (inverted reputation; null when unknown). */
  riskScore?: number | null;
  /** OFAC screening result for this holding. */
  ofacStatus: OfacStatus;
  /** Top similarity score 0-1 across all matches (0 when clean). */
  topSimilarity: number;
  /** Number of sanctions matches above 0.7 (across all 3 lists). */
  matchCount: number;
  /** Top 5 matches (already trimmed server-side — full list never
   *  leaves the server beyond this cap). */
  matches: SanctionsMatch[];
  /** True iff this entity is linked to a flagged entity (risk
   *  propagation — amber border in the UI). */
  propagatedRisk: boolean;
  /** Holding ID (so the client can link back to the holdings table). */
  holdingId?: string;
  /** Company slug (so the client can deep-link to the company page). */
  companySlug?: string;
  /** Linked article count (articles mentioning this company). */
  articleCount?: number;
  /** ISO timestamp of the screening. */
  screenedAt: string;
}

export interface EntityGraphMeta {
  totalScreened: number;
  flaggedCount: number;
  watchCount: number;
  cleanCount: number;
  propagatedCount: number;
  totalEntriesScreened: number;
  screenedAt: string;
  cacheStatus: CacheStatus | null;
  stale: boolean;
  warnings: string[];
}

export interface EntityGraphResponse {
  nodes: Array<{
    id: string;
    type: "portfolio" | "company";
    position: { x: number; y: number };
    data: EntityGraphNodeData;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
    labelStyle?: Record<string, unknown>;
    labelBgStyle?: Record<string, unknown>;
    labelBgPadding?: [number, number];
    labelBgBorderRadius?: number;
    style?: Record<string, unknown>;
    animated?: boolean;
  }>;
  meta: EntityGraphMeta;
}

// ─── Auth guard ──────────────────────────────────────────────────

async function authorize() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { ok: false as const, status: 401, error: "Unauthorized — session invalid" };
  }
  if (
    session.user?.accountType !== "investment-bank" &&
    session.user?.role !== "admin"
  ) {
    return {
      ok: false as const,
      status: 403,
      error: "Forbidden — investment-bank account required",
    };
  }
  return {
    ok: true as const,
    userId: session.user.id,
    isDemo: session.user?.isDemo === true,
  };
}

// ─── Holding loader ──────────────────────────────────────────────

interface HoldingForGraph {
  holdingId: string;
  portfolioId: string;
  portfolioName: string;
  weight: number;
  companyId: string | null;
  companySlug: string | null;
  companyName: string;
  sector: string;
  reputationScore: number | null;
  articleCount: number;
}

async function loadHoldings(
  userId: string,
  isDemo: boolean,
): Promise<HoldingForGraph[]> {
  // Demo users see all demo portfolios (shared seeded data); real
  // users see only their own portfolios. Same isolation pattern as
  // /api/investor/portfolios.
  const portfolioWhere = isDemo
    ? { isDemo: true }
    : { userId, isDemo: false };

  const portfolios = await prisma.portfolio.findMany({
    where: portfolioWhere,
    orderBy: { createdAt: "asc" },
    include: {
      holdings: {
        include: {
          company: {
            select: {
              id: true,
              slug: true,
              name: true,
              sector: true,
              reputationScores: {
                where: { isDemo },
                orderBy: { calculatedAt: "desc" },
                take: 1,
                select: { overall: true },
              },
              articles: {
                where: { isDemo },
                select: { id: true },
              },
            },
          },
          asset: { select: { name: true, ticker: true } },
        },
      },
    },
  });

  const out: HoldingForGraph[] = [];
  for (const p of portfolios) {
    for (const h of p.holdings) {
      const companyName = h.company?.name || h.asset?.name || "";
      if (!companyName) continue;
      out.push({
        holdingId: h.id,
        portfolioId: p.id,
        portfolioName: p.name,
        weight: h.weight,
        companyId: h.company?.id ?? null,
        companySlug: h.company?.slug ?? null,
        companyName,
        sector: h.company?.sector || "—",
        reputationScore: h.company?.reputationScores[0]?.overall ?? null,
        articleCount: h.company?.articles?.length ?? 0,
      });
    }
  }
  return out;
}

// ─── OFAC status classification ──────────────────────────────────
//
//  Threshold table (lower than the default 0.86 used by the
//  Compliance Registry so we surface fuzzy "watch" matches in the
//  graph):
//
//    similarity ≥ 0.86  →  flagged (red)
//    0.70 ≤ sim < 0.86  →  watch   (amber)
//    sim < 0.70         →  clean   (green)
//
//  We use 0.7 as the floor — anything below that is not even
//  returned by screenName (we pass it as the threshold).

function classifyOfacStatus(result: ScreeningResult): {
  status: OfacStatus;
  topSimilarity: number;
  matchCount: number;
} {
  const matches = result.matches;
  if (matches.length === 0) {
    return { status: "clean", topSimilarity: 0, matchCount: 0 };
  }
  const top = matches[0].similarity;
  const tier = matchTier(top);
  // matchTier returns "critical" (≥0.92), "strong" (≥0.88), or
  // "review" (≥threshold). Both critical and strong map to "flagged"
  // in the graph; review stays at "watch".
  const status: OfacStatus = tier === "review" ? "watch" : "flagged";
  return { status, topSimilarity: top, matchCount: matches.length };
}

// ─── Risk propagation ────────────────────────────────────────────
//
//  An entity B is "propagated" iff:
//    - B is NOT itself flagged, AND
//    - B is linked (same sector or shared portfolio) to a flagged
//      entity A.
//
//  Watch entities are NOT propagated (they already carry their own
//  amber marker). Propagation only escalates clean → amber-bordered.

function computePropagation(
  holdings: HoldingForGraph[],
  statusByHoldingId: Map<string, OfacStatus>,
): Set<string> {
  const propagated = new Set<string>();
  const flaggedSectors = new Set<string>();
  const flaggedPortfolioIds = new Set<string>();

  // 1st pass: collect sectors + portfolio IDs with at least one
  // flagged holding.
  for (const h of holdings) {
    if (statusByHoldingId.get(h.holdingId) === "flagged") {
      if (h.sector && h.sector !== "—") flaggedSectors.add(h.sector);
      flaggedPortfolioIds.add(h.portfolioId);
    }
  }

  // 2nd pass: mark clean holdings in those sectors / portfolios.
  for (const h of holdings) {
    if (statusByHoldingId.get(h.holdingId) !== "clean") continue;
    if (flaggedSectors.has(h.sector) || flaggedPortfolioIds.has(h.portfolioId)) {
      propagated.add(h.holdingId);
    }
  }
  return propagated;
}

// ─── Graph builder ───────────────────────────────────────────────

function buildGraph(
  holdings: HoldingForGraph[],
  screeningByHoldingId: Map<string, ScreeningResult>,
  screenedAt: string,
): { nodes: EntityGraphResponse["nodes"]; edges: EntityGraphResponse["edges"] } {
  const nodes: EntityGraphResponse["nodes"] = [];
  const edges: EntityGraphResponse["edges"] = [];

  // ── Portfolio (book) nodes — one per portfolio, top row ──
  const portfolioIds = Array.from(new Set(holdings.map((h) => h.portfolioId)));
  const bookSpacing = 240;
  const bookStartX = -((portfolioIds.length - 1) * bookSpacing) / 2;
  const portfolioNameById = new Map<string, string>();
  for (const h of holdings) portfolioNameById.set(h.portfolioId, h.portfolioName);

  portfolioIds.forEach((pid, i) => {
    nodes.push({
      id: `book-${pid}`,
      type: "portfolio",
      position: { x: bookStartX + i * bookSpacing, y: 0 },
      data: {
        label: portfolioNameById.get(pid) ?? `Portfolio ${i + 1}`,
        kind: "portfolio",
        weight: 0,
        ofacStatus: "clean",
        topSimilarity: 0,
        matchCount: 0,
        matches: [],
        propagatedRisk: false,
        screenedAt,
      },
    });
  });

  // ── Holding → OFAC status map + propagation set ──
  const statusByHoldingId = new Map<string, OfacStatus>();
  for (const h of holdings) {
    const result = screeningByHoldingId.get(h.holdingId);
    if (!result) {
      statusByHoldingId.set(h.holdingId, "clean");
      continue;
    }
    statusByHoldingId.set(h.holdingId, classifyOfacStatus(result).status);
  }
  const propagated = computePropagation(holdings, statusByHoldingId);

  // ── Company nodes — one per holding, bottom row ──
  const companySpacing = 200;
  const total = holdings.length;
  const startX = -((total - 1) * companySpacing) / 2;
  holdings.forEach((h, i) => {
    const result = screeningByHoldingId.get(h.holdingId);
    const cls = result ? classifyOfacStatus(result) : { status: "clean" as OfacStatus, topSimilarity: 0, matchCount: 0 };
    const riskScore =
      h.reputationScore !== null
        ? Math.max(0, Math.min(100, Math.round(100 - h.reputationScore)))
        : null;
    nodes.push({
      id: `h-${h.holdingId}`,
      type: "company",
      position: { x: startX + i * companySpacing, y: 260 },
      data: {
        label: h.companyName,
        kind: "company",
        weight: h.weight,
        sector: h.sector,
        reputationScore: h.reputationScore,
        riskScore,
        ofacStatus: cls.status,
        topSimilarity: cls.topSimilarity,
        matchCount: cls.matchCount,
        matches: result?.matches.slice(0, 5) ?? [],
        propagatedRisk: propagated.has(h.holdingId) && cls.status === "clean",
        holdingId: h.holdingId,
        companySlug: h.companySlug ?? undefined,
        articleCount: h.articleCount,
        screenedAt,
      },
    });

    // Edge: portfolio → company (ownership with weight %).
    const isFlagged = cls.status === "flagged";
    const isWatch = cls.status === "watch";
    edges.push({
      id: `e-${h.holdingId}`,
      source: `book-${h.portfolioId}`,
      target: `h-${h.holdingId}`,
      label: `${Math.round(h.weight * 100)}%`,
      labelStyle: { fontSize: 9, fontFamily: "'Space Mono', monospace", fill: "#737373" },
      labelBgStyle: { fill: "#ffffff", fillOpacity: 0.85 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 2,
      style: {
        stroke: isFlagged ? "#dc2626" : isWatch ? "#d97706" : "#1e3a5f",
        strokeWidth: 1.2,
        strokeOpacity: 0.55,
      },
      animated: isFlagged,
    });
  });

  // ── Cross-holding edges — same-sector companies ──
  for (let i = 0; i < holdings.length; i++) {
    for (let j = i + 1; j < holdings.length; j++) {
      const a = holdings[i];
      const b = holdings[j];
      if (a.sector === "—" || b.sector === "—") continue;
      if (a.sector !== b.sector) continue;
      const edgeId = `e-x-${a.holdingId}-${b.holdingId}`;
      const eitherFlagged =
        statusByHoldingId.get(a.holdingId) === "flagged" ||
        statusByHoldingId.get(b.holdingId) === "flagged";
      edges.push({
        id: edgeId,
        source: `h-${a.holdingId}`,
        target: `h-${b.holdingId}`,
        label: "sector",
        labelStyle: { fontSize: 8, fontFamily: "'Space Mono', monospace", fill: "#94a3b8" },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.85 },
        labelBgPadding: [3, 2],
        labelBgBorderRadius: 2,
        style: {
          stroke: eitherFlagged ? "#dc2626" : "#94a3b8",
          strokeWidth: 1,
          strokeOpacity: 0.4,
          strokeDasharray: "4 4",
        },
        animated: eitherFlagged,
      });
    }
  }

  return { nodes, edges };
}

// ─── GET handler ─────────────────────────────────────────────────

export async function GET(req: Request) {
  const auth = await authorize();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // 1. Load the user's holdings.
    const holdings = await loadHoldings(auth.userId, auth.isDemo);
    if (holdings.length === 0) {
      return NextResponse.json<EntityGraphResponse>({
        nodes: [],
        edges: [],
        meta: {
          totalScreened: 0,
          flaggedCount: 0,
          watchCount: 0,
          cleanCount: 0,
          propagatedCount: 0,
          totalEntriesScreened: 0,
          screenedAt: new Date().toISOString(),
          cacheStatus: null,
          stale: false,
          warnings: ["No portfolio holdings yet — add holdings to populate the entity graph."],
        },
      });
    }

    // 2. Load the cached sanctions lists (cold-start downloads if missing).
    const cachedLists = await getSanctionsLists();
    const allEntries = flattenLists(cachedLists);
    if (allEntries.length === 0) {
      return NextResponse.json(
        {
          error: "Sanctions lists unavailable — all 3 caches empty. Run /api/cron/refresh-sanctions to populate.",
          warnings: cachedLists.warnings,
        },
        { status: 503 },
      );
    }

    // 3. Screen each holding against the cached lists.
    //    We use threshold=0.7 (lower than the default 0.86) so
    //    "watch" tier fuzzy matches surface as amber in the graph.
    const screenedAt = new Date().toISOString();
    const screeningByHoldingId = new Map<string, ScreeningResult>();
    for (const h of holdings) {
      const result = screenName(h.companyName, allEntries, {
        threshold: 0.7,
        typeFilter: "entity",
      });
      screeningByHoldingId.set(h.holdingId, result);
    }

    // 4. Build the React Flow graph.
    const { nodes, edges } = buildGraph(holdings, screeningByHoldingId, screenedAt);

    // 5. Aggregate meta.
    let flaggedCount = 0;
    let watchCount = 0;
    let cleanCount = 0;
    let propagatedCount = 0;
    for (const n of nodes) {
      if (n.type !== "company") continue;
      if (n.data.ofacStatus === "flagged") flaggedCount++;
      else if (n.data.ofacStatus === "watch") watchCount++;
      else cleanCount++;
      if (n.data.propagatedRisk) propagatedCount++;
    }

    const cacheStatus = getCacheStatus(cachedLists);
    const stale = cachedLists.staleLists.length > 0;
    const warnings = cachedLists.warnings;

    logInfo(
      "entity-graph",
      `Built entity graph for user ${auth.userId}: ${nodes.length} nodes, ${edges.length} edges, ${flaggedCount} flagged, ${watchCount} watch, ${propagatedCount} propagated`,
    );
    if (flaggedCount > 0) {
      logWarn(
        "entity-graph",
        `Entity graph flagged ${flaggedCount} holding(s) — OFAC/EU/UN match above 0.86 threshold`,
      );
    }

    // 6. Audit log (Loi 09-08).
    await logAudit({
      userId: auth.userId,
      action: "entity_graph_view",
      resource: "entity-graph",
      result: "success",
      ipAddress: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata: {
        holdingsScreened: holdings.length,
        flaggedCount,
        watchCount,
        propagatedCount,
        totalEntriesScreened: allEntries.length,
        threshold: 0.7,
      },
    });

    return NextResponse.json<EntityGraphResponse>({
      nodes,
      edges,
      meta: {
        totalScreened: holdings.length,
        flaggedCount,
        watchCount,
        cleanCount,
        propagatedCount,
        totalEntriesScreened: allEntries.length,
        screenedAt,
        cacheStatus,
        stale,
        warnings,
      },
    });
  } catch (err) {
    logError("investor.entity-graph", `Entity graph API error: ${err}`);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}

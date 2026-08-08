import { logInfo } from "@/lib/logger";
// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.1 — HarchIQ FINANCIAL INTELLIGENCE MODULE
//  Crypto address clustering, shell-company detection via graph
//  centrality, and blockchain fund-flow tracing.
//
//  Inspired by Chainalysis's address-clustering heuristics, Sayari's
//  corporate-network graph analytics, and the FATF's guidance on
//  virtual-asset investigations.
//
//  ┌────────────────────────────────────────────────────────────┐
//  │  Core algorithms                                            │
//  ├────────────────────────────────────────────────────────────┤
//  │  • Multi-input address clustering (union-find)              │
//  │  • Shell-company detection (degree + betweenness centrality)│
//  │  • Fund-flow BFS tracing with depth limiting                │
//  │  • Brandes algorithm for betweenness centrality             │
//  └────────────────────────────────────────────────────────────┘
//
//  Task ID: AEGIS-V31-ALGO
//  Module:  harchiq/trace/financial-intelligence
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * TxOutput — a single output of a crypto transaction: an address +
 * an amount. Units are deliberately abstract (token-agnostic); the
 * caller decides whether amounts are in satoshis, wei, or fiat-equiv.
 */
export interface TxOutput {
  address: string;
  amount: number;
}

/**
 * CryptoTransaction — a single on-chain transaction.
 *
 * The multi-input clustering heuristic rests on `inputs`: if tx T
 * spends outputs from addresses A, B, and C as inputs, then A, B,
 * and C are (with very high probability) controlled by the same
 * wallet / private key — because only the key-holder can sign the
 * spending transaction. (Caveat: this heuristic breaks for CoinJoin
 * and similar mixers; detectShellCompanies's centrality analysis is
 * a partial mitigation.)
 */
export interface CryptoTransaction {
  /** Transaction hash (canonical hex / base58). */
  txHash: string;
  /** Input addresses (the spenders). */
  inputs: string[];
  /** Output address+amount pairs (the recipients). */
  outputs: TxOutput[];
  /** ISO-8601 block timestamp. */
  timestamp: string;
  /** Total value moved (sum of outputs). */
  totalValue: number;
}

/**
 * AddressCluster — a group of addresses believed to be controlled
 * by the same entity.
 */
export interface AddressCluster {
  /** Generated cluster ID. */
  clusterId: string;
  /** All addresses in the cluster. */
  addresses: string[];
  /** Total value flowing through the cluster (sum of tx totalValue). */
  totalValue: number;
  /** Number of distinct transactions involving the cluster. */
  transactionCount: number;
}

/**
 * ClusterResult — output of `clusterAddresses`.
 */
export interface ClusterResult {
  /** Discovered clusters. */
  clusters: AddressCluster[];
  /** Reverse lookup: address → clusterId. */
  addressToCluster: Map<string, string>;
  /** Aggregate total value across all clusters. */
  totalValue: number;
}

/**
 * CompanyNode — a single company in a corporate-relationship graph.
 */
export interface CompanyNode {
  /** Stable company ID. */
  id: string;
  /** Legal name. */
  name: string;
  /** Registration / tax ID, if known. */
  registrationNumber?: string;
  /** Director entity IDs (people or companies). */
  directors: string[];
  /** Shareholder entity IDs (people or companies). */
  shareholders: string[];
  /** Subsidiary company IDs. */
  subsidiaries: string[];
  /** Country of incorporation. */
  country: string;
}

/**
 * ShellCompanyDetection — per-company centrality + classification.
 */
export interface ShellCompanyDetection {
  /** Company ID. */
  companyId: string;
  /** Company name (for display). */
  companyName: string;
  /** Degree centrality in [0,1]. */
  degreeCentrality: number;
  /** Betweenness centrality (normalized). */
  betweennessCentrality: number;
  /** Classification label. */
  classification:
    | "shell_company" // pass-through: high degree + high betweenness
    | "holding_company" // high degree + low betweenness (normal)
    | "operating_company" // low degree + low betweenness (normal)
    | "bridge_company"; // low degree + high betweenness (conduit)
  /** Confidence in [0,1]. */
  confidence: number;
}

/**
 * FundFlowHop — a single hop in a fund-flow trace.
 */
export interface FundFlowHop {
  /** Hop depth (0 = source, 1 = first hop, …). */
  depth: number;
  /** Address at this hop. */
  address: string;
  /** Transaction hash that brought funds here. */
  viaTxHash?: string;
  /** Amount received at this hop. */
  amountReceived: number;
  /** ISO-8601 timestamp of the receiving transaction. */
  timestamp?: string;
}

/**
 * FinalDestination — an address that receives funds but never sends.
 */
export interface FinalDestination {
  /** Destination address. */
  address: string;
  /** Total amount received. */
  amountReceived: number;
  /** Hop depth at which it was discovered. */
  depth: number;
}

/**
 * FundFlowTrace — output of `traceFundFlow`.
 */
export interface FundFlowTrace {
  /** Source address. */
  fromAddress: string;
  /** Ordered list of hops in the trace. */
  path: FundFlowHop[];
  /** Total number of BFS hops explored. */
  totalHops: number;
  /** Addresses that receive but don't send (likely final cash-out). */
  finalDestinations: FinalDestination[];
  /** Total amount traced, in the same units as the input transactions. */
  totalAmountTraced: number;
}

/**
 * GraphEdge — a weighted edge in a generic graph.
 */
export interface GraphEdge {
  /** Source node ID. */
  source: string;
  /** Target node ID. */
  target: string;
  /** Edge weight (default 1). */
  weight?: number;
}

/**
 * Graph — generic adjacency-list graph for centrality computations.
 */
export interface Graph {
  /** Node IDs. */
  nodes: string[];
  /** Edges (assumed directed; for undirected, add both directions). */
  edges: GraphEdge[];
}

// ─── MULTI-INPUT ADDRESS CLUSTERING ───────────────────────────────

/**
 * clusterAddresses — multi-input address clustering heuristic.
 *
 * Heuristic (Androulaki et al., Meiklejohn et al., 2013):
 *
 *   "If two or more addresses are inputs to the same transaction,
 *    they are controlled by the same entity."
 *
 * Rationale: spending UTXOs from multiple addresses in one tx requires
 * signatures from each address's private key. Only the entity holding
 * all those keys can construct such a tx — therefore they share a
 * controller.
 *
 * Implementation: union-find (disjoint-set) over all input addresses
 * observed in the transaction set. For each transaction, union all
 * of its input addresses into a single set.
 *
 * Caveats:
 *   • CoinJoin / Wasabi / Samourai Whirlpool break this heuristic.
 *   • Exchange hot wallets aggregate deposits from many users, so
 *     exchange clusters will be very large — this is expected.
 *
 * @param transactions array of CryptoTransaction
 * @returns            ClusterResult with clusters + address→cluster map
 */
export function clusterAddresses(transactions: CryptoTransaction[]): ClusterResult {
  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Multi-input clustering: ${transactions.length} transactions`);

  // ── Union-find (disjoint-set) with path compression + union by rank ──
  const parent = new Map<string, string>();
  const rank = new Map<string, number>();

  const ensure = (a: string) => {
    if (!parent.has(a)) {
      parent.set(a, a);
      rank.set(a, 0);
    }
  };
  const find = (a: string): string => {
    ensure(a);
    let root = a;
    while (parent.get(root) !== root) root = parent.get(root)!;
    // Path compression.
    let cur = a;
    while (parent.get(cur) !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    ensure(a);
    ensure(b);
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    // Union by rank.
    const rankA = rank.get(ra)!;
    const rankB = rank.get(rb)!;
    if (rankA < rankB) {
      parent.set(ra, rb);
    } else if (rankA > rankB) {
      parent.set(rb, ra);
    } else {
      parent.set(rb, ra);
      rank.set(ra, rankA + 1);
    }
  };

  // ── Union all inputs of each transaction ──────────────────
  // Also ensure outputs are in the parent map (they may appear as inputs
  // in later transactions).
  for (const tx of transactions) {
    for (const addr of tx.inputs) ensure(addr);
    for (const out of tx.outputs) ensure(out.address);
    if (tx.inputs.length >= 2) {
      const first = tx.inputs[0];
      for (let i = 1; i < tx.inputs.length; i++) {
        union(first, tx.inputs[i]);
      }
    }
  }

  // ── Group addresses by cluster root ──────────────────────
  const clusterMap = new Map<string, string[]>();
  for (const addr of parent.keys()) {
    const root = find(addr);
    if (!clusterMap.has(root)) clusterMap.set(root, []);
    clusterMap.get(root)!.push(addr);
  }

  // ── Compute per-cluster stats ────────────────────────────
  const addressToCluster = new Map<string, string>();
  const clusters: AddressCluster[] = [];
  let totalValueAll = 0;

  for (const [root, addrs] of clusterMap) {
    const clusterId = `cluster_${root}`;
    const addrSet = new Set(addrs);

    let clusterValue = 0;
    let clusterTxCount = 0;
    for (const tx of transactions) {
      // If any input or output of the tx touches this cluster, count it.
      const touches =
        tx.inputs.some((a) => addrSet.has(a)) ||
        tx.outputs.some((o) => addrSet.has(o.address));
      if (touches) {
        clusterValue += tx.totalValue;
        clusterTxCount++;
      }
    }

    for (const a of addrs) addressToCluster.set(a, clusterId);

    clusters.push({
      clusterId,
      addresses: addrs,
      totalValue: clusterValue,
      transactionCount: clusterTxCount,
    });
    totalValueAll += clusterValue;
  }

  // Sort clusters by size descending (largest first — typically the
  // exchange / major wallet).
  clusters.sort((a, b) => b.addresses.length - a.addresses.length);

  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Clustering complete: ${clusters.length} clusters ` +
      `from ${parent.size} addresses, total value=${totalValueAll}`);

  return { clusters, addressToCluster, totalValue: totalValueAll };
}

// ─── SHELL COMPANY DETECTION ───────────────────────────────────────

/**
 * detectShellCompanies — shell-company detection via graph centrality.
 *
 * Methodology (adapted from Sayari / FATF red-flag guidance):
 *
 *   1. Build a corporate-relationship graph from the company list:
 *        • Subsidiaries  → parent_of edge (parent → subsidiary)
 *        • Shareholders  → owned_by edge (company → shareholder)
 *        • Directors     → directed_by edge (company → director)
 *   2. Compute degree centrality for each company node (number of
 *      connections / max possible).
 *   3. Compute betweenness centrality (Brandes algorithm) for each
 *      company node — how often the node lies on the shortest path
 *      between other pairs.
 *   4. Classify:
 *        • high degree + high betweenness = shell_company
 *          (pass-through entity funneling many relationships)
 *        • high degree + low betweenness  = holding_company
 *          (normal parent structure)
 *        • low degree + low betweenness   = operating_company
 *          (normal leaf)
 *        • low degree + high betweenness  = bridge_company
 *          (conduit / special-purpose vehicle)
 *
 * @param companies array of CompanyNode
 * @returns         ShellCompanyDetection[] (one per company)
 */
export function detectShellCompanies(
  companies: CompanyNode[],
): ShellCompanyDetection[] {
  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Shell-company detection: ${companies.length} companies`);

  // ── Build the graph ──────────────────────────────────────
  const nodeIds = new Set<string>();
  for (const c of companies) {
    nodeIds.add(c.id);
    for (const s of c.subsidiaries) nodeIds.add(s);
    for (const sh of c.shareholders) nodeIds.add(sh);
    for (const d of c.directors) nodeIds.add(d);
  }
  const nodes = Array.from(nodeIds);

  const edges: GraphEdge[] = [];
  for (const c of companies) {
    // parent_of edges (company → subsidiary)
    for (const sub of c.subsidiaries) {
      edges.push({ source: c.id, target: sub, weight: 1 });
      // For undirected centrality, add reverse edge.
      edges.push({ source: sub, target: c.id, weight: 1 });
    }
    // owned_by edges (company ↔ shareholder)
    for (const sh of c.shareholders) {
      edges.push({ source: c.id, target: sh, weight: 1 });
      edges.push({ source: sh, target: c.id, weight: 1 });
    }
    // directed_by edges (company ↔ director)
    for (const d of c.directors) {
      edges.push({ source: c.id, target: d, weight: 1 });
      edges.push({ source: d, target: c.id, weight: 1 });
    }
  }

  const graph: Graph = { nodes, edges };

  // ── Centrality computations ──────────────────────────────
  const betweennessMap = calculateBetweennessCentrality(graph);
  const companyIds = companies.map((c) => c.id);
  const maxDegree = Math.max(1, ...companyIds.map((id) => degreeOf(graph, id)));

  // Betweenness normalization factor: for an undirected graph, the
  // maximum possible betweenness is ((N-1)(N-2))/2. We normalize by
  // this to put betweenness in [0, 1].
  const n = nodes.length;
  const maxBetweenness = n > 2 ? (n - 1) * (n - 2) / 2 : 1;

  // ── Thresholds (median-split heuristic) ──────────────────
  // Compute medians for adaptive thresholds.
  const degrees = companyIds.map((id) => degreeOf(graph, id));
  const betweens = companyIds.map((id) => betweennessMap.get(id) ?? 0);
  const degreeMedian = median(degrees);
  const betweenMedian = median(betweens);

  const results: ShellCompanyDetection[] = [];
  for (const c of companies) {
    const deg = degreeOf(graph, c.id);
    const bet = betweennessMap.get(c.id) ?? 0;
    const degNorm = deg / maxDegree;
    const betNorm = bet / maxBetweenness;

    const highDegree = deg > degreeMedian;
    const highBetween = bet > betweenMedian;

    let classification: ShellCompanyDetection["classification"];
    let confidence: number;

    if (highDegree && highBetween) {
      classification = "shell_company";
      // Confidence scales with how far above median both metrics are.
      const degConf = Math.min(1, deg / Math.max(1, degreeMedian * 2));
      const betConf = Math.min(1, bet / Math.max(1, betweenMedian * 2));
      confidence = Number(((degConf + betConf) / 2).toFixed(3));
    } else if (highDegree && !highBetween) {
      classification = "holding_company";
      confidence = Number(Math.min(1, deg / Math.max(1, degreeMedian * 2)).toFixed(3));
    } else if (!highDegree && highBetween) {
      classification = "bridge_company";
      confidence = Number(Math.min(1, bet / Math.max(1, betweenMedian * 2)).toFixed(3));
    } else {
      classification = "operating_company";
      confidence = 0.7;
    }

    results.push({
      companyId: c.id,
      companyName: c.name,
      degreeCentrality: Number(degNorm.toFixed(4)),
      betweennessCentrality: Number(betNorm.toFixed(4)),
      classification,
      confidence,
    });
  }

  // Sort by risk: shell companies first, then bridges.
  const classRank: Record<ShellCompanyDetection["classification"], number> = {
    shell_company: 0,
    bridge_company: 1,
    holding_company: 2,
    operating_company: 3,
  };
  results.sort((a, b) => {
    const r = classRank[a.classification] - classRank[b.classification];
    if (r !== 0) return r;
    return b.confidence - a.confidence;
  });

  const shellCount = results.filter((r) => r.classification === "shell_company").length;
  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Shell-company detection: ${shellCount} shell, ` +
      `${results.filter((r) => r.classification === "bridge_company").length} bridge, ` +
      `${results.filter((r) => r.classification === "holding_company").length} holding, ` +
      `${results.filter((r) => r.classification === "operating_company").length} operating`);

  return results;
}

// ─── FUND FLOW TRACING ────────────────────────────────────────────

/**
 * traceFundFlow — BFS trace of fund flow through the blockchain.
 *
 * Starting from `fromAddress`, follow outgoing transactions (where
 * the address appears as an input) to their output addresses, then
 * recursively follow those addresses' outgoing transactions, up to
 * `maxDepth` hops.
 *
 * For each hop we record:
 *   • the address reached
 *   • the tx hash that brought funds there
 *   • the amount received at that hop
 *   • the timestamp
 *
 * Final destinations = addresses that receive funds but never appear
 * as an input to any subsequent transaction (cash-out endpoints).
 *
 * @param fromAddress  the starting address
 * @param transactions the full transaction set to trace through
 * @param maxDepth     maximum BFS depth (default 5)
 * @returns            FundFlowTrace
 */
export function traceFundFlow(
  fromAddress: string,
  transactions: CryptoTransaction[],
  maxDepth: number = 5,
): FundFlowTrace {
  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Fund-flow trace from ${fromAddress}, maxDepth=${maxDepth}`);

  // ── Index: input address → outgoing transactions ─────────
  const outgoingByAddress = new Map<string, CryptoTransaction[]>();
  // Also index: address → set of all addresses that ever appear as inputs
  // (for final-destination detection).
  const senderAddresses = new Set<string>();
  for (const tx of transactions) {
    for (const inp of tx.inputs) {
      senderAddresses.add(inp);
      if (!outgoingByAddress.has(inp)) {
        outgoingByAddress.set(inp, []);
      }
      outgoingByAddress.get(inp)!.push(tx);
    }
  }

  // ── BFS ──────────────────────────────────────────────────
  const path: FundFlowHop[] = [];
  const finalDestinations: FinalDestination[] = [];
  const visited = new Set<string>();
  let totalAmountTraced = 0;
  let totalHops = 0;

  // Seed: the source address at depth 0.
  type QueueItem = { address: string; depth: number; amount: number; viaTx?: string; ts?: string };
  const queue: QueueItem[] = [
    { address: fromAddress, depth: 0, amount: 0 },
  ];
  visited.add(fromAddress);

  while (queue.length > 0) {
    const item = queue.shift()!;
    path.push({
      depth: item.depth,
      address: item.address,
      viaTxHash: item.viaTx,
      amountReceived: item.amount,
      timestamp: item.ts,
    });
    totalAmountTraced += item.amount;

    // Is this a final destination? (Receives but never sends.)
    const isFinalDestination =
      item.depth > 0 && !senderAddresses.has(item.address);
    if (isFinalDestination) {
      finalDestinations.push({
        address: item.address,
        amountReceived: item.amount,
        depth: item.depth,
      });
    }

    // Don't explore past maxDepth.
    if (item.depth >= maxDepth) continue;

    // Expand: find all outgoing transactions from this address.
    const outgoing = outgoingByAddress.get(item.address) ?? [];
    for (const tx of outgoing) {
      for (const out of tx.outputs) {
        if (visited.has(out.address)) continue;
        visited.add(out.address);
        totalHops++;
        queue.push({
          address: out.address,
          depth: item.depth + 1,
          amount: out.amount,
          viaTx: tx.txHash,
          ts: tx.timestamp,
        });
      }
    }
  }

  logInfo("lib.harchiq.trace.financial-intelligence", `[HarchIQ-Trace] Fund-flow complete: ${path.length} hops visited, ` +
      `${finalDestinations.length} final destinations, ` +
      `total traced=${totalAmountTraced}`);

  return {
    fromAddress,
    path,
    totalHops,
    finalDestinations,
    totalAmountTraced,
  };
}

// ─── DEGREE CENTRALITY ────────────────────────────────────────────

/**
 * calculateDegreeCentrality — degree centrality for a single node.
 *
 * Degree centrality = (number of edges incident to the node) /
 *                     (maximum possible degree, N − 1)
 *
 * For directed graphs, this counts both in- and out-edges (treating
 * the graph as undirected for this metric).
 *
 * @param graph  the graph
 * @param nodeId the node to score
 * @returns      degree centrality in [0,1]
 */
export function calculateDegreeCentrality(
  graph: Graph,
  nodeId: string,
): number {
  const n = graph.nodes.length;
  if (n <= 1) return 0;

  const degree = degreeOf(graph, nodeId);
  return Number((degree / (n - 1)).toFixed(4));
}

// ─── BETWEENNESS CENTRALITY (Brandes algorithm) ───────────────────

/**
 * calculateBetweennessCentrality — Brandes algorithm for betweenness
 * centrality of all nodes.
 *
 * Brandes (2001) computes betweenness in O(NM) for unweighted graphs
 * (vs the naïve O(N³) all-pairs-shortest-paths approach) using a
 * single-source BFS + dependency accumulation trick.
 *
 * Algorithm (for each source node s):
 *   1. BFS from s; record predecessors P[w] for each node w.
 *   2. Count shortest paths σ[w] from s to each w.
 *   3. In reverse BFS order, accumulate dependency:
 *        δ[v] += (σ[v] / σ[w]) × (1 + δ[w])   for each w ∈ successors(v)
 *   4. Betweenness[v] += δ[v] for v ≠ s.
 *
 * For an undirected graph, the final sum counts each pair twice, so
 * we divide by 2.
 *
 * @param graph the (effectively undirected) graph
 * @returns     Map<nodeId, betweenness score>
 */
export function calculateBetweennessCentrality(
  graph: Graph,
): Map<string, number> {
  const nodes = graph.nodes;
  const N = nodes.length;
  const betweenness = new Map<string, number>();
  for (const n of nodes) betweenness.set(n, 0);

  if (N < 3) return betweenness;

  // Build adjacency list (treat as undirected: edges in both directions).
  // Use a Set per node to deduplicate neighbors (the corporate graph may
  // contain multiple edges between the same pair, e.g. a director who is
  // also a shareholder).
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n, new Set());
  for (const e of graph.edges) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }

  for (const s of nodes) {
    // ── BFS from s ─────────────────────────────────────
    const stack: string[] = [];
    const preds = new Map<string, string[]>();
    for (const n of nodes) preds.set(n, []);
    const sigma = new Map<string, number>();
    for (const n of nodes) sigma.set(n, 0);
    sigma.set(s, 1);
    const dist = new Map<string, number>();
    for (const n of nodes) dist.set(n, -1);
    dist.set(s, 0);

    const queue: string[] = [s];
    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      for (const w of adj.get(v) ?? new Set<string>()) {
        // w discovered for the first time?
        if (dist.get(w) === -1) {
          dist.set(w, (dist.get(v) ?? 0) + 1);
          queue.push(w);
        }
        // Is v on a shortest path to w? If so, accumulate sigma and
        // record v as a predecessor of w.
        if ((dist.get(w) ?? 0) === (dist.get(v) ?? 0) + 1) {
          sigma.set(w, (sigma.get(w) ?? 0) + (sigma.get(v) ?? 0));
          preds.get(w)!.push(v);
        }
      }
    }

    // ── Dependency accumulation (reverse BFS order) ────
    const delta = new Map<string, number>();
    for (const n of nodes) delta.set(n, 0);

    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of preds.get(w) ?? []) {
        const contribution =
          ((sigma.get(v) ?? 0) / (sigma.get(w) ?? 1)) *
          (1 + (delta.get(w) ?? 0));
        delta.set(v, (delta.get(v) ?? 0) + contribution);
      }
      if (w !== s) {
        betweenness.set(w, (betweenness.get(w) ?? 0) + (delta.get(w) ?? 0));
      }
    }
  }

  // For an undirected graph, each pair (s, t) is counted twice
  // (once from s, once from t), so divide by 2.
  for (const [k, v] of betweenness) {
    betweenness.set(k, v / 2);
  }

  return betweenness;
}

// ─── INTERNAL HELPERS ─────────────────────────────────────────────

/**
 * degreeOf — count unique neighbors of a node (undirected degree).
 *
 * Our graphs are built with explicit bidirectional edges to represent
 * undirected relationships. To get the true undirected degree we count
 * distinct neighbors rather than raw edge endpoints (which would
 * double-count each undirected edge).
 *
 * @param graph  the graph
 * @param nodeId the node to score
 * @returns      number of distinct neighbors
 */
function degreeOf(graph: Graph, nodeId: string): number {
  const neighbors = new Set<string>();
  for (const e of graph.edges) {
    if (e.source === nodeId) neighbors.add(e.target);
    if (e.target === nodeId) neighbors.add(e.source);
  }
  return neighbors.size;
}

/**
 * median — compute the median of a numeric array.
 */
function median(arr: number[]): number {
  if (arr.length === 0) return 0;
  const sorted = arr.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

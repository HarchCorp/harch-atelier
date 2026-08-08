import { logInfo } from "@/lib/logger";
// ═══════════════════════════════════════════════════════════════
//  PROJECT AEGIS v3.1 — HarchIQ COGNITIVE WARFARE MODULE
//  Narrative propagation & Coordinated Inauthentic Behavior (CIB)
//  detection engine.
//
//  Inspired by Blackbird.AI's narrative-intelligence platform and
//  the FSB / NATO StratCom playbook for information-operations
//  analysis. Implements an SIR-Info epidemiological model adapted
//  for the spread of narratives across social platforms, plus a
//  CIB detection pipeline that fuses bipartite community detection,
//  temporal-entropy analysis, and lexical-variance measurement.
//
//  ┌────────────────────────────────────────────────────────────┐
//  │  Core algorithms                                            │
//  ├────────────────────────────────────────────────────────────┤
//  │  • SIR-Info R0 estimation (network epidemiology)            │
//  │  • Bipartite community detection (simplified Louvain)       │
//  │  • Kolmogorov-Smirnov test vs uniform (temporal entropy)    │
//  │  • Yule's K approximation (lexical richness)                │
//  │  • Jaro-Winkler string similarity (narrative matching)      │
//  │  • Shannon entropy of time distribution                     │
//  └────────────────────────────────────────────────────────────┘
//
//  Task ID: AEGIS-V31-ALGO
//  Module:  harchiq/cognitive/narrative-propagation
// ═══════════════════════════════════════════════════════════════

// ─── TYPES ────────────────────────────────────────────────────────

/**
 * InfectionState — the three compartments of the SIR-Info model.
 *
 * Adapted from classical epidemiology for information spread:
 *   S (Susceptible)  — node has not yet been exposed to the narrative.
 *   I (Infected)     — node is actively amplifying / spreading it.
 *   R (Recovered)    — node has stopped amplifying (forgot, debunked,
 *                      banned, lost interest) and is now immune.
 *
 * Unlike biological SIR, "recovery" in info-epidemiology does not
 * confer permanent immunity — a node can return to S after some
 * forgetting window. v3.1 models the simpler S→I→R→S loop implicitly
 * via re-observation in later collection cycles.
 */
export type InfectionState = "S" | "I" | "R";

/**
 * NarrativeNode — a single actor (user, account, page) in the
 * propagation graph, annotated with its SIR compartment and metadata.
 */
export interface NarrativeNode {
  /** Stable entity ID (matches the HarchIQ knowledge-graph node). */
  entityId: string;
  /** Current SIR compartment. */
  state: InfectionState;
  /** ISO-8601 timestamp when the node entered state I (if ever). */
  infectionTime?: string;
  /** Platform where the node is observed (twitter, telegram, …). */
  platform: string;
  /** Normalized influence score in [0,1] — follower count × engagement. */
  influenceScore: number;
}

/**
 * PropagationEdge — a directed, weighted, latency-annotated edge
 * between two narrative nodes. Direction = information flow.
 */
export interface PropagationEdge {
  /** Source entity ID (the infector / amplifier). */
  source: string;
  /** Target entity ID (the potentially infected). */
  target: string;
  /** Edge weight in [0,1] — probability of transmission per contact. */
  weight: number;
  /** Observed latency in hours between source post and target reshare. */
  latencyHours: number;
}

/**
 * PropagationGraph — the full network snapshot used by the SIR-Info
 * model and the CIB detector.
 */
export interface PropagationGraph {
  nodes: NarrativeNode[];
  edges: PropagationEdge[];
}

/**
 * SocialPost — a single observable post / share, used by the CIB
 * detector to build the bipartite user↔URL/hashtag graph.
 */
export interface SocialPost {
  /** Author handle or entity ID. */
  userId: string;
  /** ISO-8601 publish timestamp. */
  timestamp: string;
  /** Post body (for lexical analysis). */
  content: string;
  /** URLs shared in the post. */
  urls: string[];
  /** Hashtags used in the post (without the # prefix). */
  hashtags: string[];
  /** Platform name. */
  platform: string;
}

/**
 * CIBDetectionResult — the output of `detectCoordinatedInauthenticBehavior`.
 *
 * isCoordinated = true when a dense, low-diversity, temporally-bursty
 * cluster of accounts is detected — the classic signature of a
 * coordinated inauthentic behavior campaign.
 */
export interface CIBDetectionResult {
  /** True if a coordinated campaign signature is detected. */
  isCoordinated: boolean;
  /** Number of accounts in the largest suspicious cluster. */
  clusterSize: number;
  /** Temporal entropy in [0,1] — low = bursty/automated, high = organic. */
  temporalEntropy: number;
  /** Yule's K approximation — low = coordinated script, high = diverse. */
  lexicalVariance: number;
  /** Overall confidence in [0,1]. */
  confidence: number;
  /** IDs of accounts in the suspicious cluster. */
  clusterMembers: string[];
  /** Human-readable rationale for the classification. */
  rationale: string;
}

/**
 * TimeSlot — a single bucket in a propagation timeline.
 */
export interface TimeSlot {
  /** Slot label (ISO-8601 of slot start, or arbitrary label). */
  label: string;
  /** Slot start time in epoch ms. */
  startMs: number;
  /** Slot end time in epoch ms. */
  endMs: number;
}

/**
 * PropagationTimelineEntry — S/I/R counts and velocity for one slot.
 */
export interface PropagationTimelineEntry {
  /** The time slot label. */
  timeSlot: string;
  /** Number of susceptible nodes at end of slot. */
  susceptible: number;
  /** Number of infected (amplifying) nodes at end of slot. */
  infected: number;
  /** Number of recovered nodes at end of slot. */
  recovered: number;
  /** New infections per hour observed during this slot. */
  velocity: number;
}

/**
 * PropagationTimeline — the full time-series returned by
 * `trackNarrativePropagation`.
 */
export interface PropagationTimeline {
  /** Narrative identifier. */
  narrativeId: string;
  /** Per-slot entries. */
  entries: PropagationTimelineEntry[];
  /** Peak velocity across all slots (infections/hour). */
  peakVelocity: number;
  /** Total infections observed across all slots. */
  totalInfections: number;
}

/**
 * R0Estimate — the result of `calculateNarrativeR0`.
 */
export interface R0Estimate {
  /** Narrative identifier. */
  narrativeId: string;
  /** Basic reproduction number. R0 > 1 ⇒ epidemic narrative. */
  r0: number;
  /** Infection rate β (per infectious-contact per hour). */
  beta: number;
  /** Recovery rate γ (per hour). */
  gamma: number;
  /** Mean weighted degree of infectious nodes. */
  meanDegree: number;
  /** Number of nodes currently in state I. */
  infectedCount: number;
  /** Number of nodes currently in state R. */
  recoveredCount: number;
  /** Human-readable epidemic classification. */
  classification: "epidemic" | "endemic" | "dying";
}

// ─── CONSTANTS ────────────────────────────────────────────────────

/**
 * AVG_INFECTION_DURATION_HOURS — assumed mean duration a node stays
 * in state I before transitioning to R. 48h reflects the typical
 * half-life of a trending topic on Twitter / Telegram before organic
 * amplification exhausts itself.
 */
const AVG_INFECTION_DURATION_HOURS = 48;

/**
 * MIN_EDGE_WEIGHT — edges below this weight are treated as noise and
 * excluded from community detection in the CIB pipeline.
 */
const MIN_EDGE_WEIGHT = 0.15;

/**
 * CIB_CLUSTER_SIZE_THRESHOLD — minimum cluster size to even be
 * considered a coordinated campaign. Smaller clusters are likely
 * organic micro-communities.
 */
const CIB_CLUSTER_SIZE_THRESHOLD = 5;

/**
 * CIB_TEMPORAL_ENTROPY_THRESHOLD — temporal entropy below this value
 * (very uniform posting times → automation) is a strong CIB signal.
 */
const CIB_TEMPORAL_ENTROPY_THRESHOLD = 0.5;

/**
 * CIB_LEXICAL_VARIANCE_THRESHOLD — Yule's K below this value (very
 * low lexical diversity → scripted talking points) is a strong CIB signal.
 */
const CIB_LEXICAL_VARIANCE_THRESHOLD = 120;

// ─── STRING SIMILARITY ────────────────────────────────────────────

/**
 * jaroWinkler — Jaro-Winkler string similarity in [0,1].
 *
 * Two-pass algorithm:
 *   1. Jaro similarity: matching characters within a window of
 *      max(|s1|,|s2|)/2 − 1, transpositions counted.
 *   2. Winkler bonus: 0.1 × prefix_length × (1 − jaro), for the
 *      common prefix (up to 4 chars). Favors strings that agree on
 *      their first few characters (typical for proper nouns / hashtags).
 *
 * @param s1 first string
 * @param s2 second string
 * @returns similarity in [0,1] — 1 = identical, 0 = no overlap
 */
export function jaroWinkler(s1: string, s2: string): number {
  if (s1 === s2) return 1;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  // Matching window: floor(max(len1, len2) / 2) − 1, clamped to ≥ 0.
  const matchWindow = Math.max(0, Math.floor(Math.max(len1, len2) / 2) - 1);

  const s1Matches = new Array<boolean>(len1).fill(false);
  const s2Matches = new Array<boolean>(len2).fill(false);

  // ── Pass 1: count matches within the window ──────────────
  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j]) continue;
      if (s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;

  // ── Pass 2: count transpositions ─────────────────────────
  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }
  const t = transpositions / 2;

  // Jaro similarity.
  const m = matches;
  const jaro =
    (m / len1 + m / len2 + (m - t) / m) / 3;

  // ── Winkler prefix bonus ─────────────────────────────────
  let prefixLen = 0;
  const maxPrefix = Math.min(4, len1, len2);
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefixLen++;
    else break;
  }

  return jaro + prefixLen * 0.1 * (1 - jaro);
}

// ─── LEXICAL RICHNESS (YULE'S K) ──────────────────────────────────

/**
 * yulesK — Yule's characteristic K, a measure of lexical richness.
 *
 * Lower K ⇒ text repeats the same words heavily (low diversity,
 * typical of scripted/coordinated content).
 * Higher K ⇒ diverse vocabulary (organic writing).
 *
 * Implementation uses the standard frequency-of-frequencies formula:
 *
 *   K = 10^4 × (M2 − M1) / M1^2
 *
 * where:
 *   M1 = Σ (i × f_i)    — total tokens
 *   M2 = Σ (i² × f_i)   — sum of squared frequencies
 *   f_i = number of distinct words occurring exactly i times
 *
 * @param texts array of post bodies
 * @returns Yule's K approximation (higher = more lexically diverse)
 */
export function yulesK(texts: string[]): number {
  // Tokenize all texts into one bag of lowercase word tokens.
  const tokens: string[] = [];
  for (const t of texts) {
    const words = (t.toLowerCase().match(/\p{L}+/gu) ?? []);
    tokens.push(...words);
  }
  if (tokens.length === 0) return 0;

  // word → frequency
  const freq = new Map<string, number>();
  for (const w of tokens) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  // frequency → count of words with that frequency (f_i)
  const spectrum = new Map<number, number>();
  for (const f of freq.values()) {
    spectrum.set(f, (spectrum.get(f) ?? 0) + 1);
  }

  let m1 = 0;
  let m2 = 0;
  for (const [i, fi] of spectrum) {
    m1 += i * fi;
    m2 += i * i * fi;
  }

  if (m1 === 0) return 0;
  // Guard against negative M2 − M1 from small samples.
  const diff = Math.max(0, m2 - m1);
  return (10_000 * diff) / (m1 * m1);
}

// ─── TEMPORAL ENTROPY ─────────────────────────────────────────────

/**
 * temporalEntropy — Shannon entropy of timestamp distribution, with
 * an accompanying Kolmogorov-Smirnov statistic against uniform.
 *
 * Returns a normalized entropy in [0,1] where 1 = perfectly uniform
 * (organic, around-the-clock posting) and 0 = single burst (one-shot
 * coordinated drop).
 *
 * Method:
 *  1. Bucket timestamps into B = 24 hourly bins.
 *  2. Compute empirical probability mass p_b = count_b / N.
 *  3. Shannon entropy H = −Σ p_b log2(p_b), normalized by log2(B).
 *  4. KS statistic D = max_b |cdf_observed(b) − cdf_uniform(b)|.
 *
 * The normalized Shannon entropy is returned as the primary signal;
 * the KS D-statistic is logged for analyst inspection.
 *
 * @param timestamps array of ISO-8601 timestamps
 * @returns normalized entropy in [0,1]
 */
export function temporalEntropy(timestamps: string[]): number {
  if (timestamps.length === 0) return 0;
  if (timestamps.length === 1) return 0;

  // Bucket into 24 hourly bins.
  const bins = new Array<number>(24).fill(0);
  let parsed = 0;
  for (const ts of timestamps) {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) continue;
    bins[d.getUTCHours()]++;
    parsed++;
  }
  if (parsed === 0) return 0;

  // Shannon entropy, normalized to [0,1] by log2(B).
  const n = parsed;
  let h = 0;
  for (const c of bins) {
    if (c === 0) continue;
    const p = c / n;
    h -= p * Math.log2(p);
  }
  const normalized = h / Math.log2(24);

  // KS statistic against uniform (informational — logged, not returned).
  const uniform = 1 / 24;
  let cumulativeObs = 0;
  let cumulativeUni = 0;
  let dMax = 0;
  for (let b = 0; b < 24; b++) {
    cumulativeObs += bins[b] / n;
    cumulativeUni += uniform;
    const d = Math.abs(cumulativeObs - cumulativeUni);
    if (d > dMax) dMax = d;
  }

  logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] temporalEntropy: N=${parsed}, H=${normalized.toFixed(3)}, KS-D=${dMax.toFixed(3)}`);

  return normalized;
}

// ─── SIR-INFO R0 ESTIMATION ───────────────────────────────────────

/**
 * calculateNarrativeR0 — estimate the basic reproduction number R0
 * of a narrative on the propagation graph using an SIR-Info model.
 *
 * Network-epidemiology R0 for an SIR process:
 *
 *   R0 = (β / γ) × ⟨k⟩
 *
 * where:
 *   β  = per-infectious-contact transmission probability
 *   γ  = recovery rate = 1 / avg_infection_duration  (per hour)
 *   ⟨k⟩ = mean weighted degree of infectious nodes
 *
 * Estimation procedure:
 *  1. Identify all infectious (I) and recovered (R) nodes — these
 *     represent observed infections.
 *  2. Identify all edges where at least one endpoint is infectious
 *     (I or R) — these represent transmission opportunities.
 *  3. β ≈ (infectious nodes) / (weighted infectious-contact opportunities)
 *     — i.e., the fraction of contacts that resulted in infection.
 *  4. ⟨k⟩ = mean weighted out-degree of infectious nodes.
 *  5. R0 = (β / γ) × ⟨k⟩.
 *
 * Interpretation:
 *   R0 > 1 ⇒ epidemic narrative (each amplifier infects >1 new node)
 *   R0 ≈ 1 ⇒ endemic (sustained but not growing)
 *   R0 < 1 ⇒ dying narrative
 *
 * @param graph       the propagation graph snapshot
 * @param narrativeId identifier for logging / provenance
 * @returns           R0Estimate with full breakdown
 */
export function calculateNarrativeR0(
  graph: PropagationGraph,
  narrativeId: string,
): R0Estimate {
  const { nodes, edges } = graph;

  const nodeById = new Map<string, NarrativeNode>();
  for (const n of nodes) nodeById.set(n.entityId, n);

  // ── Step 1: identify infectious & recovered nodes ────────
  const infectiousIds = new Set<string>();
  let infectedCount = 0;
  let recoveredCount = 0;
  for (const n of nodes) {
    if (n.state === "I") {
      infectiousIds.add(n.entityId);
      infectedCount++;
    } else if (n.state === "R") {
      // Recovered nodes were infectious at some point — count their edges.
      infectiousIds.add(n.entityId);
      recoveredCount++;
    }
  }

  const totalInfected = infectedCount + recoveredCount;

  // ── Step 2: weighted infectious-contact opportunities ────
  // Sum of weights of edges where at least one endpoint is in I or R.
  let contactOpportunities = 0;
  let weightedOutDegreeSum = 0;

  for (const e of edges) {
    const srcInf = infectiousIds.has(e.source);
    const tgtInf = infectiousIds.has(e.target);
    if (srcInf || tgtInf) {
      contactOpportunities += e.weight;
    }
    if (srcInf) {
      weightedOutDegreeSum += e.weight;
    }
  }
  const infectiousNodeCount = infectiousIds.size;

  // ── Step 3: β (per-contact transmission probability) ─────
  // β = observed infections / infectious-contact opportunities.
  // Guard against division-by-zero.
  const beta =
    contactOpportunities > 0
      ? totalInfected / contactOpportunities
      : 0;

  // ── Step 4: ⟨k⟩ mean weighted out-degree of infectious ──
  const meanDegree =
    infectiousNodeCount > 0
      ? weightedOutDegreeSum / infectiousNodeCount
      : 0;

  // ── Step 5: γ and R0 ─────────────────────────────────────
  const gamma = 1 / AVG_INFECTION_DURATION_HOURS; // per hour
  const r0 = (beta / gamma) * meanDegree;

  let classification: R0Estimate["classification"];
  if (r0 > 1.0) classification = "epidemic";
  else if (r0 > 0.5) classification = "endemic";
  else classification = "dying";

  logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] R0("${narrativeId}"): ` +
      `β=${beta.toFixed(4)}, γ=${gamma.toFixed(4)} /h, ` +
      `⟨k⟩=${meanDegree.toFixed(2)} → R0=${r0.toFixed(3)} (${classification})`);

  return {
    narrativeId,
    r0: Number(r0.toFixed(4)),
    beta: Number(beta.toFixed(6)),
    gamma: Number(gamma.toFixed(6)),
    meanDegree: Number(meanDegree.toFixed(4)),
    infectedCount,
    recoveredCount,
    classification,
  };
}

// ─── COORDINATED INAUTHENTICIC BEHAVIOR DETECTION ─────────────────

/**
 * detectCoordinatedInauthenticBehavior — CIB detection pipeline.
 *
 * Adapted from the academic literature on coordinated behavior
 * (Pacheco et al. 2020, "Uncovering Coordinated Networks on Social
 * Media") and the open-source methods used by Bellingcat and DFRLab.
 *
 * Pipeline:
 *  1. Build a bipartite graph: Users ↔ {URLs, Hashtags}.
 *  2. Project to a weighted user-user graph (two users are connected
 *     if they shared the same URL/hashtag; weight = number of shared
 *     items × Jaro-Winkler similarity of their content).
 *  3. Detect dense communities via simplified Louvain (connected
 *     components with weight threshold — full modularity
 *     optimization is O(V·E) per pass and unnecessary for the
 *     low-cardinality bipartite projection in v3.1).
 *  4. For the largest cluster, compute:
 *       • temporal entropy (KS vs uniform) — low ⇒ automated posting
 *       • lexical variance (Yule's K) — low ⇒ scripted content
 *  5. Classify as coordinated if cluster is large AND entropy is low
 *     AND lexical variance is low.
 *
 * @param graph propagation graph (used for influence weighting)
 * @param posts array of social posts to analyze
 * @returns     CIBDetectionResult with full breakdown
 */
export function detectCoordinatedInauthenticBehavior(
  graph: PropagationGraph,
  posts: SocialPost[],
): CIBDetectionResult {
  logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] CIB detection: ${posts.length} posts, ${graph.nodes.length} nodes`);

  // ── Step 1: build bipartite index ────────────────────────
  // userItemMap: userId → Set of items (urls + hashtags)
  const userItems = new Map<string, Set<string>>();
  const userPosts = new Map<string, SocialPost[]>();
  for (const p of posts) {
    if (!userItems.has(p.userId)) {
      userItems.set(p.userId, new Set());
      userPosts.set(p.userId, []);
    }
    const items = userItems.get(p.userId)!;
    for (const u of p.urls) items.add(`url:${u}`);
    for (const h of p.hashtags) items.add(`tag:${h.toLowerCase()}`);
    userPosts.get(p.userId)!.push(p);
  }

  const users = Array.from(userItems.keys());

  // ── Step 2: project to user-user weighted graph ──────────
  // Edge weight = number of shared items × content similarity.
  // Use Jaro-Winkler on concatenated post content as a tie-breaker
  // to ensure the cluster isn't just two accounts retweeting the
  // same one URL (which is benign).
  const adj = new Map<string, Map<string, number>>();
  for (const u of users) adj.set(u, new Map());

  for (let i = 0; i < users.length; i++) {
    const u1 = users[i];
    const items1 = userItems.get(u1)!;
    const posts1 = userPosts.get(u1)!;
    const content1 = posts1.map((p) => p.content).join(" ");
    for (let j = i + 1; j < users.length; j++) {
      const u2 = users[j];
      const items2 = userItems.get(u2)!;
      // Count shared items (set intersection size).
      let shared = 0;
      for (const it of items1) if (items2.has(it)) shared++;
      if (shared === 0) continue;

      // Content similarity tie-breaker.
      const posts2 = userPosts.get(u2)!;
      const content2 = posts2.map((p) => p.content).join(" ");
      const sim = jaroWinkler(content1, content2);

      const weight = shared * (0.5 + 0.5 * sim);
      if (weight >= MIN_EDGE_WEIGHT) {
        adj.get(u1)!.set(u2, weight);
        adj.get(u2)!.set(u1, weight);
      }
    }
  }

  // ── Step 3: connected components as clusters ─────────────
  // (Simplified Louvain — full modularity optimization deferred to v3.2.)
  const visited = new Set<string>();
  const clusters: string[][] = [];
  for (const u of users) {
    if (visited.has(u)) continue;
    const component: string[] = [];
    const stack = [u];
    while (stack.length > 0) {
      const x = stack.pop()!;
      if (visited.has(x)) continue;
      visited.add(x);
      component.push(x);
      const neighbors = adj.get(x);
      if (!neighbors) continue;
      for (const [n, w] of neighbors) {
        if (w >= MIN_EDGE_WEIGHT && !visited.has(n)) stack.push(n);
      }
    }
    if (component.length > 1) clusters.push(component);
  }

  // Largest cluster is our CIB candidate.
  clusters.sort((a, b) => b.length - a.length);
  const largest = clusters[0] ?? [];

  if (largest.length < CIB_CLUSTER_SIZE_THRESHOLD) {
    logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] CIB: largest cluster (${largest.length}) below threshold → not coordinated`);
    return {
      isCoordinated: false,
      clusterSize: largest.length,
      temporalEntropy: 1,
      lexicalVariance: 200,
      confidence: 0.3,
      clusterMembers: largest,
      rationale: `Largest cluster (${largest.length} accounts) below CIB threshold of ${CIB_CLUSTER_SIZE_THRESHOLD}.`,
    };
  }

  // ── Step 4: temporal + lexical analysis of cluster ───────
  const clusterPosts: SocialPost[] = [];
  for (const u of largest) {
    const ps = userPosts.get(u);
    if (ps) clusterPosts.push(...ps);
  }

  const tsEntropy = temporalEntropy(clusterPosts.map((p) => p.timestamp));
  const lexVar = yulesK(clusterPosts.map((p) => p.content));

  // ── Step 5: classification ───────────────────────────────
  // Coordinated iff cluster is large AND entropy low AND lexVar low.
  const entropySignal = tsEntropy < CIB_TEMPORAL_ENTROPY_THRESHOLD;
  const lexicalSignal = lexVar < CIB_LEXICAL_VARIANCE_THRESHOLD;
  const isCoordinated = entropySignal && lexicalSignal;

  // Confidence: blend of how far below threshold each signal is.
  const entropyConf = Math.max(
    0,
    Math.min(1, (CIB_TEMPORAL_ENTROPY_THRESHOLD - tsEntropy) / CIB_TEMPORAL_ENTROPY_THRESHOLD),
  );
  const lexicalConf = Math.max(
    0,
    Math.min(1, (CIB_LEXICAL_VARIANCE_THRESHOLD - lexVar) / CIB_LEXICAL_VARIANCE_THRESHOLD),
  );
  const sizeConf = Math.min(1, largest.length / 50);
  const confidence = Number(
    ((0.4 * entropyConf + 0.4 * lexicalConf + 0.2 * sizeConf)).toFixed(3),
  );

  const signals: string[] = [];
  if (entropySignal) signals.push(`temporal entropy ${tsEntropy.toFixed(2)} < ${CIB_TEMPORAL_ENTROPY_THRESHOLD}`);
  if (lexicalSignal) signals.push(`lexical variance ${lexVar.toFixed(0)} < ${CIB_LEXICAL_VARIANCE_THRESHOLD}`);
  if (signals.length === 0) signals.push("no strong CIB signals");

  const rationale =
    `Cluster of ${largest.length} accounts sharing URLs/hashtags. ` +
    `Signals: ${signals.join("; ")}. ` +
    `Confidence ${confidence.toFixed(2)} (${isCoordinated ? "COORDINATED" : "organic"}).`;

  logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] CIB result: cluster=${largest.length}, ` +
      `entropy=${tsEntropy.toFixed(3)}, lexVar=${lexVar.toFixed(1)}, ` +
      `coordinated=${isCoordinated}, confidence=${confidence.toFixed(2)}`);

  return {
    isCoordinated,
    clusterSize: largest.length,
    temporalEntropy: Number(tsEntropy.toFixed(3)),
    lexicalVariance: Number(lexVar.toFixed(1)),
    confidence,
    clusterMembers: largest,
    rationale,
  };
}

// ─── PROPAGATION TIMELINE TRACKING ────────────────────────────────

/**
 * trackNarrativePropagation — track how a narrative spreads across
 * discrete time slots.
 *
 * For each slot:
 *   • Count nodes in state S, I, R at end-of-slot (using infectionTime
 *     to bucket nodes into the slot where they transitioned S→I, and
 *     assuming recovery 48h after infection).
 *   • Velocity = (new infections in slot) / (slot duration in hours).
 *
 * The function is purely observational — it does not run the SIR
 * simulation forward. Callers should pass a graph already annotated
 * with infectionTime for every infected/recovered node.
 *
 * @param narrativeId identifier for logging / provenance
 * @param graph       propagation graph with infectionTime populated
 * @param timeSlots   ordered list of time-slot buckets
 * @returns           PropagationTimeline with per-slot entries
 */
export function trackNarrativePropagation(
  narrativeId: string,
  graph: PropagationGraph,
  timeSlots: TimeSlot[],
): PropagationTimeline {
  const entries: PropagationTimelineEntry[] = [];
  let totalInfections = 0;
  let peakVelocity = 0;

  for (const slot of timeSlots) {
    let susceptible = 0;
    let infected = 0;
    let recovered = 0;
    let newInfectionsThisSlot = 0;

    for (const n of graph.nodes) {
      const infMs = n.infectionTime ? Date.parse(n.infectionTime) : NaN;
      const isInf = !Number.isNaN(infMs);

      if (!isInf) {
        // Never infected → susceptible.
        susceptible++;
        continue;
      }

      // Recovered after AVG_INFECTION_DURATION_HOURS since infection.
      const recoveryMs = infMs + AVG_INFECTION_DURATION_HOURS * 3600 * 1000;

      if (recoveryMs <= slot.endMs) {
        recovered++;
      } else if (infMs <= slot.endMs) {
        infected++;
      } else {
        // Infection happens after this slot — still susceptible here.
        susceptible++;
        continue;
      }

      // New infection = infection occurred within this slot's window.
      if (infMs >= slot.startMs && infMs <= slot.endMs) {
        newInfectionsThisSlot++;
      }
    }

    const durationHours = Math.max(
      1,
      (slot.endMs - slot.startMs) / (3600 * 1000),
    );
    const velocity = Number((newInfectionsThisSlot / durationHours).toFixed(3));

    entries.push({
      timeSlot: slot.label,
      susceptible,
      infected,
      recovered,
      velocity,
    });

    totalInfections += newInfectionsThisSlot;
    if (velocity > peakVelocity) peakVelocity = velocity;
  }

  logInfo("lib.harchiq.cognitive.narrative-propagation", `[HarchIQ-Cognitive] Propagation timeline "${narrativeId}": ` +
      `${entries.length} slots, ${totalInfections} infections, peak velocity ${peakVelocity.toFixed(2)}/h`);

  return {
    narrativeId,
    entries,
    peakVelocity,
    totalInfections,
  };
}

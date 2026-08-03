// ═══════════════════════════════════════════════════════════════
//  ENTITY RESOLUTION & KNOWLEDGE GRAPH ENGINE
//
//  Entity resolution, deduplication, and knowledge graph
//  construction for the Harch Atelier platform. Handles
//  person/organization disambiguation, relationship extraction,
//  and graph-based intelligence queries.
// ═══════════════════════════════════════════════════════════════

import type { Entity, EntityMention } from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface ResolvedEntity {
  id: string;
  canonicalName: string;
  aliases: string[];
  type: "person" | "organization" | "location" | "ticker" | "product" | "event" | "topic";
  confidence: number;
  sources: string[];
  mentions: number;
  firstSeen: string;
  lastSeen: string;
  metadata: Record<string, unknown>;
  relationships: EntityRelationship[];
}

export interface EntityRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: RelationshipType;
  strength: number;
  confidence: number;
  evidence: string[];
  firstObserved: string;
  lastObserved: string;
  bidirectional: boolean;
}

export type RelationshipType =
  | "works_at"
  | "ceo_of"
  | "chairman_of"
  | "board_member_of"
  | "advisor_to"
  | "investor_in"
  | "acquired_by"
  | "subsidiary_of"
  | "partner_of"
  | "competitor_of"
  | "supplier_of"
  | "customer_of"
  | "regulator_of"
  | "mentioned_with"
  | "quoted_about"
  | "replaced_by"
  | "reports_to"
  | "associated_with"
  | "family_of"
  | "educated_at";

export interface EntityCluster {
  id: string;
  entities: string[];
  canonicalEntity: string;
  confidence: number;
  type: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
  size: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  weight: number;
  properties: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
    connectedComponents: number;
  };
}

export interface EntityMatchResult {
  query: string;
  matches: Array<{
    entityId: string;
    entityName: string;
    score: number;
    matchType: "exact" | "alias" | "fuzzy" | "phonetic";
  }>;
}

// ─── ENTITY RESOLVER ───────────────────────────────────────────

export class EntityResolver {
  private entities: Map<string, ResolvedEntity> = new Map();
  private aliasIndex: Map<string, string> = new Map();
  private clusters: Map<string, EntityCluster> = new Map();

  addEntity(entity: ResolvedEntity): void {
    this.entities.set(entity.id, entity);
    this.indexAlias(entity.canonicalName.toLowerCase(), entity.id);
    for (const alias of entity.aliases) {
      this.indexAlias(alias.toLowerCase(), entity.id);
    }
  }

  private indexAlias(alias: string, entityId: string): void {
    if (!this.aliasIndex.has(alias)) {
      this.aliasIndex.set(alias, entityId);
    }
  }

  resolve(name: string): ResolvedEntity | undefined {
    const lower = name.toLowerCase().trim();
    const entityId = this.aliasIndex.get(lower);
    if (entityId) {
      return this.entities.get(entityId);
    }
    // Try fuzzy matching
    const fuzzy = this.fuzzyMatch(name);
    if (fuzzy) {
      return this.entities.get(fuzzy);
    }
    return undefined;
  }

  private fuzzyMatch(name: string): string | undefined {
    const lower = name.toLowerCase().trim();
    let bestMatch: string | undefined;
    let bestScore = 0;
    for (const [alias, entityId] of this.aliasIndex) {
      const score = this.similarity(lower, alias);
      if (score > bestScore && score > 0.85) {
        bestScore = score;
        bestMatch = entityId;
      }
    }
    return bestMatch;
  }

  private similarity(a: string, b: string): number {
    if (a === b) return 1;
    const distance = this.levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - distance / maxLen;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[b.length][a.length];
  }

  search(query: string, limit: number = 10): EntityMatchResult {
    const lower = query.toLowerCase().trim();
    const matches: EntityMatchResult["matches"] = [];

    for (const [alias, entityId] of this.aliasIndex) {
      const entity = this.entities.get(entityId);
      if (!entity) continue;

      let score = 0;
      let matchType: EntityMatchResult["matches"][0]["matchType"] = "fuzzy";

      if (alias === lower) {
        score = 1.0;
        matchType = alias === entity.canonicalName.toLowerCase() ? "exact" : "alias";
      } else if (alias.includes(lower) || lower.includes(alias)) {
        score = 0.8;
        matchType = "fuzzy";
      } else {
        score = this.similarity(lower, alias);
        if (score > 0.7) {
          matchType = "fuzzy";
        } else {
          continue;
        }
      }

      matches.push({ entityId, entityName: entity.canonicalName, score, matchType });
    }

    matches.sort((a, b) => b.score - a.score);
    return { query, matches: matches.slice(0, limit) };
  }

  mergeEntities(entityId1: string, entityId2: string): boolean {
    const e1 = this.entities.get(entityId1);
    const e2 = this.entities.get(entityId2);
    if (!e1 || !e2) return false;

    const merged: ResolvedEntity = {
      ...e1,
      aliases: [...new Set([...e1.aliases, ...e2.aliases, e2.canonicalName])],
      mentions: e1.mentions + e2.mentions,
      sources: [...new Set([...e1.sources, ...e2.sources])],
      confidence: Math.max(e1.confidence, e2.confidence),
      relationships: [...e1.relationships, ...e2.relationships],
    };

    this.entities.set(entityId1, merged);
    this.entities.delete(entityId2);

    for (const [alias, id] of this.aliasIndex) {
      if (id === entityId2) {
        this.aliasIndex.set(alias, entityId1);
      }
    }

    return true;
  }

  getEntity(id: string): ResolvedEntity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): ResolvedEntity[] {
    return [...this.entities.values()];
  }

  getEntitiesByType(type: ResolvedEntity["type"]): ResolvedEntity[] {
    return [...this.entities.values()].filter(e => e.type === type);
  }

  getEntityCount(): number {
    return this.entities.size;
  }

  getAliasCount(): number {
    return this.aliasIndex.size;
  }

  getTopEntities(limit: number = 10): ResolvedEntity[] {
    return [...this.entities.values()]
      .sort((a, b) => b.mentions - a.mentions)
      .slice(0, limit);
  }

  getEntitiesByMentionCount(minMentions: number): ResolvedEntity[] {
    return [...this.entities.values()].filter(e => e.mentions >= minMentions);
  }

  getStatistics(): {
    totalEntities: number;
    totalAliases: number;
    byType: Record<string, number>;
    averageMentions: number;
    averageConfidence: number;
    totalRelationships: number;
  } {
    const byType: Record<string, number> = {};
    let totalMentions = 0;
    let totalConfidence = 0;
    let totalRelationships = 0;

    for (const entity of this.entities.values()) {
      byType[entity.type] = (byType[entity.type] || 0) + 1;
      totalMentions += entity.mentions;
      totalConfidence += entity.confidence;
      totalRelationships += entity.relationships.length;
    }

    const count = this.entities.size;
    return {
      totalEntities: count,
      totalAliases: this.aliasIndex.size,
      byType,
      averageMentions: count > 0 ? totalMentions / count : 0,
      averageConfidence: count > 0 ? totalConfidence / count : 0,
      totalRelationships,
    };
  }
}

// ─── RELATIONSHIP EXTRACTOR ────────────────────────────────────

export class RelationshipExtractor {
  private relationships: Map<string, EntityRelationship> = new Map();

  addRelationship(rel: Omit<EntityRelationship, "id">): EntityRelationship {
    const id = `rel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fullRel: EntityRelationship = { ...rel, id };
    this.relationships.set(id, fullRel);
    return fullRel;
  }

  getRelationshipsForEntity(entityId: string): EntityRelationship[] {
    return [...this.relationships.values()].filter(
      r => r.sourceEntityId === entityId || r.targetEntityId === entityId
    );
  }

  getRelationshipsByType(type: RelationshipType): EntityRelationship[] {
    return [...this.relationships.values()].filter(r => r.type === type);
  }

  getStrongestRelationships(entityId: string, limit: number = 5): EntityRelationship[] {
    return this.getRelationshipsForEntity(entityId)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }

  getRelationshipCount(): number {
    return this.relationships.size;
  }

  removeRelationship(id: string): boolean {
    return this.relationships.delete(id);
  }

  getRelationship(id: string): EntityRelationship | undefined {
    return this.relationships.get(id);
  }

  getRelationshipsBetween(entityId1: string, entityId2: string): EntityRelationship[] {
    return [...this.relationships.values()].filter(
      r =>
        (r.sourceEntityId === entityId1 && r.targetEntityId === entityId2) ||
        (r.sourceEntityId === entityId2 && r.targetEntityId === entityId1)
    );
  }

  getStatistics(): {
    total: number;
    byType: Record<string, number>;
    averageStrength: number;
    averageConfidence: number;
    bidirectionalCount: number;
  } {
    const byType: Record<string, number> = {};
    let totalStrength = 0;
    let totalConfidence = 0;
    let bidirectional = 0;

    for (const rel of this.relationships.values()) {
      byType[rel.type] = (byType[rel.type] || 0) + 1;
      totalStrength += rel.strength;
      totalConfidence += rel.confidence;
      if (rel.bidirectional) bidirectional++;
    }

    const count = this.relationships.size;
    return {
      total: count,
      byType,
      averageStrength: count > 0 ? totalStrength / count : 0,
      averageConfidence: count > 0 ? totalConfidence / count : 0,
      bidirectionalCount: bidirectional,
    };
  }
}

// ─── KNOWLEDGE GRAPH BUILDER ───────────────────────────────────

export class KnowledgeGraphBuilder {
  public nodes: Map<string, KnowledgeGraphNode> = new Map();
  public edges: Map<string, KnowledgeGraphEdge> = new Map();

  addNode(id: string, label: string, type: string, properties: Record<string, unknown> = {}, size: number = 10): KnowledgeGraphNode {
    const node: KnowledgeGraphNode = { id, label, type, properties, size };
    this.nodes.set(id, node);
    return node;
  }

  addEdge(id: string, source: string, target: string, type: RelationshipType, weight: number = 1, properties: Record<string, unknown> = {}): KnowledgeGraphEdge | null {
    if (!this.nodes.has(source) || !this.nodes.has(target)) return null;
    const edge: KnowledgeGraphEdge = { id, source, target, type, weight, properties };
    this.edges.set(id, edge);
    return edge;
  }

  removeNode(id: string): boolean {
    if (!this.nodes.delete(id)) return false;
    for (const [edgeId, edge] of this.edges) {
      if (edge.source === id || edge.target === id) {
        this.edges.delete(edgeId);
      }
    }
    return true;
  }

  removeEdge(id: string): boolean {
    return this.edges.delete(id);
  }

  getNode(id: string): KnowledgeGraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): KnowledgeGraphEdge | undefined {
    return this.edges.get(id);
  }

  getNeighbors(nodeId: string): KnowledgeGraphNode[] {
    const neighborIds = new Set<string>();
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) neighborIds.add(edge.target);
      if (edge.target === nodeId) neighborIds.add(edge.source);
    }
    return [...neighborIds].map(id => this.nodes.get(id)!).filter(Boolean);
  }

  getEdges(nodeId: string): KnowledgeGraphEdge[] {
    return [...this.edges.values()].filter(
      e => e.source === nodeId || e.target === nodeId
    );
  }

  getShortestPath(sourceId: string, targetId: string): string[] | null {
    if (!this.nodes.has(sourceId) || !this.nodes.has(targetId)) return null;
    if (sourceId === targetId) return [sourceId];

    const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];
    const visited = new Set<string>([sourceId]);

    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      const neighbors = this.getNeighbors(id);

      for (const neighbor of neighbors) {
        if (neighbor.id === targetId) {
          return [...path, neighbor.id];
        }
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push({ id: neighbor.id, path: [...path, neighbor.id] });
        }
      }
    }

    return null;
  }

  getConnectedComponents(): Array<string[]> {
    const visited = new Set<string>();
    const components: Array<string[]> = [];

    for (const nodeId of this.nodes.keys()) {
      if (visited.has(nodeId)) continue;

      const component: string[] = [];
      const queue = [nodeId];
      visited.add(nodeId);

      while (queue.length > 0) {
        const current = queue.shift()!;
        component.push(current);

        const neighbors = this.getNeighbors(current);
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor.id)) {
            visited.add(neighbor.id);
            queue.push(neighbor.id);
          }
        }
      }

      components.push(component);
    }

    return components;
  }

  getDegree(nodeId: string): number {
    return this.getEdges(nodeId).length;
  }

  getDegreeCentrality(nodeId: string): number {
    const maxDegree = this.nodes.size - 1;
    if (maxDegree === 0) return 0;
    return this.getDegree(nodeId) / maxDegree;
  }

  getBetweennessCentrality(nodeId: string): number {
    let betweenness = 0;
    const nodeIds = [...this.nodes.keys()];

    for (const s of nodeIds) {
      if (s === nodeId) continue;
      for (const t of nodeIds) {
        if (t === nodeId || t === s) continue;
        const path = this.getShortestPath(s, t);
        if (path && path.includes(nodeId)) {
          betweenness++;
        }
      }
    }

    const n = this.nodes.size;
    const maxBetweenness = (n - 1) * (n - 2) / 2;
    if (maxBetweenness === 0) return 0;
    return betweenness / maxBetweenness;
  }

  getTopNodesByDegree(limit: number = 10): Array<{ node: KnowledgeGraphNode; degree: number }> {
    return [...this.nodes.values()]
      .map(node => ({ node, degree: this.getDegree(node.id) }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, limit);
  }

  getTopNodesByBetweenness(limit: number = 10): Array<{ node: KnowledgeGraphNode; betweenness: number }> {
    return [...this.nodes.values()]
      .map(node => ({ node, betweenness: this.getBetweennessCentrality(node.id) }))
      .sort((a, b) => b.betweenness - a.betweenness)
      .slice(0, limit);
  }

  build(): KnowledgeGraph {
    const nodes = [...this.nodes.values()];
    const edges = [...this.edges.values()];
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;
    const averageDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;
    const connectedComponents = this.getConnectedComponents().length;

    return {
      nodes,
      edges,
      metadata: {
        nodeCount,
        edgeCount,
        density,
        averageDegree,
        connectedComponents,
      },
    };
  }

  getStats(): {
    nodeCount: number;
    edgeCount: number;
    density: number;
    averageDegree: number;
    connectedComponents: number;
    maxDegree: number;
    minDegree: number;
  } {
    const degrees = [...this.nodes.keys()].map(id => this.getDegree(id));
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.size;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    return {
      nodeCount,
      edgeCount,
      density: maxEdges > 0 ? edgeCount / maxEdges : 0,
      averageDegree: degrees.length > 0 ? degrees.reduce((a, b) => a + b, 0) / degrees.length : 0,
      connectedComponents: this.getConnectedComponents().length,
      maxDegree: degrees.length > 0 ? Math.max(...degrees) : 0,
      minDegree: degrees.length > 0 ? Math.min(...degrees) : 0,
    };
  }

  filter(predicate: (node: KnowledgeGraphNode) => boolean): KnowledgeGraphBuilder {
    const filtered = new KnowledgeGraphBuilder();
    for (const node of this.nodes.values()) {
      if (predicate(node)) {
        filtered.addNode(node.id, node.label, node.type, node.properties, node.size);
      }
    }
    for (const edge of this.edges.values()) {
      if (filtered.nodes.has(edge.source) && filtered.nodes.has(edge.target)) {
        filtered.addEdge(edge.id, edge.source, edge.target, edge.type, edge.weight, edge.properties);
      }
    }
    return filtered;
  }

  subgraph(nodeIds: string[]): KnowledgeGraphBuilder {
    const idSet = new Set(nodeIds);
    return this.filter(node => idSet.has(node.id));
  }

  clear(): void {
    this.nodes.clear();
    this.edges.clear();
  }
}

// ─── ENTITY CLUSTERING ─────────────────────────────────────────

export class EntityClusterer {
  private clusters: Map<string, EntityCluster> = new Map();
  private entityToCluster: Map<string, string> = new Map();

  createCluster(entityId: string, type: string, confidence: number = 1.0): EntityCluster {
    const clusterId = `cluster-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const cluster: EntityCluster = {
      id: clusterId,
      entities: [entityId],
      canonicalEntity: entityId,
      confidence,
      type,
    };
    this.clusters.set(clusterId, cluster);
    this.entityToCluster.set(entityId, clusterId);
    return cluster;
  }

  addToCluster(entityId: string, clusterId: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    cluster.entities.push(entityId);
    this.entityToCluster.set(entityId, clusterId);
    return true;
  }

  mergeClusters(clusterId1: string, clusterId2: string): boolean {
    const c1 = this.clusters.get(clusterId1);
    const c2 = this.clusters.get(clusterId2);
    if (!c1 || !c2 || clusterId1 === clusterId2) return false;

    c1.entities = [...new Set([...c1.entities, ...c2.entities])];
    c1.confidence = Math.max(c1.confidence, c2.confidence);

    for (const entityId of c2.entities) {
      this.entityToCluster.set(entityId, clusterId1);
    }

    this.clusters.delete(clusterId2);
    return true;
  }

  getCluster(entityId: string): EntityCluster | undefined {
    const clusterId = this.entityToCluster.get(entityId);
    if (!clusterId) return undefined;
    return this.clusters.get(clusterId);
  }

  getClusterById(clusterId: string): EntityCluster | undefined {
    return this.clusters.get(clusterId);
  }

  getAllClusters(): EntityCluster[] {
    return [...this.clusters.values()];
  }

  getClusterCount(): number {
    return this.clusters.size;
  }

  getLargestClusters(limit: number = 10): EntityCluster[] {
    return [...this.clusters.values()]
      .sort((a, b) => b.entities.length - a.entities.length)
      .slice(0, limit);
  }

  getStatistics(): {
    totalClusters: number;
    totalEntities: number;
    averageClusterSize: number;
    largestClusterSize: number;
    byType: Record<string, number>;
  } {
    const byType: Record<string, number> = {};
    let totalEntities = 0;
    let largestSize = 0;

    for (const cluster of this.clusters.values()) {
      byType[cluster.type] = (byType[cluster.type] || 0) + 1;
      totalEntities += cluster.entities.length;
      largestSize = Math.max(largestSize, cluster.entities.length);
    }

    const count = this.clusters.size;
    return {
      totalClusters: count,
      totalEntities,
      averageClusterSize: count > 0 ? totalEntities / count : 0,
      largestClusterSize: largestSize,
      byType,
    };
  }
}

// ─── RELATIONSHIP TYPE LABELS ──────────────────────────────────

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  works_at: "Works at",
  ceo_of: "CEO of",
  chairman_of: "Chairman of",
  board_member_of: "Board member of",
  advisor_to: "Advisor to",
  investor_in: "Investor in",
  acquired_by: "Acquired by",
  subsidiary_of: "Subsidiary of",
  partner_of: "Partner of",
  competitor_of: "Competitor of",
  supplier_of: "Supplier of",
  customer_of: "Customer of",
  regulator_of: "Regulator of",
  mentioned_with: "Mentioned with",
  quoted_about: "Quoted about",
  replaced_by: "Replaced by",
  reports_to: "Reports to",
  associated_with: "Associated with",
  family_of: "Family of",
  educated_at: "Educated at",
};

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  works_at: "#059669",
  ceo_of: "#059669",
  chairman_of: "#059669",
  board_member_of: "#059669",
  advisor_to: "#0369A1",
  investor_in: "#D97706",
  acquired_by: "#7C3AED",
  subsidiary_of: "#7C3AED",
  partner_of: "#0369A1",
  competitor_of: "#DC2626",
  supplier_of: "#856914",
  customer_of: "#856914",
  regulator_of: "#DC2626",
  mentioned_with: "#737373",
  quoted_about: "#737373",
  replaced_by: "#D97706",
  reports_to: "#059669",
  associated_with: "#737373",
  family_of: "#BE185D",
  educated_at: "#0369A1",
};

export const RELATIONSHIP_DIRECTIONS: Record<RelationshipType, boolean> = {
  works_at: false,
  ceo_of: false,
  chairman_of: false,
  board_member_of: false,
  advisor_to: false,
  investor_in: false,
  acquired_by: false,
  subsidiary_of: false,
  partner_of: true,
  competitor_of: true,
  supplier_of: false,
  customer_of: false,
  regulator_of: false,
  mentioned_with: true,
  quoted_about: false,
  replaced_by: false,
  reports_to: false,
  associated_with: true,
  family_of: true,
  educated_at: false,
};

export function getRelationshipLabel(type: RelationshipType): string {
  return RELATIONSHIP_LABELS[type] || type;
}

export function getRelationshipColor(type: RelationshipType): string {
  return RELATIONSHIP_COLORS[type] || "#737373";
}

export function isBidirectional(type: RelationshipType): boolean {
  return RELATIONSHIP_DIRECTIONS[type] || false;
}

// ─── FACTORY FUNCTIONS ─────────────────────────────────────────

export function createEntityResolver(): EntityResolver {
  return new EntityResolver();
}

export function createRelationshipExtractor(): RelationshipExtractor {
  return new RelationshipExtractor();
}

export function createKnowledgeGraphBuilder(): KnowledgeGraphBuilder {
  return new KnowledgeGraphBuilder();
}

export function createEntityClusterer(): EntityClusterer {
  return new EntityClusterer();
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function formatEntity(entity: ResolvedEntity): string {
  const lines: string[] = [];
  lines.push(`${entity.canonicalName} (${entity.type})`);
  lines.push(`  Confidence: ${(entity.confidence * 100).toFixed(0)}%`);
  lines.push(`  Mentions: ${entity.mentions}`);
  lines.push(`  Aliases: ${entity.aliases.join(", ") || "None"}`);
  lines.push(`  Sources: ${entity.sources.join(", ") || "None"}`);
  if (entity.relationships.length > 0) {
    lines.push(`  Relationships: ${entity.relationships.length}`);
  }
  return lines.join("\n");
}

export function formatRelationship(rel: EntityRelationship): string {
  return `${rel.sourceEntityId} → ${getRelationshipLabel(rel.type)} → ${rel.targetEntityId} (strength: ${rel.strength}, confidence: ${(rel.confidence * 100).toFixed(0)}%)`;
}

export function formatKnowledgeGraph(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  lines.push("Knowledge Graph");
  lines.push("=".repeat(40));
  lines.push(`Nodes: ${graph.metadata.nodeCount}`);
  lines.push(`Edges: ${graph.metadata.edgeCount}`);
  lines.push(`Density: ${(graph.metadata.density * 100).toFixed(1)}%`);
  lines.push(`Average degree: ${graph.metadata.averageDegree.toFixed(1)}`);
  lines.push(`Connected components: ${graph.metadata.connectedComponents}`);
  return lines.join("\n");
}

export function formatCluster(cluster: EntityCluster): string {
  return `Cluster ${cluster.id} (${cluster.type}): ${cluster.entities.length} entities, canonical: ${cluster.canonicalEntity}, confidence: ${(cluster.confidence * 100).toFixed(0)}%`;
}

export function formatEntityMatchResult(result: EntityMatchResult): string {
  const lines: string[] = [];
  lines.push(`Search: "${result.query}"`);
  lines.push(`Matches: ${result.matches.length}`);
  for (const match of result.matches) {
    lines.push(`  [${match.matchType}] ${match.entityName} (score: ${(match.score * 100).toFixed(0)}%)`);
  }
  return lines.join("\n");
}

export function getEntityInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getEntityTypeColor(type: ResolvedEntity["type"]): string {
  const colors: Record<string, string> = {
    person: "#059669",
    organization: "#0369A1",
    location: "#D97706",
    ticker: "#7C3AED",
    product: "#BE185D",
    event: "#856914",
    topic: "#737373",
  };
  return colors[type] || "#737373";
}

export function getEntityTypeIcon(type: ResolvedEntity["type"]): string {
  const icons: Record<string, string> = {
    person: "👤",
    organization: "🏢",
    location: "📍",
    ticker: "📊",
    product: "📦",
    event: "📅",
    topic: "🏷️",
  };
  return icons[type] || "❓";
}

export function getRelationshipIcon(type: RelationshipType): string {
  const icons: Record<string, string> = {
    works_at: "💼",
    ceo_of: "👑",
    chairman_of: "🪑",
    board_member_of: "🏛️",
    advisor_to: "🧠",
    investor_in: "💰",
    acquired_by: "🤝",
    subsidiary_of: "🏢",
    partner_of: "🤝",
    competitor_of: "⚔️",
    supplier_of: "📦",
    customer_of: "🛒",
    regulator_of: "⚖️",
    mentioned_with: "📰",
    quoted_about: "💬",
    replaced_by: "🔄",
    reports_to: "📊",
    associated_with: "🔗",
    family_of: "👨‍👩‍👧",
    educated_at: "🎓",
  };
  return icons[type] || "🔗";
}

export function getClusterColor(type: string): string {
  const colors: Record<string, string> = {
    person: "#059669",
    organization: "#0369A1",
    location: "#D97706",
    ticker: "#7C3AED",
    product: "#BE185D",
    event: "#856914",
    topic: "#737373",
  };
  return colors[type] || "#737373";
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.95) return "Very High";
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.70) return "Medium";
  if (confidence >= 0.50) return "Low";
  return "Very Low";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.85) return "#059669";
  if (confidence >= 0.70) return "#D97706";
  return "#DC2626";
}

export function getMentionCountLabel(mentions: number): string {
  if (mentions === 0) return "No mentions";
  if (mentions === 1) return "1 mention";
  return `${mentions} mentions`;
}

export function getMentionCountColor(mentions: number): string {
  if (mentions >= 50) return "#059669";
  if (mentions >= 10) return "#0369A1";
  if (mentions >= 3) return "#D97706";
  return "#737373";
}

export function getStrengthLabel(strength: number): string {
  if (strength >= 0.8) return "Very Strong";
  if (strength >= 0.6) return "Strong";
  if (strength >= 0.4) return "Moderate";
  if (strength >= 0.2) return "Weak";
  return "Very Weak";
}

export function getStrengthColor(strength: number): string {
  if (strength >= 0.6) return "#059669";
  if (strength >= 0.4) return "#D97706";
  return "#DC2626";
}

export function getDensityLabel(density: number): string {
  if (density >= 0.5) return "Dense";
  if (density >= 0.2) return "Moderate";
  if (density >= 0.05) return "Sparse";
  return "Very Sparse";
}

export function getDegreeLabel(degree: number): string {
  if (degree >= 20) return "Hub";
  if (degree >= 10) return "Connected";
  if (degree >= 3) return "Active";
  if (degree >= 1) return "Linked";
  return "Isolated";
}

export function getComponentLabel(count: number): string {
  if (count === 1) return "Fully Connected";
  if (count <= 3) return "Mostly Connected";
  if (count <= 10) return "Fragmented";
  return "Highly Fragmented";
}

export function sortEntitiesByMentions(entities: ResolvedEntity[]): ResolvedEntity[] {
  return [...entities].sort((a, b) => b.mentions - a.mentions);
}

export function sortEntitiesByConfidence(entities: ResolvedEntity[]): ResolvedEntity[] {
  return [...entities].sort((a, b) => b.confidence - a.confidence);
}

export function sortRelationshipsByStrength(rels: EntityRelationship[]): EntityRelationship[] {
  return [...rels].sort((a, b) => b.strength - a.strength);
}

export function sortRelationshipsByConfidence(rels: EntityRelationship[]): EntityRelationship[] {
  return [...rels].sort((a, b) => b.confidence - a.confidence);
}

export function filterEntitiesByType(entities: ResolvedEntity[], type: ResolvedEntity["type"]): ResolvedEntity[] {
  return entities.filter(e => e.type === type);
}

export function filterEntitiesByMinMentions(entities: ResolvedEntity[], min: number): ResolvedEntity[] {
  return entities.filter(e => e.mentions >= min);
}

export function filterEntitiesByMinConfidence(entities: ResolvedEntity[], min: number): ResolvedEntity[] {
  return entities.filter(e => e.confidence >= min);
}

export function filterRelationshipsByType(rels: EntityRelationship[], type: RelationshipType): EntityRelationship[] {
  return rels.filter(r => r.type === type);
}

export function filterRelationshipsByMinStrength(rels: EntityRelationship[], min: number): EntityRelationship[] {
  return rels.filter(r => r.strength >= min);
}

export function getEntitySummary(entity: ResolvedEntity): string {
  return `${entity.canonicalName} (${entity.type}) — ${entity.mentions} mentions, ${(entity.confidence * 100).toFixed(0)}% confidence, ${entity.relationships.length} relationships`;
}

export function getRelationshipSummary(rel: EntityRelationship): string {
  return `${getRelationshipLabel(rel.type)} — strength: ${rel.strength.toFixed(2)}, confidence: ${(rel.confidence * 100).toFixed(0)}%`;
}

export function getGraphSummary(graph: KnowledgeGraph): string {
  return `${graph.metadata.nodeCount} nodes, ${graph.metadata.edgeCount} edges, ${(graph.metadata.density * 100).toFixed(1)}% density, ${graph.metadata.connectedComponents} components`;
}

export function getClusterSummary(cluster: EntityCluster): string {
  return `${cluster.type} cluster: ${cluster.entities.length} entities, canonical: ${cluster.canonicalEntity}`;
}

export function getSearchSummary(result: EntityMatchResult): string {
  return `Query "${result.query}": ${result.matches.length} matches found`;
}

export function getResolverSummary(resolver: EntityResolver): string {
  const stats = resolver.getStatistics();
  return `${stats.totalEntities} entities, ${stats.totalAliases} aliases, ${stats.totalRelationships} relationships`;
}

export function getExtractorSummary(extractor: RelationshipExtractor): string {
  const stats = extractor.getStatistics();
  return `${stats.total} relationships, avg strength: ${stats.averageStrength.toFixed(2)}, avg confidence: ${(stats.averageConfidence * 100).toFixed(0)}%`;
}

export function getClustererSummary(clusterer: EntityClusterer): string {
  const stats = clusterer.getStatistics();
  return `${stats.totalClusters} clusters, ${stats.totalEntities} entities, avg size: ${stats.averageClusterSize.toFixed(1)}`;
}

export function getGraphBuilderSummary(builder: KnowledgeGraphBuilder): string {
  const stats = builder.getStats();
  return `${stats.nodeCount} nodes, ${stats.edgeCount} edges, ${(stats.density * 100).toFixed(1)}% density, ${stats.connectedComponents} components`;
}

export function calculateEntityInfluenceScore(entity: ResolvedEntity): number {
  const mentionScore = Math.min(100, entity.mentions * 2);
  const confidenceScore = entity.confidence * 100;
  const relationshipScore = Math.min(100, entity.relationships.length * 10);
  const sourceDiversityScore = Math.min(100, entity.sources.length * 20);
  return Math.round(mentionScore * 0.35 + confidenceScore * 0.20 + relationshipScore * 0.25 + sourceDiversityScore * 0.20);
}

export function getInfluenceLabel(score: number): string {
  if (score >= 80) return "Highly Influential";
  if (score >= 60) return "Influential";
  if (score >= 40) return "Moderately Influential";
  if (score >= 20) return "Low Influence";
  return "Minimal Influence";
}

export function getInfluenceColor(score: number): string {
  if (score >= 60) return "#059669";
  if (score >= 40) return "#D97706";
  return "#737373";
}

export function calculateNetworkInfluence(
  entityId: string,
  graph: KnowledgeGraphBuilder
): number {
  const degree = graph.getDegree(entityId);
  const degreeCentrality = graph.getDegreeCentrality(entityId);
  const betweenness = graph.getBetweennessCentrality(entityId);
  return Math.round((degreeCentrality * 40 + betweenness * 60) * 100);
}

export function getTopInfluentialEntities(
  resolver: EntityResolver,
  graph: KnowledgeGraphBuilder,
  limit: number = 10
): Array<{ entity: ResolvedEntity; influence: number }> {
  return [...resolver.getAllEntities()]
    .map(entity => ({
      entity,
      influence: calculateEntityInfluenceScore(entity) + calculateNetworkInfluence(entity.id, graph),
    }))
    .sort((a, b) => b.influence - a.influence)
    .slice(0, limit);
}

export function findKeyConnectors(
  graph: KnowledgeGraphBuilder,
  limit: number = 10
): Array<{ node: KnowledgeGraphNode; betweenness: number }> {
  return graph.getTopNodesByBetweenness(limit).map(({ node, betweenness }) => ({
    node,
    betweenness: betweenness * 100,
  }));
}

export function findBridges(graph: KnowledgeGraphBuilder): KnowledgeGraphEdge[] {
  const bridges: KnowledgeGraphEdge[] = [];
  const originalComponents = graph.getConnectedComponents().length;

  for (const [edgeId, edge] of graph.edges) {
    graph.removeEdge(edgeId);
    const newComponents = graph.getConnectedComponents().length;
    if (newComponents > originalComponents) {
      bridges.push(edge);
    }
    graph.addEdge(edgeId, edge.source, edge.target, edge.type, edge.weight, edge.properties);
  }

  return bridges;
}

export function findIsolatedNodes(graph: KnowledgeGraphBuilder): KnowledgeGraphNode[] {
  return [...graph.nodes.values()].filter(node => graph.getDegree(node.id) === 0);
}

export function findHubs(graph: KnowledgeGraphBuilder, threshold: number = 10): KnowledgeGraphNode[] {
  return [...graph.nodes.values()].filter(node => graph.getDegree(node.id) >= threshold);
}

export function getNodeNeighbors(graph: KnowledgeGraphBuilder, nodeId: string, depth: number = 1): Set<string> {
  const result = new Set<string>();
  const visited = new Set<string>([nodeId]);
  let current = [nodeId];

  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of current) {
      const neighbors = graph.getNeighbors(id);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          result.add(neighbor.id);
          next.push(neighbor.id);
        }
      }
    }
    current = next;
  }

  return result;
}

export function getEgoNetwork(graph: KnowledgeGraphBuilder, nodeId: string, depth: number = 1): KnowledgeGraph {
  const egoNodeIds = new Set<string>([nodeId, ...getNodeNeighbors(graph, nodeId, depth)]);
  const subgraph = graph.subgraph([...egoNodeIds]);
  return subgraph.build();
}

export function findShortestPaths(
  graph: KnowledgeGraphBuilder,
  sourceId: string,
  maxDepth: number = 3
): Map<string, string[]> {
  const paths = new Map<string, string[]>();
  paths.set(sourceId, [sourceId]);

  const queue: Array<{ id: string; path: string[] }> = [{ id: sourceId, path: [sourceId] }];
  const visited = new Set<string>([sourceId]);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    if (path.length > maxDepth) continue;

    const neighbors = graph.getNeighbors(id);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        const newPath = [...path, neighbor.id];
        paths.set(neighbor.id, newPath);
        queue.push({ id: neighbor.id, path: newPath });
      }
    }
  }

  return paths;
}

export function calculateGraphDiameter(graph: KnowledgeGraphBuilder): number {
  const nodeIds = [...graph.nodes.keys()];
  let maxDistance = 0;

  for (const source of nodeIds) {
    const paths = findShortestPaths(graph, source, nodeIds.length);
    for (const path of paths.values()) {
      maxDistance = Math.max(maxDistance, path.length - 1);
    }
  }

  return maxDistance;
}

export function calculateGraphRadius(graph: KnowledgeGraphBuilder, nodeId: string): number {
  const paths = findShortestPaths(graph, nodeId, graph.nodes.size);
  let maxDistance = 0;
  for (const path of paths.values()) {
    maxDistance = Math.max(maxDistance, path.length - 1);
  }
  return maxDistance;
}

export function findGraphCenter(graph: KnowledgeGraphBuilder): KnowledgeGraphNode | undefined {
  let minRadius = Infinity;
  let centerNode: KnowledgeGraphNode | undefined;

  for (const node of graph.nodes.values()) {
    const radius = calculateGraphRadius(graph, node.id);
    if (radius < minRadius) {
      minRadius = radius;
      centerNode = node;
    }
  }

  return centerNode;
}

export function getGraphStatistics(graph: KnowledgeGraphBuilder): {
  nodes: number;
  edges: number;
  density: number;
  averageDegree: number;
  maxDegree: number;
  minDegree: number;
  components: number;
  diameter: number;
  bridges: number;
  isolatedNodes: number;
  hubs: number;
} {
  const stats = graph.getStats();
  const diameter = calculateGraphDiameter(graph);
  const bridges = findBridges(graph).length;
  const isolated = findIsolatedNodes(graph).length;
  const hubs = findHubs(graph).length;

  return {
    nodes: stats.nodeCount,
    edges: stats.edgeCount,
    density: stats.density,
    averageDegree: stats.averageDegree,
    maxDegree: stats.maxDegree,
    minDegree: stats.minDegree,
    components: stats.connectedComponents,
    diameter,
    bridges,
    isolatedNodes: isolated,
    hubs,
  };
}

export function formatGraphStatistics(stats: ReturnType<typeof getGraphStatistics>): string {
  const lines: string[] = [];
  lines.push("Graph Statistics");
  lines.push("=".repeat(40));
  lines.push(`Nodes: ${stats.nodes}`);
  lines.push(`Edges: ${stats.edges}`);
  lines.push(`Density: ${(stats.density * 100).toFixed(1)}%`);
  lines.push(`Average degree: ${stats.averageDegree.toFixed(1)}`);
  lines.push(`Max degree: ${stats.maxDegree}`);
  lines.push(`Min degree: ${stats.minDegree}`);
  lines.push(`Connected components: ${stats.components}`);
  lines.push(`Diameter: ${stats.diameter}`);
  lines.push(`Bridges: ${stats.bridges}`);
  lines.push(`Isolated nodes: ${stats.isolatedNodes}`);
  lines.push(`Hubs (degree ≥ 10): ${stats.hubs}`);
  return lines.join("\n");
}

export function exportGraphToJSON(graph: KnowledgeGraph): string {
  return JSON.stringify(graph, null, 2);
}

export function exportGraphToCSV(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  lines.push("type,id,label,source,target,weight");
  for (const node of graph.nodes) {
    lines.push(`node,${node.id},${node.label},,,`);
  }
  for (const edge of graph.edges) {
    lines.push(`edge,${edge.id},,${edge.source},${edge.target},${edge.weight}`);
  }
  return lines.join("\n");
}

export function exportGraphToGephi(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  lines.push("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  lines.push("<gexf xmlns=\"http://www.gexf.net/1.3\" version=\"1.3\">");
  lines.push("  <graph mode=\"static\" defaultedgetype=\"directed\">");
  lines.push("    <nodes>");
  for (const node of graph.nodes) {
    lines.push(`      <node id="${node.id}" label="${node.label}" />`);
  }
  lines.push("    </nodes>");
  lines.push("    <edges>");
  for (const edge of graph.edges) {
    lines.push(`      <edge id="${edge.id}" source="${edge.source}" target="${edge.target}" weight="${edge.weight}" />`);
  }
  lines.push("    </edges>");
  lines.push("  </graph>");
  lines.push("</gexf>");
  return lines.join("\n");
}

export function exportGraphToDot(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  lines.push("digraph knowledge_graph {");
  for (const node of graph.nodes) {
    lines.push(`  "${node.id}" [label="${node.label}"];`);
  }
  for (const edge of graph.edges) {
    lines.push(`  "${edge.source}" -> "${edge.target}" [label="${edge.type}", weight=${edge.weight}];`);
  }
  lines.push("}");
  return lines.join("\n");
}

export function exportGraphToCypher(graph: KnowledgeGraph): string {
  const lines: string[] = [];
  for (const node of graph.nodes) {
    lines.push(`CREATE (n:${node.type} {id: '${node.id}', label: '${node.label}'})`);
  }
  for (const edge of graph.edges) {
    lines.push(`MATCH (a {id: '${edge.source}'}), (b {id: '${edge.target}'}) CREATE (a)-[:${edge.type.toUpperCase()} {weight: ${edge.weight}}]->(b)`);
  }
  return lines.join(";\n");
}

export function getGraphFormats(): string[] {
  return ["json", "csv", "gephi", "dot", "cypher"];
}

export function exportGraph(graph: KnowledgeGraph, format: string): string {
  switch (format.toLowerCase()) {
    case "json": return exportGraphToJSON(graph);
    case "csv": return exportGraphToCSV(graph);
    case "gephi": return exportGraphToGephi(graph);
    case "dot": return exportGraphToDot(graph);
    case "cypher": return exportGraphToCypher(graph);
    default: return exportGraphToJSON(graph);
  }
}

export function validateGraph(graph: KnowledgeGraph): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const nodeIds = new Set(graph.nodes.map(n => n.id));

  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge ${edge.id} references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge ${edge.id} references non-existent target node: ${edge.target}`);
    }
    if (edge.source === edge.target) {
      errors.push(`Edge ${edge.id} is a self-loop`);
    }
    if (edge.weight < 0) {
      errors.push(`Edge ${edge.id} has negative weight: ${edge.weight}`);
    }
  }

  const edgeIds = new Set<string>();
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      errors.push(`Duplicate edge ID: ${edge.id}`);
    }
    edgeIds.add(edge.id);
  }

  const nodeIdsCheck = new Set<string>();
  for (const node of graph.nodes) {
    if (nodeIdsCheck.has(node.id)) {
      errors.push(`Duplicate node ID: ${node.id}`);
    }
    nodeIdsCheck.add(node.id);
  }

  return { valid: errors.length === 0, errors };
}

export function sanitizeGraph(graph: KnowledgeGraph): KnowledgeGraph {
  const validNodes = new Set(graph.nodes.map(n => n.id));
  const sanitizedEdges = graph.edges.filter(
    e => validNodes.has(e.source) && validNodes.has(e.target) && e.source !== e.target && e.weight >= 0
  );
  const nodeCount = graph.nodes.length;
  const edgeCount = sanitizedEdges.length;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

  return {
    nodes: graph.nodes,
    edges: sanitizedEdges,
    metadata: {
      nodeCount,
      edgeCount,
      density,
      averageDegree: nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0,
      connectedComponents: 0,
    },
  };
}

export function mergeGraphs(graph1: KnowledgeGraph, graph2: KnowledgeGraph): KnowledgeGraph {
  const nodeMap = new Map<string, KnowledgeGraphNode>();
  for (const node of graph1.nodes) nodeMap.set(node.id, node);
  for (const node of graph2.nodes) nodeMap.set(node.id, node);

  const edgeMap = new Map<string, KnowledgeGraphEdge>();
  for (const edge of graph1.edges) edgeMap.set(edge.id, edge);
  for (const edge of graph2.edges) edgeMap.set(edge.id, edge);

  const nodes = [...nodeMap.values()];
  const edges = [...edgeMap.values()];
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const maxEdges = (nodeCount * (nodeCount - 1)) / 2;

  return {
    nodes,
    edges,
    metadata: {
      nodeCount,
      edgeCount,
      density: maxEdges > 0 ? edgeCount / maxEdges : 0,
      averageDegree: nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0,
      connectedComponents: 0,
    },
  };
}

export function diffGraphs(graph1: KnowledgeGraph, graph2: KnowledgeGraph): {
  addedNodes: KnowledgeGraphNode[];
  removedNodes: KnowledgeGraphNode[];
  addedEdges: KnowledgeGraphEdge[];
  removedEdges: KnowledgeGraphEdge[];
} {
  const nodes1 = new Map(graph1.nodes.map(n => [n.id, n]));
  const nodes2 = new Map(graph2.nodes.map(n => [n.id, n]));
  const edges1 = new Map(graph1.edges.map(e => [e.id, e]));
  const edges2 = new Map(graph2.edges.map(e => [e.id, e]));

  const addedNodes: KnowledgeGraphNode[] = [];
  const removedNodes: KnowledgeGraphNode[] = [];
  const addedEdges: KnowledgeGraphEdge[] = [];
  const removedEdges: KnowledgeGraphEdge[] = [];

  for (const [id, node] of nodes2) {
    if (!nodes1.has(id)) addedNodes.push(node);
  }
  for (const [id, node] of nodes1) {
    if (!nodes2.has(id)) removedNodes.push(node);
  }
  for (const [id, edge] of edges2) {
    if (!edges1.has(id)) addedEdges.push(edge);
  }
  for (const [id, edge] of edges1) {
    if (!edges2.has(id)) removedEdges.push(edge);
  }

  return { addedNodes, removedNodes, addedEdges, removedEdges };
}

export function calculateGraphSimilarity(graph1: KnowledgeGraph, graph2: KnowledgeGraph): number {
  const nodes1 = new Set(graph1.nodes.map(n => n.id));
  const nodes2 = new Set(graph2.nodes.map(n => n.id));
  const intersection = [...nodes1].filter(n => nodes2.has(n)).length;
  const union = new Set([...nodes1, ...nodes2]).size;
  return union > 0 ? intersection / union : 0;
}

export function getGraphSnapshot(graph: KnowledgeGraph): string {
  return JSON.stringify({
    nodeCount: graph.metadata.nodeCount,
    edgeCount: graph.metadata.edgeCount,
    density: graph.metadata.density,
    timestamp: new Date().toISOString(),
  });
}

export function compareGraphSnapshots(snapshot1: string, snapshot2: string): {
  nodeGrowth: number;
  edgeGrowth: number;
  densityChange: number;
} {
  try {
    const s1 = JSON.parse(snapshot1);
    const s2 = JSON.parse(snapshot2);
    return {
      nodeGrowth: s2.nodeCount - s1.nodeCount,
      edgeGrowth: s2.edgeCount - s1.edgeCount,
      densityChange: s2.density - s1.density,
    };
  } catch {
    return { nodeGrowth: 0, edgeGrowth: 0, densityChange: 0 };
  }
}

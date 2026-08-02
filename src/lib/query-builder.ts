// ═══════════════════════════════════════════════════════════════
//  QUERY BUILDER & SEARCH ENGINE — Advanced filtering and search
//
//  Provides a fluent API for building complex database queries,
//  search filters, and aggregations across all Harch Atelier
//  data sources.
// ═══════════════════════════════════════════════════════════════

import type {
  SentimentLabel,
  RiskLevel,
  ArticleSourceType,
  Language,
  AlertType,
  AlertSeverity,
  EntityType,
} from "@/lib/types/platform";

// ─── QUERY TYPES ───────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface FilterCondition<T = unknown> {
  field: string;
  operator: FilterOperator;
  value: T;
}

export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "notIn"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "isNull"
  | "isNotNull"
  | "between"
  | "search"
  | "regex";

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  cursor?: string;
}

export interface QueryOptions {
  filters?: FilterCondition[];
  sort?: SortCondition[];
  pagination?: PaginationOptions;
  fields?: string[];
  include?: string[];
  aggregations?: AggregationSpec[];
  groupBy?: string[];
  having?: FilterCondition[];
}

export interface AggregationSpec {
  type: "count" | "sum" | "avg" | "min" | "max" | "distinct";
  field: string;
  alias?: string;
}

export interface QueryResult<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  aggregations?: Record<string, number>;
}

// ─── ARTICLE QUERY BUILDER ─────────────────────────────────────

export class ArticleQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 20;
  private fields: string[] = [];
  private includes: string[] = [];

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereCompanyId(companyId: string): this {
    return this.where("companyId", "eq", companyId);
  }

  whereCompanySlug(slug: string): this {
    return this.where("company.slug", "eq", slug);
  }

  whereSentiment(label: SentimentLabel): this {
    return this.where("sentimentLabel", "eq", label);
  }

  whereSentimentScore(min: number, max: number): this {
    return this.where("sentimentScore", "between", [min, max]);
  }

  whereSource(source: string): this {
    return this.where("source", "eq", source);
  }

  whereSourceType(type: ArticleSourceType): this {
    return this.where("sourceType", "eq", type);
  }

  whereLanguage(lang: Language): this {
    return this.where("language", "eq", lang);
  }

  wherePublishedAfter(date: Date): this {
    return this.where("publishedAt", "gte", date);
  }

  wherePublishedBefore(date: Date): this {
    return this.where("publishedAt", "lte", date);
  }

  wherePublishedBetween(start: Date, end: Date): this {
    return this.where("publishedAt", "between", [start, end]);
  }

  whereRelevanceAbove(threshold: number): this {
    return this.where("relevanceScore", "gte", threshold);
  }

  whereTitleContains(text: string): this {
    return this.where("title", "contains", text);
  }

  whereContentContains(text: string): this {
    return this.where("content", "contains", text);
  }

  whereIsDemo(isDemo: boolean): this {
    return this.where("isDemo", "eq", isDemo);
  }

  whereProcessed(processed: boolean): this {
    return this.where("processed", "eq", processed);
  }

  search(text: string): this {
    return this.where("title", "search", text);
  }

  orWhere(field: string, operator: FilterOperator, value: unknown): this {
    // In a real implementation, this would create OR groups
    this.filters.push({ field, operator, value });
    return this;
  }

  sortBy(field: string, direction: SortDirection = "desc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByPublishedDate(direction: SortDirection = "desc"): this {
    return this.sortBy("publishedAt", direction);
  }

  sortBySentimentScore(direction: SortDirection = "desc"): this {
    return this.sortBy("sentimentScore", direction);
  }

  sortByRelevance(direction: SortDirection = "desc"): this {
    return this.sortBy("relevanceScore", direction);
  }

  sortBySource(direction: SortDirection = "asc"): this {
    return this.sortBy("source", direction);
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  select(fields: string[]): this {
    this.fields = fields;
    return this;
  }

  include(relations: string[]): this {
    this.includes = relations;
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
      fields: this.fields.length > 0 ? this.fields : undefined,
      include: this.includes.length > 0 ? this.includes : undefined,
    };
  }

  toPrismaWhere(): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    for (const filter of this.filters) {
      const { field, operator, value } = filter;

      switch (operator) {
        case "eq":
          where[field] = value;
          break;
        case "neq":
          where[field] = { not: value };
          break;
        case "gt":
          where[field] = { gt: value };
          break;
        case "gte":
          where[field] = { gte: value };
          break;
        case "lt":
          where[field] = { lt: value };
          break;
        case "lte":
          where[field] = { lte: value };
          break;
        case "in":
          where[field] = { in: value };
          break;
        case "notIn":
          where[field] = { notIn: value };
          break;
        case "contains":
          where[field] = { contains: value, mode: "insensitive" };
          break;
        case "startsWith":
          where[field] = { startsWith: value, mode: "insensitive" };
          break;
        case "endsWith":
          where[field] = { endsWith: value, mode: "insensitive" };
          break;
        case "isNull":
          where[field] = null;
          break;
        case "isNotNull":
          where[field] = { not: null };
          break;
        case "between":
          if (Array.isArray(value) && value.length === 2) {
            where[field] = { gte: value[0], lte: value[1] };
          }
          break;
        case "search":
          where.OR = [
            { title: { contains: value, mode: "insensitive" } },
            { content: { contains: value, mode: "insensitive" } },
            { summary: { contains: value, mode: "insensitive" } },
          ];
          break;
      }
    }

    return where;
  }

  toPrismaOrderBy(): Record<string, string> | Record<string, string>[] {
    if (this.sortConditions.length === 0) {
      return { publishedAt: "desc" };
    }

    if (this.sortConditions.length === 1) {
      return { [this.sortConditions[0].field]: this.sortConditions[0].direction };
    }

    return this.sortConditions.map(s => ({ [s.field]: s.direction }));
  }

  toPrismaSelect(): Record<string, boolean> | undefined {
    if (this.fields.length === 0) return undefined;
    const select: Record<string, boolean> = {};
    for (const field of this.fields) {
      select[field] = true;
    }
    return select;
  }

  toPrismaInclude(): Record<string, boolean> | undefined {
    if (this.includes.length === 0) return undefined;
    const include: Record<string, boolean> = {};
    for (const rel of this.includes) {
      include[rel] = true;
    }
    return include;
  }

  reset(): this {
    this.filters = [];
    this.sortConditions = [];
    this.page = 1;
    this.limit = 20;
    this.fields = [];
    this.includes = [];
    return this;
  }

  clone(): ArticleQueryBuilder {
    const clone = new ArticleQueryBuilder();
    clone.filters = [...this.filters];
    clone.sortConditions = [...this.sortConditions];
    clone.page = this.page;
    clone.limit = this.limit;
    clone.fields = [...this.fields];
    clone.includes = [...this.includes];
    return clone;
  }
}

// ─── ENTITY QUERY BUILDER ──────────────────────────────────────

export class EntityQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 20;

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereEntityType(type: EntityType): this {
    return this.where("entityType", "eq", type);
  }

  whereName(name: string): this {
    return this.where("name", "eq", name);
  }

  whereNameContains(text: string): this {
    return this.where("name", "contains", text);
  }

  whereTag(tag: string): this {
    return this.where("tags", "contains", tag);
  }

  whereConfidenceAbove(threshold: number): this {
    return this.where("confidence", "gte", threshold);
  }

  whereCompanyId(companyId: string): this {
    return this.where("mentions.companyId", "eq", companyId);
  }

  whereMentionCountAbove(count: number): this {
    return this.where("mentionCount", "gte", count);
  }

  sortBy(field: string, direction: SortDirection = "desc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByMentionCount(direction: SortDirection = "desc"): this {
    return this.sortBy("mentionCount", direction);
  }

  sortByName(direction: SortDirection = "asc"): this {
    return this.sortBy("name", direction);
  }

  sortByConfidence(direction: SortDirection = "desc"): this {
    return this.sortBy("confidence", direction);
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
    };
  }
}

// ─── ALERT QUERY BUILDER ───────────────────────────────────────

export class AlertQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 20;

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereType(type: AlertType): this {
    return this.where("type", "eq", type);
  }

  whereSeverity(severity: AlertSeverity): this {
    return this.where("severity", "eq", severity);
  }

  whereSeverityAbove(severity: AlertSeverity): this {
    const order: Record<AlertSeverity, number> = { info: 0, low: 1, medium: 2, high: 3, critical: 4 };
    const threshold = order[severity];
    const levels = (Object.entries(order) as Array<[AlertSeverity, number]>).filter(([, v]) => v >= threshold).map(([k]) => k);
    return this.where("severity", "in", levels);
  }

  whereCompanyId(companyId: string): this {
    return this.where("companyId", "eq", companyId);
  }

  whereTriggeredAfter(date: Date): this {
    return this.where("triggeredAt", "gte", date);
  }

  whereTriggeredBefore(date: Date): this {
    return this.where("triggeredAt", "lte", date);
  }

  whereTriggeredBetween(start: Date, end: Date): this {
    return this.where("triggeredAt", "between", [start, end]);
  }

  whereAcknowledged(acknowledged: boolean): this {
    if (acknowledged) {
      return this.where("acknowledgedAt", "isNotNull", null);
    } else {
      return this.where("acknowledgedAt", "isNull", null);
    }
  }

  whereTenantId(tenantId: string): this {
    return this.where("tenantId", "eq", tenantId);
  }

  sortBy(field: string, direction: SortDirection = "desc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByTriggeredAt(direction: SortDirection = "desc"): this {
    return this.sortBy("triggeredAt", direction);
  }

  sortBySeverity(direction: SortDirection = "desc"): this {
    return this.sortBy("severity", direction);
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
    };
  }
}

// ─── RISK QUERY BUILDER ────────────────────────────────────────

export class RiskQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 20;

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereCompanyId(companyId: string): this {
    return this.where("companyId", "eq", companyId);
  }

  whereCategory(category: string): this {
    return this.where("category", "eq", category);
  }

  whereLevel(level: RiskLevel): this {
    return this.where("riskLevel", "eq", level);
  }

  whereLevelAbove(level: RiskLevel): this {
    const order: Record<string, number> = { low: 0, moderate: 1, elevated: 2, high: 3, critical: 4 };
    const threshold = order[level];
    const levels = Object.entries(order).filter(([, v]) => v >= threshold).map(([k]) => k);
    return this.where("riskLevel", "in", levels);
  }

  whereScoreAbove(score: number): this {
    return this.where("overallRisk", "gte", score);
  }

  whereTrajectory(trajectory: string): this {
    return this.where("trajectory", "eq", trajectory);
  }

  whereAssessedAfter(date: Date): this {
    return this.where("assessedAt", "gte", date);
  }

  whereAssessedBefore(date: Date): this {
    return this.where("assessedAt", "lte", date);
  }

  sortBy(field: string, direction: SortDirection = "desc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByScore(direction: SortDirection = "desc"): this {
    return this.sortBy("overallRisk", direction);
  }

  sortByAssessedAt(direction: SortDirection = "desc"): this {
    return this.sortBy("assessedAt", direction);
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(100, Math.max(1, limit));
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
    };
  }
}

// ─── SENTIMENT QUERY BUILDER ───────────────────────────────────

export class SentimentQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 52;
  private groupByField: string | undefined;

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereCompanyId(companyId: string): this {
    return this.where("companyId", "eq", companyId);
  }

  whereLanguage(lang: Language): this {
    return this.where("language", "eq", lang);
  }

  whereCalculatedAfter(date: Date): this {
    return this.where("calculatedAt", "gte", date);
  }

  whereCalculatedBefore(date: Date): this {
    return this.where("calculatedAt", "lte", date);
  }

  whereCalculatedBetween(start: Date, end: Date): this {
    return this.where("calculatedAt", "between", [start, end]);
  }

  whereScoreAbove(score: number): this {
    return this.where("score", "gte", score);
  }

  whereScoreBelow(score: number): this {
    return this.where("score", "lte", score);
  }

  whereIsDemo(isDemo: boolean): this {
    return this.where("isDemo", "eq", isDemo);
  }

  sortBy(field: string, direction: SortDirection = "desc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByCalculatedAt(direction: SortDirection = "asc"): this {
    return this.sortBy("calculatedAt", direction);
  }

  sortByScore(direction: SortDirection = "desc"): this {
    return this.sortBy("score", direction);
  }

  groupBy(field: string): this {
    this.groupByField = field;
    return this;
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(500, Math.max(1, limit));
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
      groupBy: this.groupByField ? [this.groupByField] : undefined,
    };
  }
}

// ─── ASSET PRICE QUERY BUILDER ─────────────────────────────────

export class AssetPriceQueryBuilder {
  private filters: FilterCondition[] = [];
  private sortConditions: SortCondition[] = [];
  private page: number = 1;
  private limit: number = 365;

  where(field: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ field, operator, value });
    return this;
  }

  whereAssetId(assetId: string): this {
    return this.where("assetId", "eq", assetId);
  }

  whereTicker(ticker: string): this {
    return this.where("asset.ticker", "eq", ticker);
  }

  whereTradedAfter(date: Date): this {
    return this.where("tradedAt", "gte", date);
  }

  whereTradedBefore(date: Date): this {
    return this.where("tradedAt", "lte", date);
  }

  whereTradedBetween(start: Date, end: Date): this {
    return this.where("tradedAt", "between", [start, end]);
  }

  wherePriceAbove(price: number): this {
    return this.where("price", "gt", price);
  }

  wherePriceBelow(price: number): this {
    return this.where("price", "lt", price);
  }

  whereVolumeAbove(volume: number): this {
    return this.where("volume", "gt", volume);
  }

  sortBy(field: string, direction: SortDirection = "asc"): this {
    this.sortConditions.push({ field, direction });
    return this;
  }

  sortByTradedAt(direction: SortDirection = "asc"): this {
    return this.sortBy("tradedAt", direction);
  }

  sortByPrice(direction: SortDirection = "desc"): this {
    return this.sortBy("price", direction);
  }

  paginate(page: number, limit: number): this {
    this.page = Math.max(1, page);
    this.limit = Math.min(1000, Math.max(1, limit));
    return this;
  }

  build(): QueryOptions {
    return {
      filters: this.filters,
      sort: this.sortConditions,
      pagination: { page: this.page, limit: this.limit },
    };
  }
}

// ─── AGGREGATION BUILDER ───────────────────────────────────────

export class AggregationBuilder {
  private aggregations: AggregationSpec[] = [];
  private groupByFields: string[] = [];
  private havingConditions: FilterCondition[] = [];

  count(field: string = "*", alias?: string): this {
    this.aggregations.push({ type: "count", field, alias: alias || `count_${field}` });
    return this;
  }

  sum(field: string, alias?: string): this {
    this.aggregations.push({ type: "sum", field, alias: alias || `sum_${field}` });
    return this;
  }

  avg(field: string, alias?: string): this {
    this.aggregations.push({ type: "avg", field, alias: alias || `avg_${field}` });
    return this;
  }

  min(field: string, alias?: string): this {
    this.aggregations.push({ type: "min", field, alias: alias || `min_${field}` });
    return this;
  }

  max(field: string, alias?: string): this {
    this.aggregations.push({ type: "max", field, alias: alias || `max_${field}` });
    return this;
  }

  distinct(field: string, alias?: string): this {
    this.aggregations.push({ type: "distinct", field, alias: alias || `distinct_${field}` });
    return this;
  }

  groupBy(field: string): this {
    this.groupByFields.push(field);
    return this;
  }

  having(field: string, operator: FilterOperator, value: unknown): this {
    this.havingConditions.push({ field, operator, value });
    return this;
  }

  build(): { aggregations: AggregationSpec[]; groupBy: string[]; having: FilterCondition[] } {
    return {
      aggregations: this.aggregations,
      groupBy: this.groupByFields,
      having: this.havingConditions,
    };
  }

  reset(): this {
    this.aggregations = [];
    this.groupByFields = [];
    this.havingConditions = [];
    return this;
  }
}

// ─── SEARCH ENGINE ─────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: "article" | "entity" | "company" | "alert" | "report" | "dossier";
  title: string;
  subtitle?: string;
  snippet: string;
  url?: string;
  score: number;
  highlights?: Array<{ field: string; snippet: string }>;
  date?: string;
  sentiment?: SentimentLabel;
}

export interface SearchOptions {
  query: string;
  filters?: {
    companyId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    source?: string;
    sentiment?: SentimentLabel;
    language?: Language;
    sourceType?: ArticleSourceType;
  };
  options?: {
    limit?: number;
    offset?: number;
    minScore?: number;
    fuzzy?: boolean;
    hybrid?: boolean;
  };
}

export class SearchEngine {
  private index: Map<string, { title: string; content: string; type?: string; date?: string; id: string }[]> = new Map();

  addToIndex(type: string, items: Array<{ id: string; title: string; content: string; date?: string }>): void {
    this.index.set(type, items);
  }

  search(options: SearchOptions): SearchResult[] {
    const { query, filters, options: searchOpts } = options;
    const limit = searchOpts?.limit || 20;
    const minScore = searchOpts?.minScore || 0;
    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 1);

    for (const [type, items] of this.index) {
      for (const item of items) {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const contentLower = item.content.toLowerCase();

        // Exact match in title = highest score
        if (titleLower.includes(queryLower)) {
          score += 10;
        }

        // Token matches in title
        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 3;
          if (contentLower.includes(token)) score += 1;
        }

        // Apply filters
        if (filters?.dateFrom && item.date) {
          if (new Date(item.date) < filters.dateFrom) continue;
        }
        if (filters?.dateTo && item.date) {
          if (new Date(item.date) > filters.dateTo) continue;
        }

        if (score >= minScore) {
          results.push({
            id: item.id,
            type: type as SearchResult["type"],
            title: item.title,
            snippet: this.extractSnippet(item.content, queryTokens),
            score,
            date: item.date,
            highlights: [{ field: "title", snippet: this.highlight(item.title, queryTokens) }],
          });
        }
      }
    }

    // Sort by score (descending) and take top N
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  private extractSnippet(content: string, tokens: string[], maxLen: number = 200): string {
    const lower = content.toLowerCase();
    let bestPos = 0;
    let bestScore = 0;

    for (let i = 0; i < content.length; i += 50) {
      const chunk = lower.slice(i, i + 100);
      let score = 0;
      for (const token of tokens) {
        if (chunk.includes(token)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestPos = i;
      }
    }

    const start = Math.max(0, bestPos - 20);
    const end = Math.min(content.length, start + maxLen);
    let snippet = content.slice(start, end);
    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";
    return snippet;
  }

  private highlight(text: string, tokens: string[]): string {
    let result = text;
    for (const token of tokens) {
      const regex = new RegExp(`(${token})`, "gi");
      result = result.replace(regex, "<mark>$1</mark>");
    }
    return result;
  }

  clearIndex(): void {
    this.index.clear();
  }

  getIndexSize(): number {
    let total = 0;
    for (const items of this.index.values()) {
      total += items.length;
    }
    return total;
  }
}

// ─── QUERY EXECUTOR ────────────────────────────────────────────

export class QueryExecutor {
  static async execute<T>(
    model: { findMany: (args: unknown) => Promise<T[]>; count: (args: unknown) => Promise<number> },
    options: QueryOptions
  ): Promise<QueryResult<T>> {
    const page = options.pagination?.page || 1;
    const limit = options.pagination?.limit || 20;
    const skip = (page - 1) * limit;

    const where = this.buildWhere(options.filters || []);
    const orderBy = this.buildOrderBy(options.sort);
    const select = options.fields ? this.buildSelect(options.fields) : undefined;
    const include = options.include ? this.buildInclude(options.include) : undefined;

    const [data, total] = await Promise.all([
      model.findMany({ where, orderBy, skip, take: limit, select, include }),
      model.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as T[],
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  private static buildWhere(filters: FilterCondition[]): Record<string, unknown> {
    const where: Record<string, unknown> = {};

    for (const filter of filters) {
      const { field, operator, value } = filter;

      switch (operator) {
        case "eq":
          where[field] = value;
          break;
        case "neq":
          where[field] = { not: value };
          break;
        case "gt":
          where[field] = { gt: value };
          break;
        case "gte":
          where[field] = { gte: value };
          break;
        case "lt":
          where[field] = { lt: value };
          break;
        case "lte":
          where[field] = { lte: value };
          break;
        case "in":
          where[field] = { in: value };
          break;
        case "notIn":
          where[field] = { notIn: value };
          break;
        case "contains":
          where[field] = { contains: value, mode: "insensitive" };
          break;
        case "between":
          if (Array.isArray(value) && value.length === 2) {
            where[field] = { gte: value[0], lte: value[1] };
          }
          break;
        case "isNull":
          where[field] = null;
          break;
        case "isNotNull":
          where[field] = { not: null };
          break;
      }
    }

    return where;
  }

  private static buildOrderBy(sort?: SortCondition[]): Record<string, string> | undefined {
    if (!sort || sort.length === 0) return undefined;
    if (sort.length === 1) return { [sort[0].field]: sort[0].direction };
    return sort.reduce((acc, s) => ({ ...acc, [s.field]: s.direction }), {});
  }

  private static buildSelect(fields: string[]): Record<string, boolean> {
    return fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
  }

  private static buildInclude(relations: string[]): Record<string, boolean> {
    return relations.reduce((acc, rel) => ({ ...acc, [rel]: true }), {});
  }
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function createArticleQuery(): ArticleQueryBuilder {
  return new ArticleQueryBuilder();
}

export function createEntityQuery(): EntityQueryBuilder {
  return new EntityQueryBuilder();
}

export function createAlertQuery(): AlertQueryBuilder {
  return new AlertQueryBuilder();
}

export function createRiskQuery(): RiskQueryBuilder {
  return new RiskQueryBuilder();
}

export function createSentimentQuery(): SentimentQueryBuilder {
  return new SentimentQueryBuilder();
}

export function createAssetPriceQuery(): AssetPriceQueryBuilder {
  return new AssetPriceQueryBuilder();
}

export function createAggregation(): AggregationBuilder {
  return new AggregationBuilder();
}

export function createSearchEngine(): SearchEngine {
  return new SearchEngine();
}

export function parseSortParam(sortParam: string | null): SortCondition[] {
  if (!sortParam) return [];
  return sortParam.split(",").map(part => {
    const [field, direction] = part.split(":");
    return { field, direction: (direction as SortDirection) || "asc" };
  });
}

export function parseFilterParam(filterParam: string | null): FilterCondition[] {
  if (!filterParam) return [];
  try {
    const parsed = JSON.parse(filterParam);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    return [];
  }
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    itemsOnPage: Math.min(limit, total - (page - 1) * limit),
  };
}

export function getDefaultSort(entity: string): SortCondition[] {
  const defaults: Record<string, SortCondition[]> = {
    article: [{ field: "publishedAt", direction: "desc" }],
    entity: [{ field: "lastSeen", direction: "desc" }],
    alert: [{ field: "triggeredAt", direction: "desc" }],
    risk: [{ field: "assessedAt", direction: "desc" }],
    sentiment: [{ field: "calculatedAt", direction: "desc" }],
    assetPrice: [{ field: "tradedAt", direction: "desc" }],
    report: [{ field: "createdAt", direction: "desc" }],
    notification: [{ field: "createdAt", direction: "desc" }],
  };
  return defaults[entity] || [{ field: "createdAt", direction: "desc" }];
}

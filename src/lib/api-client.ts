// ═══════════════════════════════════════════════════════════════
//  API CLIENT SDK — Client-side API wrapper for Harch Atelier
//
//  Provides a typed, ergonomic client for calling the Harch
//  Atelier API from the browser. Handles authentication,
//  error handling, retries, caching, and request/response
//  transformation.
// ═══════════════════════════════════════════════════════════════

import type {
  Company,
  Article,
  Entity,
  SentimentScore,
  RiskAssessment,
  ReputationScore,
  AIVisibility,
  Asset,
  AssetPrice,
  Alert,
  Notification,
  Report,
  Briefing,
  Dossier,
  Portfolio,
  ApiKey,
  Webhook,
  Influencer,
  AccountType,
  SentimentLabel,
  RiskLevel,
  ArticleSourceType,
  Language,
  ExportFormat,
} from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>,
    public requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── BASE API CLIENT ───────────────────────────────────────────

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private defaultRetries: number;
  private defaultRetryDelay: number;
  private cache: Map<string, { data: unknown; expires: number }>;
  private cacheEnabled: boolean;

  constructor(options?: {
    baseUrl?: string;
    apiKey?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    cacheEnabled?: boolean;
  }) {
    this.baseUrl = options?.baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
    if (options?.apiKey) {
      this.defaultHeaders["Authorization"] = `Bearer ${options.apiKey}`;
    }
    this.defaultTimeout = options?.timeout || 30000;
    this.defaultRetries = options?.retries || 2;
    this.defaultRetryDelay = options?.retryDelay || 1000;
    this.cache = new Map();
    this.cacheEnabled = options?.cacheEnabled ?? true;
  }

  setApiKey(apiKey: string): void {
    this.defaultHeaders["Authorization"] = `Bearer ${apiKey}`;
  }

  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  clearCache(): void {
    this.cache.clear();
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  private getCacheKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  private getCached<T>(key: string): T | null {
    if (!this.cacheEnabled) return null;
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCached(key: string, data: unknown, ttl: number): void {
    if (!this.cacheEnabled) return;
    this.cache.set(key, { data, expires: Date.now() + ttl });
  }

  async request<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    const method = options?.method || "GET";
    const url = this.buildUrl(path, options?.params);
    const cacheKey = this.getCacheKey(url, method);

    // Check cache for GET requests
    if (method === "GET" && options?.cache !== false) {
      const cached = this.getCached<T>(cacheKey);
      if (cached) return cached;
    }

    const timeout = options?.timeout || this.defaultTimeout;
    const retries = options?.retries ?? this.defaultRetries;
    const retryDelay = options?.retryDelay || this.defaultRetryDelay;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const signal = options?.signal || controller.signal;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: { ...this.defaultHeaders, ...options?.headers },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let errorData: ApiResponse | null = null;
          try {
            errorData = await response.json();
          } catch {
            // ignore parse error
          }

          throw new ApiError(
            errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData && "code" in errorData ? (errorData as Record<string, unknown>).code as string | undefined : undefined,
            errorData && "details" in errorData ? (errorData as Record<string, unknown>).details as Record<string, unknown> | undefined : undefined,
            errorData?.requestId
          );
        }

        const data = await response.json();

        // Cache successful GET responses
        if (method === "GET" && options?.cache !== false) {
          this.setCached(cacheKey, data, options?.cacheTTL || 60000);
        }

        return data as T;
      } catch (err) {
        lastError = err as Error;

        if (err instanceof ApiError) {
          // Don't retry on 4xx errors (client errors)
          if (err.status >= 400 && err.status < 500) {
            throw err;
          }
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error("Request failed");
  }

  async get<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>, options?: Omit<RequestOptions, "method" | "body" | "params">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET", params });
  }

  async post<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  async put<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  async patch<T = unknown>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  async delete<T = unknown>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

// ─── HARCH ATELIER API CLIENT ──────────────────────────────────

export class HarchApiClient extends ApiClient {
  // ─── COMPANIES ────────────────────────────────────────────

  async getCompanies(params?: {
    page?: number;
    limit?: number;
    sector?: string;
    q?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResponse<Company>> {
    return this.get("/api/companies", params);
  }

  async getCompany(slug: string): Promise<ApiResponse<Company>> {
    return this.get(`/api/companies/${slug}`);
  }

  async getCompanyArticles(slug: string, params?: {
    page?: number;
    limit?: number;
    source?: string;
    language?: Language;
    sentimentLabel?: SentimentLabel;
    sourceType?: ArticleSourceType;
  }): Promise<PaginatedResponse<Article>> {
    return this.get(`/api/companies/${slug}/articles`, params);
  }

  async getCompanyEntities(slug: string, params?: { top?: number }): Promise<ApiResponse<Entity[]>> {
    return this.get(`/api/companies/${slug}/entities`, params);
  }

  async getCompanySentiment(slug: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SentimentScore>> {
    return this.get(`/api/companies/${slug}/sentiment`, params);
  }

  async getCompanyRisks(slug: string): Promise<ApiResponse<RiskAssessment[]>> {
    return this.get(`/api/companies/${slug}/risks`);
  }

  async getCompanyReputation(slug: string): Promise<ApiResponse<ReputationScore>> {
    return this.get(`/api/companies/${slug}/reputation`);
  }

  async getCompanyAIVisibility(slug: string): Promise<ApiResponse<AIVisibility[]>> {
    return this.get(`/api/companies/${slug}/ai-visibility`);
  }

  // ─── FLAGSHIP REPORT ──────────────────────────────────────

  async getFlagshipReport(): Promise<ApiResponse<{
    meta: Record<string, unknown>;
    summary: Record<string, number>;
    companies: unknown[];
    people: unknown[];
    keyEvents: unknown[];
    sectors: unknown[];
    topSources: unknown[];
    languages: unknown[];
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
    assets: unknown[];
    risks: unknown[];
    methodology: Record<string, unknown>;
  }>> {
    return this.get("/api/flagship-report");
  }

  // ─── CONSOLE API ──────────────────────────────────────────

  async getAlerts(params?: {
    range?: "24h" | "7d" | "30d";
    company?: string;
  }): Promise<ApiResponse<Alert[]>> {
    return this.get("/api/console/alerts", params);
  }

  async getWeather(params?: { range?: "24h" | "7d" | "30d" }): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/weather", params);
  }

  async getTopics(): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/topics");
  }

  async getAIVisibility(): Promise<ApiResponse<AIVisibility[]>> {
    return this.get("/api/console/ai-visibility");
  }

  async getCrisis(): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/crisis");
  }

  async getGeoSignals(params?: { range?: "7d" | "30d" }): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/geo-signals", params);
  }

  async getInsights(params?: { accountType?: AccountType }): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/insights", params);
  }

  async generateInsights(accountType: AccountType): Promise<ApiResponse<unknown>> {
    return this.post("/api/console/insights/generate", { accountType });
  }

  async getNeighbors(): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/neighbors");
  }

  async getNarratives(): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/narratives");
  }

  async getRegulatory(params?: { source?: string }): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/regulatory", params);
  }

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    return this.get("/api/console/notifications");
  }

  async pushNotification(data: { type: string; title: string; body: string; severity: string; link?: string }): Promise<ApiResponse<unknown>> {
    return this.post("/api/console/notifications/push", data);
  }

  async getExportLog(): Promise<ApiResponse<unknown>> {
    return this.get("/api/console/export-log");
  }

  async getReports(): Promise<ApiResponse<Report[]>> {
    return this.get("/api/console/reports/list");
  }

  async generateReport(data: { title: string; period: string; companyId?: string }): Promise<ApiResponse<Report>> {
    return this.post("/api/console/reports", data);
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await fetch(`/api/console/reports/${reportId}/pdf`);
    return response.blob();
  }

  async analyzeDarija(text: string): Promise<ApiResponse<unknown>> {
    return this.post("/api/console/darija-analyze", { text });
  }

  // ─── INVESTOR DESK ────────────────────────────────────────

  async getDossiers(): Promise<ApiResponse<Dossier[]>> {
    return this.get("/api/investor/dossiers");
  }

  async generateDossier(companyName: string): Promise<ApiResponse<Dossier>> {
    return this.post("/api/investor/dossiers/generate", { companyName });
  }

  async screenEntity(entity: string, lists?: string[]): Promise<ApiResponse<unknown>> {
    return this.get("/api/investor/screen", { entity, lists: lists?.join(",") });
  }

  // ─── TRADER / ALPHA DESK ──────────────────────────────────

  async getAssets(): Promise<ApiResponse<Asset[]>> {
    return this.get("/api/trader/assets");
  }

  async getAssetHistory(ticker: string, days?: number): Promise<ApiResponse<AssetPrice[]>> {
    return this.get(`/api/trader/assets/${ticker}/history`, { days });
  }

  async getAssetCorrelation(ticker: string): Promise<ApiResponse<unknown>> {
    return this.get(`/api/trader/assets/${ticker}/correlation`);
  }

  async getTraderStats(): Promise<ApiResponse<unknown>> {
    return this.get("/api/trader/stats");
  }

  // ─── API KEYS ─────────────────────────────────────────────

  async getApiKeys(): Promise<ApiResponse<ApiKey[]>> {
    return this.get("/api/api-keys");
  }

  async createApiKey(data: { name: string; permissions?: string[]; expiresAt?: string }): Promise<ApiResponse<{ key: string; data: ApiKey }>> {
    return this.post("/api/api-keys", data);
  }

  async revokeApiKey(id: string): Promise<ApiResponse<unknown>> {
    return this.delete(`/api/api-keys/${id}`);
  }

  // ─── WEBHOOKS ─────────────────────────────────────────────

  async getWebhooks(): Promise<ApiResponse<Webhook[]>> {
    return this.get("/api/webhooks");
  }

  async createWebhook(data: { url: string; events: string[] }): Promise<ApiResponse<Webhook>> {
    return this.post("/api/webhooks", data);
  }

  async deleteWebhook(id: string): Promise<ApiResponse<unknown>> {
    return this.delete(`/api/webhooks/${id}`);
  }

  async testWebhook(id: string): Promise<ApiResponse<unknown>> {
    return this.post(`/api/webhooks/${id}/test`);
  }

  // ─── V1 PUBLIC API ────────────────────────────────────────

  async getReputation(company: string, period?: string): Promise<ApiResponse<unknown>> {
    return this.get("/api/v1/reputation", { company, period });
  }

  async getAlertsV1(company: string, params?: { severity?: string; since?: string }): Promise<ApiResponse<unknown>> {
    return this.get("/api/v1/alerts", { company, ...params });
  }

  async getSentimentV1(company: string, params?: { from?: string; to?: string; granularity?: string }): Promise<ApiResponse<unknown>> {
    return this.get("/api/v1/sentiment", { company, ...params });
  }

  async screenEntityV1(entity: string, lists?: string[]): Promise<ApiResponse<unknown>> {
    return this.post("/api/v1/screen", { entity, lists });
  }

  async analyzeSentiment(text: string, language?: string): Promise<ApiResponse<unknown>> {
    return this.post("/api/v1/sentiment", { text, language });
  }

  // ─── AUTH ─────────────────────────────────────────────────

  async getSession(): Promise<ApiResponse<unknown>> {
    return this.get("/api/auth/session");
  }

  async getProviders(): Promise<ApiResponse<unknown>> {
    return this.get("/api/auth/providers");
  }

  // ─── BRIEFINGS ────────────────────────────────────────────

  async getBriefings(): Promise<ApiResponse<Briefing[]>> {
    return this.get("/api/console/briefings");
  }

  // ─── INFLUENCERS ──────────────────────────────────────────

  async getInfluencers(params?: { platform?: string; location?: string; minScore?: number }): Promise<ApiResponse<Influencer[]>> {
    return this.get("/api/console/influencers", params);
  }

  // ─── PORTFOLIOS ───────────────────────────────────────────

  async getPortfolios(): Promise<ApiResponse<Portfolio[]>> {
    return this.get("/api/investor/portfolios");
  }

  async createPortfolio(name: string): Promise<ApiResponse<Portfolio>> {
    return this.post("/api/investor/portfolios", { name });
  }

  // ─── EXPORT ───────────────────────────────────────────────

  async exportData(format: ExportFormat, data: unknown, template?: string): Promise<ApiResponse<{ url: string }>> {
    return this.post("/api/console/export", { format, data, template });
  }

  // ─── HEALTH ───────────────────────────────────────────────

  async getHealth(): Promise<ApiResponse<{ status: string; version: string; uptime: number }>> {
    return this.get("/api/health");
  }

  async getCronHealth(): Promise<ApiResponse<unknown>> {
    return this.get("/api/cron/health");
  }
}

// ─── SINGLETON INSTANCE ────────────────────────────────────────

let clientInstance: HarchApiClient | null = null;

export function getApiClient(): HarchApiClient {
  if (!clientInstance) {
    clientInstance = new HarchApiClient({
      baseUrl: typeof window !== "undefined" ? window.location.origin : "",
      timeout: 30000,
      retries: 2,
      retryDelay: 1000,
      cacheEnabled: true,
    });
  }
  return clientInstance;
}

export function resetApiClient(): void {
  clientInstance = null;
}

// ─── REACT HOOK HELPERS ────────────────────────────────────────

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UsePaginatedApiState<T> extends UseApiState<T[]> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

export interface UseMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  mutate: (data?: unknown) => Promise<T>;
  reset: () => void;
}

// ─── ERROR HANDLING ────────────────────────────────────────────

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}

export function getErrorCode(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.code;
  }
  return undefined;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (isApiError(error)) {
    return error.status;
  }
  return undefined;
}

export function isNetworkError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 0 || error.status >= 500;
  }
  return error instanceof TypeError && error.message.includes("fetch");
}

export function isAuthError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 401 || error.status === 403;
  }
  return false;
}

export function isNotFoundError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 404;
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 400 || error.status === 422;
  }
  return false;
}

export function isRateLimitError(error: unknown): boolean {
  if (isApiError(error)) {
    return error.status === 429;
  }
  return false;
}

// ─── REQUEST INTERCEPTORS ──────────────────────────────────────

export type RequestInterceptor = (config: { url: string; method: string; headers: Record<string, string>; body?: unknown }) => void;
export type ResponseInterceptor = (response: Response) => void;
export type ErrorInterceptor = (error: unknown) => void;

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  addRequestInterceptor(fn: RequestInterceptor): () => void {
    this.requestInterceptors.push(fn);
    return () => {
      this.requestInterceptors = this.requestInterceptors.filter(f => f !== fn);
    };
  }

  addResponseInterceptor(fn: ResponseInterceptor): () => void {
    this.responseInterceptors.push(fn);
    return () => {
      this.responseInterceptors = this.responseInterceptors.filter(f => f !== fn);
    };
  }

  addErrorInterceptor(fn: ErrorInterceptor): () => void {
    this.errorInterceptors.push(fn);
    return () => {
      this.errorInterceptors = this.errorInterceptors.filter(f => f !== fn);
    };
  }

  runRequestInterceptors(config: { url: string; method: string; headers: Record<string, string>; body?: unknown }): void {
    for (const interceptor of this.requestInterceptors) {
      try {
        interceptor(config);
      } catch {
        // ignore interceptor errors
      }
    }
  }

  runResponseInterceptors(response: Response): void {
    for (const interceptor of this.responseInterceptors) {
      try {
        interceptor(response);
      } catch {
        // ignore interceptor errors
      }
    }
  }

  runErrorInterceptors(error: unknown): void {
    for (const interceptor of this.errorInterceptors) {
      try {
        interceptor(error);
      } catch {
        // ignore interceptor errors
      }
    }
  }

  clear(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }
}

// ─── QUERY BUILDER HELPERS ─────────────────────────────────────

export class ApiQueryBuilder {
  private params: Record<string, string | number | boolean | undefined> = {};

  where(key: string, value: string | number | boolean | undefined): this {
    this.params[key] = value;
    return this;
  }

  page(page: number): this {
    return this.where("page", page);
  }

  limit(limit: number): this {
    return this.where("limit", limit);
  }

  sort(field: string, direction: "asc" | "desc" = "asc"): this {
    return this.where("sort", `${field}:${direction}`);
  }

  filter(key: string, value: string): this {
    return this.where(key, value);
  }

  search(query: string): this {
    return this.where("q", query);
  }

  build(): Record<string, string | number | boolean | undefined> {
    return { ...this.params };
  }

  reset(): this {
    this.params = {};
    return this;
  }
}

export function createApiQuery(): ApiQueryBuilder {
  return new ApiQueryBuilder();
}

// ─── BATCH OPERATIONS ──────────────────────────────────────────

export async function batchGet<T>(client: HarchApiClient, paths: string[], options?: { concurrency?: number }): Promise<Array<unknown>> {
  const concurrency = options?.concurrency || 5;
  const results: Array<unknown> = [];

  for (let i = 0; i < paths.length; i += concurrency) {
    const batch = paths.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(path => client.get<T>(path).catch(err => ({
        success: false,
        error: getErrorMessage(err),
        timestamp: new Date().toISOString(),
      })))
    );
    results.push(...batchResults);
  }

  return results;
}

export async function batchPost<T>(client: HarchApiClient, requests: Array<{ path: string; body?: unknown }>, options?: { concurrency?: number }): Promise<Array<unknown>> {
  const concurrency = options?.concurrency || 3;
  const results: Array<unknown> = [];

  for (let i = 0; i < requests.length; i += concurrency) {
    const batch = requests.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(req => client.post<T>(req.path, req.body).catch(err => ({
        success: false,
        error: getErrorMessage(err),
        timestamp: new Date().toISOString(),
      })))
    );
    results.push(...batchResults);
  }

  return results;
}

// ─── POLLING HELPER ────────────────────────────────────────────

export function poll<T>(
  fn: () => Promise<T>,
  options: {
    interval: number;
    maxAttempts?: number;
    shouldContinue?: (result: T) => boolean;
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
  }
): { cancel: () => void; promise: Promise<T | null> } {
  let cancelled = false;
  let attempts = 0;

  const promise = new Promise<T | null>((resolve) => {
    const run = async () => {
      if (cancelled) {
        resolve(null);
        return;
      }

      if (options.maxAttempts && attempts >= options.maxAttempts) {
        resolve(null);
        return;
      }

      attempts++;

      try {
        const result = await fn();
        if (options.onSuccess) options.onSuccess(result);

        if (options.shouldContinue && options.shouldContinue(result)) {
          setTimeout(run, options.interval);
        } else {
          resolve(result);
        }
      } catch (err) {
        if (options.onError) options.onError(err);
        if (!cancelled && (!options.maxAttempts || attempts < options.maxAttempts)) {
          setTimeout(run, options.interval);
        } else {
          resolve(null);
        }
      }
    };

    run();
  });

  return {
    cancel: () => { cancelled = true; },
    promise,
  };
}

// ─── SSE CLIENT ────────────────────────────────────────────────

export class SSEClient {
  private eventSource: EventSource | null = null;
  private url: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.eventSource) this.disconnect();

    this.eventSource = new EventSource(this.url);

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.eventSource.onerror = () => {
      this.disconnect();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        setTimeout(() => this.connect(), delay);
      }
    };

    for (const [event, callbacks] of this.listeners) {
      if (event === "message") {
        this.eventSource.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            callbacks.forEach(cb => cb(data));
          } catch {
            callbacks.forEach(cb => cb(e.data));
          }
        };
      } else {
        this.eventSource.addEventListener(event, (e) => {
          try {
            const data = JSON.parse((e as MessageEvent).data);
            callbacks.forEach(cb => cb(data));
          } catch {
            callbacks.forEach(cb => cb((e as MessageEvent).data));
          }
        });
      }
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN;
  }
}

// ─── WEBSOCKET CLIENT ──────────────────────────────────────────

export class WSClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatMs: number = 30000;

  constructor(url: string) {
    this.url = url;
  }

  connect(): void {
    if (this.socket) this.disconnect();

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onclose = () => {
      this.stopHeartbeat();

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        setTimeout(() => this.connect(), delay);
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const { type, data } = message;
        const callbacks = this.listeners.get(type) || this.listeners.get("message");
        if (callbacks) {
          callbacks.forEach(cb => cb(data || message));
        }
      } catch {
        const callbacks = this.listeners.get("message");
        if (callbacks) {
          callbacks.forEach(cb => cb(event.data));
        }
      }
    };
  }

  disconnect(): void {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(type: string, data?: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, data }));
    }
  }

  on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send("heartbeat", { timestamp: Date.now() });
    }, this.heartbeatMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

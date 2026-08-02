// ═══════════════════════════════════════════════════════════════
//  SCHEDULER & CRON MANAGEMENT — Job queue and task scheduling
//
//  Manages scheduled tasks, cron jobs, job queues, retries,
//  and task dependencies for the Harch Atelier platform.
//  Supports priority queues, delayed execution, recurring jobs,
//  and job observability.
// ═══════════════════════════════════════════════════════════════

import type { JobType, JobStatus } from "@/lib/types/platform";

// ─── TYPES ─────────────────────────────────────────────────────

export interface ScheduledJob {
  id: string;
  type: JobType;
  name: string;
  description: string;
  schedule: string;
  endpoint: string;
  status: JobStatus;
  priority: JobPriority;
  timeout: number;
  retries: number;
  maxRetries: number;
  retryDelay: number;
  retryBackoff: number;
  lastRun?: Date;
  lastResult?: JobResult;
  nextRun?: Date;
  enabled: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type JobPriority = "low" | "normal" | "high" | "critical";

export interface JobResult {
  success: boolean;
  status: "success" | "failed" | "skipped" | "timeout";
  duration: number;
  recordsProcessed?: number;
  output?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

export interface JobExecution {
  id: string;
  jobId: string;
  status: JobStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  result?: JobResult;
  workerId?: string;
  retryAttempt: number;
  logs: JobLogEntry[];
}

export interface JobLogEntry {
  timestamp: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, unknown>;
}

export interface JobQueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultTimeout: number;
  defaultRetries: number;
  defaultRetryDelay: number;
  cleanupInterval: number;
  retentionDays: number;
}

// ─── CRON EXPRESSION PARSER ────────────────────────────────────

export class CronParser {
  static parse(expression: string): {
    seconds: number[];
    minutes: number[];
    hours: number[];
    dayOfMonth: number[];
    month: number[];
    dayOfWeek: number[];
  } | null {
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 6) return null;

    const [sec, min, hour, dom, month, dow] = parts;

    return {
      seconds: this.parseField(sec, 0, 59),
      minutes: this.parseField(min, 0, 59),
      hours: this.parseField(hour, 0, 23),
      dayOfMonth: this.parseField(dom, 1, 31),
      month: this.parseField(month, 1, 12),
      dayOfWeek: this.parseField(dow, 0, 6),
    };
  }

  static parseField(field: string, min: number, max: number): number[] {
    if (field === "*") {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    const values: number[] = [];
    const parts = field.split(",");

    for (const part of parts) {
      if (part.includes("/")) {
        const [range, step] = part.split("/");
        const stepNum = parseInt(step, 10);
        const [start, end] = range === "*" ? [min, max] : range.includes("-") ? range.split("-").map(Number) : [parseInt(range, 10), max];
        for (let i = start; i <= end; i += stepNum) {
          values.push(i);
        }
      } else if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        for (let i = start; i <= end; i++) {
          values.push(i);
        }
      } else {
        values.push(parseInt(part, 10));
      }
    }

    return values.filter(v => v >= min && v <= max);
  }

  static getNextRun(expression: string, from: Date = new Date()): Date | null {
    const parsed = this.parse(expression);
    if (!parsed) return null;

    const next = new Date(from);
    next.setSeconds(next.getSeconds() + 1, 0);

    // Brute force: increment second by second until we find a match
    // (limited to 1 year ahead to prevent infinite loops)
    const maxIterations = 365 * 24 * 60 * 60;

    for (let i = 0; i < maxIterations; i++) {
      if (
        parsed.seconds.includes(next.getSeconds()) &&
        parsed.minutes.includes(next.getMinutes()) &&
        parsed.hours.includes(next.getHours()) &&
        parsed.dayOfMonth.includes(next.getDate()) &&
        parsed.month.includes(next.getMonth() + 1) &&
        parsed.dayOfWeek.includes(next.getDay())
      ) {
        return next;
      }
      next.setSeconds(next.getSeconds() + 1);
    }

    return null;
  }

  static validate(expression: string): boolean {
    return this.parse(expression) !== null;
  }

  static describe(expression: string): string {
    const parsed = this.parse(expression);
    if (!parsed) return "Invalid cron expression";

    if (expression === "0 * * * * ?") return "Every hour";
    if (expression === "0 */15 * * * ?") return "Every 15 minutes";
    if (expression === "0 */30 * * * ?") return "Every 30 minutes";
    if (expression === "0 0 * * * ?") return "Daily at midnight";
    if (expression === "0 0 7 * * ?") return "Daily at 7 AM";
    if (expression === "0 0 0 1 * ?") return "First of every month at midnight";
    if (expression === "0 0 22 * * ?") return "Daily at 10 PM";

    return `Cron: ${expression}`;
  }
}

// ─── JOB SCHEDULER ─────────────────────────────────────────────

export class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private executions: Map<string, JobExecution> = new Map();
  private config: JobQueueConfig;
  private queue: string[] = [];
  private running: Set<string> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(config?: Partial<JobQueueConfig>) {
    this.config = {
      maxConcurrent: 5,
      maxQueueSize: 1000,
      defaultTimeout: 60000,
      defaultRetries: 3,
      defaultRetryDelay: 5000,
      cleanupInterval: 3600000,
      retentionDays: 30,
      ...config,
    };
  }

  register(job: Omit<ScheduledJob, "id" | "status" | "createdAt" | "updatedAt">): ScheduledJob {
    const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date();

    const fullJob: ScheduledJob = {
      ...job,
      id,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      timeout: job.timeout || this.config.defaultTimeout,
      maxRetries: job.maxRetries || this.config.defaultRetries,
      retryDelay: job.retryDelay || this.config.defaultRetryDelay,
    };

    // Calculate next run
    if (fullJob.enabled && fullJob.schedule) {
      fullJob.nextRun = CronParser.getNextRun(fullJob.schedule) || undefined;
    }

    this.jobs.set(id, fullJob);
    return fullJob;
  }

  unregister(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.enabled = false;
    job.updatedAt = new Date();
    return true;
  }

  enable(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.enabled = true;
    job.nextRun = CronParser.getNextRun(job.schedule) || undefined;
    job.updatedAt = new Date();
    return true;
  }

  disable(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    job.enabled = false;
    job.nextRun = undefined;
    job.updatedAt = new Date();
    return true;
  }

  executeNow(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || !job.enabled) return false;

    if (this.running.size >= this.config.maxConcurrent) {
      this.queue.push(jobId);
      return false;
    }

    this.runJob(job);
    return true;
  }

  private async runJob(job: ScheduledJob): Promise<void> {
    this.running.add(job.id);
    job.status = "running";
    job.lastRun = new Date();
    job.updatedAt = new Date();

    const execution: JobExecution = {
      id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      jobId: job.id,
      status: "running",
      startedAt: new Date(),
      retryAttempt: 0,
      logs: [],
    };
    this.executions.set(execution.id, execution);

    const startTime = Date.now();

    try {
      // In production, this would call the job's endpoint
      execution.logs.push({
        timestamp: new Date().toISOString(),
        level: "info",
        message: `Starting job: ${job.name}`,
      });

      // Simulate job execution
      await new Promise(resolve => setTimeout(resolve, 100));

      const duration = Date.now() - startTime;
      const result: JobResult = {
        success: true,
        status: "success",
        duration,
        recordsProcessed: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
      };

      execution.status = "completed";
      execution.completedAt = new Date();
      execution.duration = duration;
      execution.result = result;

      job.status = "completed";
      job.lastResult = result;
    } catch (err) {
      const duration = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : "Unknown error";

      execution.logs.push({
        timestamp: new Date().toISOString(),
        level: "error",
        message: `Job failed: ${errorMsg}`,
      });

      const result: JobResult = {
        success: false,
        status: "failed",
        duration,
        error: errorMsg,
        timestamp: new Date().toISOString(),
      };

      execution.status = "failed";
      execution.completedAt = new Date();
      execution.duration = duration;
      execution.result = result;

      // Retry logic
      if (execution.retryAttempt < job.maxRetries) {
        execution.retryAttempt++;
        job.status = "retrying";
        execution.logs.push({
          timestamp: new Date().toISOString(),
          level: "warn",
          message: `Scheduling retry ${execution.retryAttempt}/${job.maxRetries}`,
        });
        setTimeout(() => this.runJob(job), job.retryDelay * execution.retryAttempt);
      } else {
        job.status = "failed";
        job.lastResult = result;
      }
    } finally {
      this.running.delete(job.id);

      // Calculate next run
      if (job.enabled && job.schedule) {
        job.nextRun = CronParser.getNextRun(job.schedule) || undefined;
      }

      // Process queue
      if (this.queue.length > 0 && this.running.size < this.config.maxConcurrent) {
        const nextJobId = this.queue.shift();
        if (nextJobId) {
          const nextJob = this.jobs.get(nextJobId);
          if (nextJob && nextJob.enabled) {
            this.runJob(nextJob);
          }
        }
      }
    }
  }

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      const now = new Date();
      for (const [id, job] of this.jobs) {
        if (job.enabled && job.nextRun && job.nextRun <= now) {
          if (this.running.size < this.config.maxConcurrent) {
            this.runJob(job);
          } else if (!this.queue.includes(id) && this.queue.length < this.config.maxQueueSize) {
            this.queue.push(id);
          }
        }
      }
    }, 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): ScheduledJob[] {
    return [...this.jobs.values()];
  }

  getEnabledJobs(): ScheduledJob[] {
    return [...this.jobs.values()].filter(j => j.enabled);
  }

  getJobsByType(type: JobType): ScheduledJob[] {
    return [...this.jobs.values()].filter(j => j.type === type);
  }

  getRunningJobs(): ScheduledJob[] {
    return [...this.jobs.values()].filter(j => j.status === "running");
  }

  getFailedJobs(): ScheduledJob[] {
    return [...this.jobs.values()].filter(j => j.status === "failed");
  }

  getExecution(executionId: string): JobExecution | undefined {
    return this.executions.get(executionId);
  }

  getJobExecutions(jobId: string, limit: number = 10): JobExecution[] {
    return [...this.executions.values()]
      .filter(e => e.jobId === jobId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  getStats(): {
    totalJobs: number;
    enabledJobs: number;
    runningJobs: number;
    failedJobs: number;
    queuedJobs: number;
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
  } {
    const allExecutions = [...this.executions.values()];
    const completed = allExecutions.filter(e => e.status === "completed");
    const failed = allExecutions.filter(e => e.status === "failed");

    const totalDuration = completed.reduce((sum, e) => sum + (e.duration || 0), 0);
    const avgDuration = completed.length > 0 ? totalDuration / completed.length : 0;

    return {
      totalJobs: this.jobs.size,
      enabledJobs: this.getEnabledJobs().length,
      runningJobs: this.running.size,
      failedJobs: this.getFailedJobs().length,
      queuedJobs: this.queue.length,
      totalExecutions: allExecutions.length,
      successRate: allExecutions.length > 0 ? (completed.length / allExecutions.length) * 100 : 0,
      averageDuration: avgDuration,
    };
  }

  cleanup(): number {
    const cutoff = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);
    let cleaned = 0;

    for (const [id, execution] of this.executions) {
      if (execution.startedAt < cutoff) {
        this.executions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// ─── DEFAULT CRON JOBS ─────────────────────────────────────────

export const DEFAULT_CRON_JOBS: Array<Omit<ScheduledJob, "id" | "status" | "createdAt" | "updatedAt">> = [
  {
    type: "scrape_rss",
    name: "RSS Feed Scraper",
    description: "Scrape 16 Moroccan media RSS feeds every 30 minutes",
    schedule: "0 */30 * * * ?",
    endpoint: "/api/cron/scrape-rss",
    priority: "normal",
    timeout: 120000,
    retries: 0,
    maxRetries: 2,
    retryDelay: 60000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "scrape_regulatory",
    name: "Regulatory Feed Scraper",
    description: "Scrape AMMC, BAM, BVC regulatory press releases daily at 06:00 UTC",
    schedule: "0 0 6 * * ?",
    endpoint: "/api/cron/scrape-regulatory",
    priority: "high",
    timeout: 180000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 120000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "scrape_bvc",
    name: "BVC Price Refresh",
    description: "Refresh BVC daily closing prices after market close (18:00 UTC)",
    schedule: "0 0 18 * * ?",
    endpoint: "/api/cron/refresh-bvc-prices",
    priority: "high",
    timeout: 60000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 30000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "sanctions_refresh",
    name: "Sanctions List Refresh",
    description: "Refresh OFAC, EU, UN sanctions lists daily at 03:00 UTC",
    schedule: "0 0 3 * * ?",
    endpoint: "/api/cron/refresh-sanctions",
    priority: "critical",
    timeout: 300000,
    retries: 0,
    maxRetries: 5,
    retryDelay: 60000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "nlp_process",
    name: "NLP Processing Pipeline",
    description: "Process unprocessed articles with NLP (sentiment, NER, embeddings) every 15 minutes",
    schedule: "0 */15 * * * ?",
    endpoint: "/api/cron/nlp",
    priority: "normal",
    timeout: 90000,
    retries: 0,
    maxRetries: 2,
    retryDelay: 30000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "ai_visibility_probe",
    name: "AI Visibility Prober",
    description: "Probe 8 AI engines (ChatGPT, Claude, Gemini, etc.) daily at 22:00 UTC",
    schedule: "0 0 22 * * ?",
    endpoint: "/api/cron/ai-visibility",
    priority: "normal",
    timeout: 300000,
    retries: 0,
    maxRetries: 2,
    retryDelay: 60000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "briefing_generate",
    name: "Morning Briefing Generator",
    description: "Generate WhatsApp morning briefings for all users daily at 07:00 UTC",
    schedule: "0 0 7 * * ?",
    endpoint: "/api/cron/generate-briefings",
    priority: "high",
    timeout: 300000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 60000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "report_generate",
    name: "Monthly Report Generator",
    description: "Generate monthly intelligence reports on the 1st of each month",
    schedule: "0 0 0 1 * ?",
    endpoint: "/api/cron/generate-reports",
    priority: "high",
    timeout: 600000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 120000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Alert Threshold Checker",
    description: "Check alert thresholds and trigger notifications every 5 minutes",
    schedule: "0 */5 * * * ?",
    endpoint: "/api/cron/whatsapp-alerts",
    priority: "critical",
    timeout: 30000,
    retries: 0,
    maxRetries: 5,
    retryDelay: 10000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "notification_dispatch" as JobType,
    name: "Notification Dispatcher",
    description: "Dispatch pending notifications across channels every 2 minutes",
    schedule: "0 */2 * * * ?",
    endpoint: "/api/cron/notifications",
    priority: "normal",
    timeout: 30000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 5000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Autonomous Agent Runner",
    description: "Run autonomous agents for signal detection every 10 minutes",
    schedule: "0 */10 * * * ?",
    endpoint: "/api/cron/agents",
    priority: "low",
    timeout: 120000,
    retries: 0,
    maxRetries: 2,
    retryDelay: 30000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Health Check",
    description: "System health check every 5 minutes",
    schedule: "0 */5 * * * ?",
    endpoint: "/api/cron/health",
    priority: "normal",
    timeout: 10000,
    retries: 0,
    maxRetries: 3,
    retryDelay: 5000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Job Cleanup",
    description: "Clean old job executions daily at 04:00 UTC",
    schedule: "0 0 4 * * ?",
    endpoint: "/api/cron/clean-jobs",
    priority: "low",
    timeout: 60000,
    retries: 0,
    maxRetries: 1,
    retryDelay: 30000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Job Queue Dispatcher",
    description: "Dispatch queued jobs every minute",
    schedule: "0 * * * * ?",
    endpoint: "/api/cron/dispatch",
    priority: "high",
    timeout: 10000,
    retries: 0,
    maxRetries: 1,
    retryDelay: 5000,
    retryBackoff: 2,
    enabled: true,
  },
  {
    type: "alert_check",
    name: "Derived Metrics Refresh",
    description: "Refresh derived metrics (reputation scores, sentiment trends) hourly",
    schedule: "0 0 * * * ?",
    endpoint: "/api/cron/refresh",
    priority: "normal",
    timeout: 120000,
    retries: 0,
    maxRetries: 2,
    retryDelay: 60000,
    retryBackoff: 2,
    enabled: true,
  },
];

// ─── SINGLETON INSTANCE ────────────────────────────────────────

let schedulerInstance: JobScheduler | null = null;

export function getScheduler(): JobScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new JobScheduler();
    // Register all default cron jobs
    for (const job of DEFAULT_CRON_JOBS) {
      schedulerInstance.register(job);
    }
    schedulerInstance.start();
  }
  return schedulerInstance;
}

// ─── JOB DEPENDENCIES ──────────────────────────────────────────

export class JobDependencyGraph {
  private dependencies: Map<string, Set<string>> = new Map(); // jobId → depends on
  private dependents: Map<string, Set<string>> = new Map(); // jobId → dependent jobs

  addDependency(jobId: string, dependsOnJobId: string): void {
    if (!this.dependencies.has(jobId)) {
      this.dependencies.set(jobId, new Set());
    }
    this.dependencies.get(jobId)!.add(dependsOnJobId);

    if (!this.dependents.has(dependsOnJobId)) {
      this.dependents.set(dependsOnJobId, new Set());
    }
    this.dependents.get(dependsOnJobId)!.add(jobId);
  }

  removeDependency(jobId: string, dependsOnJobId: string): void {
    this.dependencies.get(jobId)?.delete(dependsOnJobId);
    this.dependents.get(dependsOnJobId)?.delete(jobId);
  }

  getDependencies(jobId: string): string[] {
    return [...(this.dependencies.get(jobId) || [])];
  }

  getDependents(jobId: string): string[] {
    return [...(this.dependents.get(jobId) || [])];
  }

  canExecute(jobId: string, completedJobs: Set<string>): boolean {
    const deps = this.dependencies.get(jobId);
    if (!deps) return true;
    return [...deps].every(dep => completedJobs.has(dep));
  }

  hasCycle(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (jobId: string): boolean => {
      visited.add(jobId);
      recursionStack.add(jobId);

      const deps = this.dependencies.get(jobId);
      if (deps) {
        for (const dep of deps) {
          if (!visited.has(dep)) {
            if (hasCycleDFS(dep)) return true;
          } else if (recursionStack.has(dep)) {
            return true;
          }
        }
      }

      recursionStack.delete(jobId);
      return false;
    };

    for (const jobId of this.dependencies.keys()) {
      if (!visited.has(jobId)) {
        if (hasCycleDFS(jobId)) return true;
      }
    }

    return false;
  }

  getTopologicalOrder(): string[] | null {
    if (this.hasCycle()) return null;

    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (jobId: string) => {
      if (visited.has(jobId)) return;
      visited.add(jobId);

      const deps = this.dependencies.get(jobId);
      if (deps) {
        for (const dep of deps) {
          visit(dep);
        }
      }

      order.push(jobId);
    };

    for (const jobId of this.dependencies.keys()) {
      visit(jobId);
    }

    return order;
  }
}

// ─── JOB OBSERVABILITY ─────────────────────────────────────────

export class JobObservability {
  private metrics: Map<string, {
    totalRuns: number;
    successCount: number;
    failureCount: number;
    averageDuration: number;
    lastRunAt?: Date;
    lastSuccessAt?: Date;
    lastFailureAt?: Date;
    lastError?: string;
  }> = new Map();

  recordExecution(jobId: string, result: JobResult): void {
    let metric = this.metrics.get(jobId);
    if (!metric) {
      metric = {
        totalRuns: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
      };
      this.metrics.set(jobId, metric);
    }

    metric.totalRuns++;
    if (result.success) {
      metric.successCount++;
      metric.lastSuccessAt = new Date();
    } else {
      metric.failureCount++;
      metric.lastFailureAt = new Date();
      metric.lastError = result.error;
    }

    metric.lastRunAt = new Date();
    metric.averageDuration = (metric.averageDuration * (metric.totalRuns - 1) + result.duration) / metric.totalRuns;
  }

  getMetrics(jobId: string) {
    return this.metrics.get(jobId);
  }

  getAllMetrics() {
    return Object.fromEntries(this.metrics);
  }

  getHealthStatus(jobId: string): "healthy" | "degraded" | "unhealthy" {
    const metric = this.metrics.get(jobId);
    if (!metric || metric.totalRuns === 0) return "healthy";

    const successRate = metric.successCount / metric.totalRuns;

    if (successRate >= 0.95) return "healthy";
    if (successRate >= 0.80) return "degraded";
    return "unhealthy";
  }

  getOverallHealth(): "healthy" | "degraded" | "unhealthy" {
    let unhealthy = 0;
    let degraded = 0;

    for (const jobId of this.metrics.keys()) {
      const status = this.getHealthStatus(jobId);
      if (status === "unhealthy") unhealthy++;
      else if (status === "degraded") degraded++;
    }

    if (unhealthy > 0) return "unhealthy";
    if (degraded > 0) return "degraded";
    return "healthy";
  }
}

// ─── JOB PRIORITIZATION ────────────────────────────────────────

export function comparePriority(a: ScheduledJob, b: ScheduledJob): number {
  const priorityOrder: Record<JobPriority, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  return priorityOrder[a.priority] - priorityOrder[b.priority];
}

export function sortJobsByPriority(jobs: ScheduledJob[]): ScheduledJob[] {
  return [...jobs].sort(comparePriority);
}

export function sortJobsByNextRun(jobs: ScheduledJob[]): ScheduledJob[] {
  return [...jobs]
    .filter(j => j.nextRun)
    .sort((a, b) => (a.nextRun!.getTime() - b.nextRun!.getTime()));
}

// ─── SCHEDULE CONVERSION HELPERS ───────────────────────────────

export function intervalToCron(intervalMs: number): string {
  if (intervalMs < 60000) {
    const seconds = Math.floor(intervalMs / 1000);
    return `0/${seconds} * * * * ?`;
  }
  if (intervalMs < 3600000) {
    const minutes = Math.floor(intervalMs / 60000);
    return `0 0/${minutes} * * * ?`;
  }
  if (intervalMs < 86400000) {
    const hours = Math.floor(intervalMs / 3600000);
    return `0 0 0/${hours} * * ?`;
  }
  const days = Math.floor(intervalMs / 86400000);
  return `0 0 0 1/${days} * ?`;
}

export function cronToHumanReadable(expression: string): string {
  return CronParser.describe(expression);
}

export function getNextRuns(expression: string, count: number = 5): Date[] {
  const runs: Date[] = [];
  let from = new Date();

  for (let i = 0; i < count; i++) {
    const next = CronParser.getNextRun(expression, from);
    if (!next) break;
    runs.push(next);
    from = new Date(next.getTime() + 1000);
  }

  return runs;
}

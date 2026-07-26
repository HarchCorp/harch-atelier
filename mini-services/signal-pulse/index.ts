/**
 * Harch Atelier V12.0 — Signal Pulse mini-service
 *
 * Independent socket.io server on port 3003 (hardcoded — gateway expects this).
 * Streams simulated watchlist signal deltas so the trader dashboard feels alive.
 *
 * Frontend connects via:  io("/?XTransformPort=3003")
 * (The Caddy gateway strips that query and forwards to localhost:3003.)
 */

import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";

// ---------------------------------------------------------------------------
// Types (mirror of src/lib/mock-data.ts — kept local so this service is
// self-contained and does not import from the Next.js app).
// ---------------------------------------------------------------------------

type Severity = "critical" | "high" | "medium" | "low";

type RiskPillar =
  | "Regulatory"
  | "Cyber"
  | "Financial"
  | "ESG"
  | "Geopolitical"
  | "Reputational";

interface WatchlistSignal {
  id: string;
  ticker: string;
  entity: string;
  signal: string;
  pillar: RiskPillar;
  severity: Severity;
  delta: number;
  articles: number;
  updatedAt: string;
}

interface PulseKpis {
  riskIndex: number;
  negativeShare: number;
  activeAlerts: number;
  ts: string;
}

// ---------------------------------------------------------------------------
// Baseline snapshot — mirrors src/lib/mock-data.ts watchlistSignals.
// `updatedAt` is converted to a real ISO string on boot so the UI shows a
// live timestamp instead of "12m ago".
// ---------------------------------------------------------------------------

const BASELINE: Omit<WatchlistSignal, "updatedAt">[] = [
  { id: "WL-001", ticker: "HRCH", entity: "HarchCorp", signal: "SEC inquiry — revenue recognition", pillar: "Regulatory", severity: "critical", delta: -3.4, articles: 86 },
  { id: "WL-002", ticker: "HRCH", entity: "HarchCorp", signal: "Ransomware claim — logistics data", pillar: "Cyber", severity: "critical", delta: -2.1, articles: 74 },
  { id: "WL-003", ticker: "HRCH", entity: "HarchCorp", signal: "Analyst downgrade — services margin", pillar: "Financial", severity: "high", delta: -1.7, articles: 41 },
  { id: "WL-004", ticker: "HRCH", entity: "HarchCorp", signal: "Export-control documentation request", pillar: "Geopolitical", severity: "high", delta: -0.9, articles: 63 },
  { id: "WL-005", ticker: "HRCH", entity: "HarchCorp", signal: "NGO Scope-3 methodology dispute", pillar: "ESG", severity: "high", delta: -0.6, articles: 58 },
  { id: "WL-006", ticker: "HRCH", entity: "HarchCorp", signal: "Patent ruling partially overturned", pillar: "Financial", severity: "medium", delta: 1.2, articles: 28 },
  { id: "WL-007", ticker: "HRCH", entity: "HarchCorp", signal: "Supplier labor audit — conditional pass", pillar: "ESG", severity: "low", delta: 0.4, articles: 31 },
  { id: "WL-008", ticker: "HRCH", entity: "HarchCorp", signal: "Innovation list — CTO named", pillar: "Reputational", severity: "low", delta: 0.3, articles: 22 },
];

const SEVERITY_ORDER: Severity[] = ["low", "medium", "high", "critical"];

// In-memory mutable state — every client sees the same evolving snapshot.
const signals: WatchlistSignal[] = BASELINE.map((s) => ({
  ...s,
  updatedAt: new Date().toISOString(),
}));

// Drifting KPI state — seeded from headlineKpis in mock-data.ts.
let kpis: PulseKpis = {
  riskIndex: 72.4,
  negativeShare: 38,
  activeAlerts: 17,
  ts: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Mutation helpers
// ---------------------------------------------------------------------------

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Mutate a single signal in-place; returns the patched copy or null. */
function mutateRandomSignal(): WatchlistSignal | null {
  if (signals.length === 0) return null;
  const idx = Math.floor(Math.random() * signals.length);
  const current = signals[idx];

  // Delta drift: ±0.1 to ±1.5, signed randomly. Clamped to a sane band.
  const deltaDrift = randRange(0.1, 1.5) * (Math.random() < 0.5 ? -1 : 1);
  const nextDelta = Math.max(-10, Math.min(10, Number((current.delta + deltaDrift).toFixed(2))));

  // Article accumulation (+1 to +8).
  const articleBump = randInt(1, 8);

  // Severity flip — 10% chance, one level up or down.
  let nextSeverity = current.severity;
  if (Math.random() < 0.1) {
    const curIdx = SEVERITY_ORDER.indexOf(current.severity);
    const dir = Math.random() < 0.5 ? -1 : 1;
    const nextIdx = Math.max(0, Math.min(SEVERITY_ORDER.length - 1, curIdx + dir));
    nextSeverity = SEVERITY_ORDER[nextIdx];
  }

  const updated: WatchlistSignal = {
    ...current,
    delta: nextDelta,
    articles: current.articles + articleBump,
    severity: nextSeverity,
    updatedAt: new Date().toISOString(),
  };

  signals[idx] = updated;
  return updated;
}

/** Drift all KPIs slightly. */
function driftKpis(): PulseKpis {
  // riskIndex: drift ±0.4, clamped 0–100.
  const riskIndex = Math.max(
    0,
    Math.min(100, Number((kpis.riskIndex + randRange(-0.4, 0.4)).toFixed(2))),
  );
  // negativeShare: drift ±0.6 percentage points, clamped 0–100.
  const negativeShare = Math.max(
    0,
    Math.min(100, Number((kpis.negativeShare + randRange(-0.6, 0.6)).toFixed(2))),
  );
  // activeAlerts: small random walk ±1, clamped ≥ 0.
  const activeAlerts = Math.max(0, kpis.activeAlerts + pick([-1, 0, 0, 1, 1]));

  kpis = {
    riskIndex,
    negativeShare,
    activeAlerts,
    ts: new Date().toISOString(),
  };
  return kpis;
}

// ---------------------------------------------------------------------------
// Socket.io server
// ---------------------------------------------------------------------------

const PORT = 3003; // hardcoded — see Caddyfile gateway rules

const httpServer = createServer();

const io = new Server(httpServer, {
  // DO NOT change the path — Caddy uses it to forward ?XTransformPort=3003.
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

function emitSnapshot(socket: Socket): void {
  socket.emit("signals:snapshot", signals);
}

function scheduleNextUpdate(): void {
  // 4–7s, randomized per-tick so the cadence looks organic.
  const delayMs = randInt(4000, 7000);
  setTimeout(() => {
    const updated = mutateRandomSignal();
    if (updated) {
      io.emit("signal:update", updated);
    }
    scheduleNextUpdate();
  }, delayMs);
}

function scheduleNextKpiTick(): void {
  setInterval(() => {
    io.emit("kpis:tick", driftKpis());
  }, 30_000);
}

io.on("connection", (socket: Socket) => {
  console.log(`[signal-pulse] client connected: ${socket.id}`);
  // Immediately send the current snapshot so the UI hydrates with live data.
  emitSnapshot(socket);
  // Also send the current KPI snapshot immediately, then drift it on the 30s tick.
  socket.emit("kpis:tick", kpis);

  socket.on("disconnect", (reason: string) => {
    console.log(`[signal-pulse] client disconnected: ${socket.id} (${reason})`);
  });

  socket.on("error", (err: unknown) => {
    console.error(`[signal-pulse] socket error (${socket.id}):`, err);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[signal-pulse] socket.io server listening on port ${PORT}`);
  console.log(`[signal-pulse] path=/  cors=*  (gateway: /?XTransformPort=${PORT})`);
  // Start the cadence loops once the server is up.
  scheduleNextUpdate();
  scheduleNextKpiTick();
});

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`[signal-pulse] received ${signal}, shutting down...`);
  io.close(() => {
    httpServer.close(() => {
      console.log("[signal-pulse] server closed");
      process.exit(0);
    });
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

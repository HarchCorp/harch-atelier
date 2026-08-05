// Combined: spawn dev server + capture screenshots (all in one process tree)
// The sandbox kills orphaned next-server processes, so we keep it as a child.
import { chromium } from "playwright";
import { spawn, execSync } from "child_process";
import { existsSync } from "fs";

const BASE = "http://127.0.0.1:3000";
const OUT = "/home/z/my-project/screenshots/vlm-cycle-1";
const PROJECT = "/home/z/my-project";

async function waitForServer(timeoutMs = 30000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      if (r.ok || r.status === 308 || r.status === 307) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

const BATCH = process.argv[2] ?? "auth";

type Auth = "demo-brand" | "demo-invest" | "demo-alpha" | "demo-market";
interface R { path: string; name: string; auth?: Auth; mobile?: boolean; wait?: number; }

const BATCHES: Record<string, R[]> = {
  auth: [
    { path: "/atelier/console/brand-monitor", name: "console-brand-monitor", auth: "demo-brand", wait: 8000 },
    { path: "/atelier/console/brand-monitor", name: "console-brand-monitor-mobile", auth: "demo-brand", mobile: true, wait: 6000 },
    { path: "/atelier/agency", name: "agency", auth: "demo-brand", wait: 4000 },
    { path: "/atelier/client-dashboard", name: "client-dashboard", auth: "demo-brand", wait: 4000 },
  ],
  auth2: [
    { path: "/atelier/console/market-competitor", name: "console-market", auth: "demo-market", wait: 8000 },
    { path: "/atelier/console/investment-bank", name: "console-invest", auth: "demo-invest", wait: 8000 },
    { path: "/atelier/console/harch-alpha", name: "console-alpha", auth: "demo-alpha", wait: 8000 },
  ],
  admin: [
    { path: "/atelier/admin-x7k2m9", name: "admin-login" },
  ],
};

const AUTH_EMAILS: Record<Auth, string> = {
  "demo-brand": "demo-brand@harch.atelier",
  "demo-invest": "demo-invest@harch.atelier",
  "demo-alpha": "demo-trader@harch.atelier",
  "demo-market": "demo-compet@harch.atelier",
};

async function login(page: import("playwright").Page, email: string) {
  await page.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => { throw new Error("login page unreachable"); });
  await page.waitForTimeout(3000);
  const emailSel = 'input[type="email"], input[name="email"], input[autocomplete="email"]';
  const pwdSel = 'input[type="password"], input[name="password"], input[autocomplete="current-password"]';
  await page.fill(emailSel, email).catch(() => {});
  await page.fill(pwdSel, "demo").catch(() => {});
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click().catch(() => {});
  else await page.keyboard.press("Enter").catch(() => {});
  await page.waitForURL(/\/atelier(\/console)?/, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(4000);
  const cookies = await page.context().cookies();
  const hasSession = cookies.some(c => c.name.includes("session") || c.name.includes("next-auth"));
  if (!hasSession) console.log("  WARN: no session cookie after login");
  else console.log("  session cookie set");
}

// One shared browser context per auth role — login once, capture all
// routes for that role in the same context (cookies persist).
async function captureAuthBatch(browser: import("playwright").Browser, auth: Auth, specs: R[], ensureServer: () => Promise<void>) {
  const vp = { width: 1920, height: 1080 };
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  // 1. Login once in this context
  console.log(`\n--- login as ${auth} ---`);
  try {
    await ensureServer();
    await login(page, AUTH_EMAILS[auth]);
  } catch (err) {
    console.error(`login failed: ${err instanceof Error ? err.message : err}`);
    await ctx.close();
    return specs.map(s => ({ name: s.name, ok: false, err: "login failed" }));
  }

  const results: Array<{ name: string; ok: boolean; err?: string }> = [];
  // 2. Capture all routes for this role in the SAME context
  for (const spec of specs) {
    if (spec.auth !== auth) continue;
    try {
      // Ensure server is alive before each navigation (sandbox OOMs Turbopack)
      await ensureServer();
      // Navigate within the authenticated context
      const resp = await page.goto(`${BASE}${spec.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      if (spec.wait) await page.waitForTimeout(spec.wait);
      await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});

      const currentUrl = page.url();
      if (currentUrl.includes("/login")) {
        throw new Error("bounced to login");
      }

      // For mobile variant, resize the same page
      if (spec.mobile) {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(2000);
      }

      const status = resp?.status() ?? 0;
      await page.screenshot({ path: `${OUT}/${spec.name}.png`, fullPage: true });
      const size = execSync(`stat -c %s ${OUT}/${spec.name}.png`).toString().trim();
      console.log(`OK  ${spec.name.padEnd(35)} ${status}  ${size}B  ${currentUrl.replace(BASE, "")}`);
      results.push({ name: spec.name, ok: true });

      // Reset viewport for next capture
      if (spec.mobile) {
        await page.setViewportSize({ width: 1920, height: 1080 });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 150) : String(err);
      console.error(`ERR ${spec.name.padEnd(35)} ${msg}`);
      results.push({ name: spec.name, ok: false, err: msg });
    }
  }

  await ctx.close();
  return results;
}

(async () => {
  // 1. Kill any stale server
  try { execSync("pkill -9 -f next-server", { stdio: "ignore" }); } catch {}
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Spawn dev server (re-spawnable — sandbox OOMs Turbopack under load)
  let server: import("child_process").ChildProcess | null = null;
  function spawnServer() {
    try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
    console.log("(re)spawning dev server (NODE_OPTIONS=4096)...");
    server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
      cwd: PROJECT,
      env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
      stdio: "ignore",
      detached: false,
    });
  }
  async function ensureServer() {
    // Quick health check — if server is dead, respawn
    try {
      const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) });
      if (r.ok || r.status === 308) return; // alive
    } catch {}
    // Server is dead — respawn and wait
    spawnServer();
    const ready = await waitForServer(60000);
    if (!ready) throw new Error("server failed to restart");
    console.log("server restarted");
  }

  spawnServer();

  // 3. Wait for server (60s — Turbopack cold start)
  const ready = await waitForServer(60000);
  if (!ready) {
    console.error("Server failed to start within 60s");
    if (server) server.kill("SIGKILL");
    process.exit(1);
  }
  console.log("Server ready. Running capture batch:", BATCH);

  // 4. Pre-warm key routes (cold-compile each route before Playwright hits it)
  console.log("Pre-warming routes (curl cold-compile)...");
  for (const p of ["/atelier/login", "/atelier/console/brand-monitor", "/atelier/console/market-competitor", "/atelier/console/investment-bank", "/atelier/console/harch-alpha", "/atelier/agency", "/atelier/client-dashboard"]) {
    try {
      await ensureServer();
      const t0 = Date.now();
      await fetch(`${BASE}${p}`, { signal: AbortSignal.timeout(60000) });
      console.log(`  warmed ${p} (${Date.now() - t0}ms)`);
    } catch (e) {
      console.log(`  warm failed ${p}: ${e instanceof Error ? e.message.slice(0, 80) : "?"}`);
    }
  }

  // 5. Capture — group by auth role, share context per role
  const routes = BATCHES[BATCH] ?? [];
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results: Array<{ name: string; ok: boolean; err?: string }> = [];

  // Group routes by auth role
  const authGroups = new Map<Auth | "none", R[]>();
  for (const spec of routes) {
    const key = spec.auth ?? "none";
    if (!authGroups.has(key)) authGroups.set(key, []);
    authGroups.get(key)!.push(spec);
  }

  for (const [auth, specs] of authGroups) {
    if (auth === "none") {
      // No-auth routes: fresh context per route
      for (const spec of specs) {
        const ctx = await browser.newContext({ viewport: spec.mobile ? { width: 375, height: 812 } : { width: 1920, height: 1080 } });
        const page = await ctx.newPage();
        page.setDefaultTimeout(30000);
        try {
          await ensureServer();
          const resp = await page.goto(`${BASE}${spec.path}`, { waitUntil: "domcontentloaded", timeout: 45000 });
          if (spec.wait) await page.waitForTimeout(spec.wait);
          await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
          const status = resp?.status() ?? 0;
          await page.screenshot({ path: `${OUT}/${spec.name}.png`, fullPage: true });
          const size = execSync(`stat -c %s ${OUT}/${spec.name}.png`).toString().trim();
          console.log(`OK  ${spec.name.padEnd(35)} ${status}  ${size}B`);
          results.push({ name: spec.name, ok: true });
        } catch (err) {
          const msg = err instanceof Error ? err.message.slice(0, 150) : String(err);
          console.error(`ERR ${spec.name.padEnd(35)} ${msg}`);
          results.push({ name: spec.name, ok: false, err: msg });
        } finally { await ctx.close(); }
      }
    } else {
      // Auth routes: share context, login once
      const batchResults = await captureAuthBatch(browser, auth, specs, ensureServer);
      results.push(...batchResults);
    }
  }
  await browser.close();

  // 6. Kill server
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next-server", { stdio: "ignore" }); } catch {}

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n=== ${BATCH}: ${ok}/${results.length} OK ===`);
  results.filter((r) => !r.ok).forEach((r) => console.log(`  ERR: ${r.name}: ${r.err}`));
})();

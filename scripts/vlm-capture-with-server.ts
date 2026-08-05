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
    { path: "/atelier/console/brand-monitor", name: "console-brand-monitor", auth: "demo-brand", wait: 7000 },
    { path: "/atelier/console/brand-monitor", name: "console-brand-monitor-mobile", auth: "demo-brand", mobile: true, wait: 7000 },
    { path: "/atelier/console/market-competitor", name: "console-market", auth: "demo-market", wait: 7000 },
    { path: "/atelier/console/investment-bank", name: "console-invest", auth: "demo-invest", wait: 7000 },
    { path: "/atelier/console/harch-alpha", name: "console-alpha", auth: "demo-alpha", wait: 7000 },
    { path: "/atelier/agency", name: "agency", auth: "demo-brand", wait: 3000 },
    { path: "/atelier/client-dashboard", name: "client-dashboard", auth: "demo-brand", wait: 3000 },
  ],
  admin: [
    { path: "/atelier/admin-x7k2m9", name: "admin-login" },
  ],
};

const AUTH_EMAILS: Record<Auth, string> = {
  "demo-brand": "demo-brand@harch.atelier",
  "demo-invest": "demo-invest@harch.atelier",
  "demo-alpha": "demo-alpha@harch.atelier",
  "demo-market": "demo-market@harch.atelier",
};

async function login(page: import("playwright").Page, email: string) {
  await page.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"], input[name="email"]', email).catch(() => {});
  await page.fill('input[type="password"], input[name="password"]', "demo").catch(() => {});
  await page.keyboard.press("Enter").catch(() => {});
  await page.waitForURL(/\/atelier(\/console)?/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

async function capture(browser: import("playwright").Browser, spec: R) {
  const vp = spec.mobile ? { width: 375, height: 812 } : { width: 1920, height: 1080 };
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page.setDefaultTimeout(25000);
  try {
    if (spec.auth) await login(page, AUTH_EMAILS[spec.auth]);
    const resp = await page.goto(`${BASE}${spec.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    if (spec.wait) await page.waitForTimeout(spec.wait);
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    const status = resp?.status() ?? 0;
    await page.screenshot({ path: `${OUT}/${spec.name}.png`, fullPage: true });
    const size = execSync(`stat -c %s ${OUT}/${spec.name}.png`).toString().trim();
    console.log(`OK  ${spec.name.padEnd(35)} ${status}  ${size}B`);
    return { name: spec.name, ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 150) : String(err);
    console.error(`ERR ${spec.name.padEnd(35)} ${msg}`);
    return { name: spec.name, ok: false, err: msg };
  } finally { await ctx.close(); }
}

(async () => {
  // 1. Kill any stale server
  try { execSync("pkill -9 -f next-server", { stdio: "ignore" }); } catch {}
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Spawn dev server as a child (keeps it alive in our process tree)
  console.log("Spawning dev server...");
  const server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
    cwd: PROJECT,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=2048" },
    stdio: "ignore",
    detached: false,
  });

  // 3. Wait for server
  const ready = await waitForServer(30000);
  if (!ready) {
    console.error("Server failed to start within 30s");
    server.kill("SIGKILL");
    process.exit(1);
  }
  console.log("Server ready. Running capture batch:", BATCH);

  // 4. Pre-warm key routes
  for (const p of ["/atelier/login"]) {
    try { await fetch(`${BASE}${p}`, { signal: AbortSignal.timeout(30000) }); } catch {}
  }

  // 5. Capture
  const routes = BATCHES[BATCH] ?? [];
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results: Array<{ name: string; ok: boolean; err?: string }> = [];
  for (const spec of routes) results.push(await capture(browser, spec));
  await browser.close();

  // 6. Kill server
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next-server", { stdio: "ignore" }); } catch {}

  const ok = results.filter((r) => r.ok).length;
  console.log(`\n=== ${BATCH}: ${ok}/${results.length} OK ===`);
  results.filter((r) => !r.ok).forEach((r) => console.log(`  ERR: ${r.name}: ${r.err}`));
})();

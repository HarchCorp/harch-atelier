// ═══════════════════════════════════════════════════════════════
//  TRILATERAL CAPTURE — Agent 1 + Agent 2 data collection
//
//  For each target page, captures 3 layers simultaneously:
//    1. API responses (network intercept) → /tmp/trilateral/api-{page}.json
//    2. Screenshot (full page) → screenshots/trilateral/{page}.png
//    3. DOM overflow scan (scrollWidth > clientWidth) → /tmp/trilateral/dom-{page}.json
//
//  Agent 1 reads api-{page}.json + source code → expected-manifest.json
//  Agent 2 reads {page}.png only (BLIND) → visual-telemetry.json
//  Agent 3 reads all 3 → gap report
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { spawn, execSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";

const BASE = "http://127.0.0.1:3000";
const PROJECT = "/home/z/my-project";
const SCREENSHOT_DIR = "/home/z/my-project/screenshots/trilateral";
const DATA_DIR = "/tmp/trilateral";
mkdirSync(SCREENSHOT_DIR, { recursive: true });
mkdirSync(DATA_DIR, { recursive: true });

async function waitForServer(timeoutMs = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      if (r.ok || r.status === 308) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

interface ApiCapture {
  url: string;
  status: number;
  method: string;
  body: unknown;
}

interface DomOverflowHit {
  selector: string;
  tag: string;
  text: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
}

interface PageCapture {
  page: string;
  url: string;
  apiCalls: ApiCapture[];
  domOverflows: DomOverflowHit[];
  screenshotPath: string;
  bodyText: string;
}

async function capturePage(
  browser: import("playwright").Browser,
  page: string,
  url: string,
  auth?: { email: string; password: string },
): Promise<PageCapture> {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(30000);

  const apiCalls: ApiCapture[] = [];

  // Network intercept — capture all API responses
  p.on("response", async (response) => {
    const reqUrl = response.url();
    if (!reqUrl.includes("/api/")) return;
    if (reqUrl.includes("/_next/") || reqUrl.includes("favicon")) return;
    try {
      const body = await response.text().catch(() => null);
      let parsed: unknown = null;
      if (body) {
        try { parsed = JSON.parse(body); } catch { parsed = body.slice(0, 500); }
      }
      apiCalls.push({
        url: reqUrl.replace(BASE, ""),
        status: response.status(),
        method: response.request().method(),
        body: parsed,
      });
    } catch {}
  });

  try {
    // Login if needed
    if (auth) {
      await p.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await p.waitForTimeout(2000);
      await p.fill('input[type="email"]', auth.email);
      await p.fill('input[type="password"]', auth.password);
      const btn = await p.$('button[type="submit"]');
      if (btn) await btn.click();
      await p.waitForURL(/\/atelier/, { timeout: 20000 }).catch(() => {});
      await p.waitForTimeout(2000);
    }

    // Navigate to target page
    await p.goto(`${BASE}${url}`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await p.waitForTimeout(5000); // let widgets fetch
    await p.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});

    // Screenshot
    const screenshotPath = `${SCREENSHOT_DIR}/${page}.png`;
    await p.screenshot({ path: screenshotPath, fullPage: true });

    // DOM overflow scan — find ALL elements where scrollWidth > clientWidth
    const domOverflows = await p.evaluate(() => {
      const hits: DomOverflowHit[] = [];
      const all = Array.from(document.querySelectorAll("*"));
      for (const el of all) {
        const e = el as HTMLElement;
        // Skip script/style/elements with no visual presence
        if (!e.offsetParent && e.tagName !== "BODY") continue;
        const sw = e.scrollWidth;
        const cw = e.clientWidth;
        const sh = e.scrollHeight;
        const ch = e.clientHeight;
        if ((sw > cw && cw > 0) || (sh > ch && ch > 0 && sh > ch + 2)) {
          // Build a selector
          let sel = e.tagName.toLowerCase();
          if (e.id) sel += `#${e.id}`;
          if (e.className && typeof e.className === "string") {
            sel += "." + e.className.split(/\s+/).filter(Boolean).slice(0, 3).join(".");
          }
          hits.push({
            selector: sel,
            tag: e.tagName,
            text: (e.textContent || "").trim().slice(0, 100),
            scrollWidth: sw,
            clientWidth: cw,
            scrollHeight: sh,
            clientHeight: ch,
          });
        }
        if (hits.length >= 50) break; // cap
      }
      return hits;
    });

    // Body text (for Agent 1 to verify data presence)
    const bodyText = await p.evaluate(() => document.body?.innerText?.slice(0, 5000) ?? "");

    await ctx.close();
    return { page, url, apiCalls, domOverflows, screenshotPath, bodyText };
  } catch (err) {
    await ctx.close();
    throw err;
  }
}

(async () => {
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
  await new Promise(r => setTimeout(r, 2000));

  console.log("Spawning dev server...");
  const server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
    cwd: PROJECT,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    stdio: "ignore",
    detached: false,
  });

  const ready = await waitForServer(60000);
  if (!ready) { console.error("Server failed"); server.kill("SIGKILL"); process.exit(1); }
  console.log("Server ready. Starting trilateral capture...\n");

  // Pre-warm routes
  for (const path of ["/atelier/login", "/atelier/pricing", "/atelier/companies/ocp-group", "/atelier/lab/linguistic-matrix"]) {
    try { await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(45000) }); } catch {}
  }

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });

  const targets: Array<{ page: string; url: string; auth?: { email: string; password: string } }> = [
    { page: "pricing", url: "/atelier/pricing" },
    { page: "company-ocp", url: "/atelier/companies/ocp-group" },
    { page: "lab-linguistic", url: "/atelier/lab/linguistic-matrix" },
    { page: "console-brand-monitor", url: "/atelier/console/brand-monitor", auth: { email: "demo-brand@harch.atelier", password: "demo" } },
  ];

  const captures: PageCapture[] = [];
  for (const t of targets) {
    try {
      console.log(`Capturing ${t.page}...`);
      const cap = await capturePage(browser, t.page, t.url, t.auth);
      captures.push(cap);
      // Save API captures
      writeFileSync(`${DATA_DIR}/api-${t.page}.json`, JSON.stringify(cap.apiCalls, null, 2));
      // Save DOM overflow
      writeFileSync(`${DATA_DIR}/dom-${t.page}.json`, JSON.stringify(cap.domOverflows, null, 2));
      // Save body text
      writeFileSync(`${DATA_DIR}/text-${t.page}.txt`, cap.bodyText);
      console.log(`  ✓ ${t.page}: ${cap.apiCalls.length} API calls, ${cap.domOverflows.length} DOM overflows, screenshot ${cap.screenshotPath}`);
    } catch (err) {
      console.error(`  ✗ ${t.page}: ${err instanceof Error ? err.message.slice(0, 100) : err}`);
    }
  }

  await browser.close();
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}

  console.log("\n=== CAPTURE SUMMARY ===");
  for (const c of captures) {
    console.log(`  ${c.page}: ${c.apiCalls.length} APIs | ${c.domOverflows.length} overflows | screenshot saved`);
  }
  console.log(`\nData files in ${DATA_DIR}/`);
  console.log(`Screenshots in ${SCREENSHOT_DIR}/`);
})();

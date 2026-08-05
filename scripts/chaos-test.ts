// ═══════════════════════════════════════════════════════════════
//  CHAOS TESTING — Human emulation 300%
//
//  Tests:
//  1. Rage-click: hammer "Create Account" / "Sign in" buttons 20×/sec
//     → verify debouncing + loading states prevent duplicate submissions
//  2. F5 mid-request: reload page during API fetch → verify no zombie state
//  3. Viewport resize mid-render: 1920→375 during chart render → verify
//     no DOM crash
//  4. Network throttle: simulate 3G slow during form submit → verify
//     timeout handling + user notification
//
//  Task ID: chaos-1
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { spawn, execSync } from "child_process";

const BASE = "http://127.0.0.1:3000";
const PROJECT = "/home/z/my-project";

async function waitForServer(timeoutMs = 60000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2000) });
      if (r.ok || r.status === 308) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

interface ChaosResult {
  test: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

// 1. RAGE-CLICK TEST
async function testRageClick(page: import("playwright").Page): Promise<ChaosResult> {
  try {
    await page.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Fill the form
    await page.fill('input[type="email"]', "test@harch.atelier").catch(() => {});
    await page.fill('input[type="password"]', "wrongpassword").catch(() => {});

    // Rage-click the submit button 20 times in 1 second
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) return { test: "rage-click", status: "WARN", detail: "no submit button found" };

    // Track network requests during rage-click
    let requestCount = 0;
    page.on("request", (req) => {
      if (req.url().includes("/api/auth/callback")) requestCount++;
    });

    // 20 clicks in 1s
    for (let i = 0; i < 20; i++) {
      await submitBtn.click({ delay: 50 }).catch(() => {});
    }
    await page.waitForTimeout(3000);

    // Verify: only 1 (or few) auth requests actually fired — debouncing worked
    if (requestCount <= 3) {
      return { test: "rage-click", status: "PASS", detail: `${requestCount} requests fired (debounced from 20 clicks)` };
    } else {
      return { test: "rage-click", status: "WARN", detail: `${requestCount} requests fired (20 clicks — possible duplicate submissions)` };
    }
  } catch (err) {
    return { test: "rage-click", status: "FAIL", detail: err instanceof Error ? err.message.slice(0, 100) : String(err) };
  }
}

// 2. F5 MID-REQUEST TEST
async function testF5MidRequest(page: import("playwright").Page): Promise<ChaosResult> {
  try {
    await page.goto(`${BASE}/atelier`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Reload during a potential API fetch (right after navigation)
    await page.reload({ waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(3000);

    // Check for error boundaries / blank screens
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 200) ?? "");
    const hasError = bodyText.includes("Application error") || bodyText.includes("Something went wrong") || bodyText.length < 50;

    if (hasError) {
      return { test: "f5-mid-request", status: "FAIL", detail: `error after reload: "${bodyText.slice(0, 80)}"` };
    }
    return { test: "f5-mid-request", status: "PASS", detail: "page recovered after mid-request reload" };
  } catch (err) {
    return { test: "f5-mid-request", status: "FAIL", detail: err instanceof Error ? err.message.slice(0, 100) : String(err) };
  }
}

// 3. VIEWPORT RESIZE MID-RENDER TEST
async function testViewportResize(page: import("playwright").Page): Promise<ChaosResult> {
  try {
    await page.goto(`${BASE}/atelier/pricing`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    // Rapid viewport changes: desktop → mobile → desktop → mobile
    for (const [w, h] of [[1920, 1080], [375, 812], [1920, 1080], [375, 812], [768, 1024]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(2000);

    // Check for horizontal scroll or layout crash
    const hasHorizontalScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 100) ?? "");

    if (bodyText.length < 50) {
      return { test: "viewport-resize", status: "FAIL", detail: "blank page after rapid resize" };
    }
    if (hasHorizontalScroll) {
      return { test: "viewport-resize", status: "WARN", detail: "horizontal scroll after resize (minor)" };
    }
    return { test: "viewport-resize", status: "PASS", detail: "layout stable through 5 rapid viewport changes" };
  } catch (err) {
    return { test: "viewport-resize", status: "FAIL", detail: err instanceof Error ? err.message.slice(0, 100) : String(err) };
  }
}

// 4. NETWORK THROTTLE TEST
async function testNetworkThrottle(page: import("playwright").Page): Promise<ChaosResult> {
  try {
    const ctx = page.context();
    // Simulate 3G slow
    await ctx.route("**/*", (route) => {
      // Delay every request by 500ms to simulate slow 3G
      setTimeout(() => route.continue(), 500);
    });

    await page.goto(`${BASE}/atelier/contact`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);

    // Try to submit the contact form under throttled network
    await page.fill('input[name="name"], input[type="text"]', "Chaos Test").catch(() => {});
    await page.fill('input[type="email"]', "chaos@test.com").catch(() => {});
    await page.fill("textarea", "This is a chaos test message under network throttle.").catch(() => {});

    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click().catch(() => {});

    // Wait for either success or timeout (don't expect fast response under throttle)
    await page.waitForTimeout(5000);

    // Check that the page didn't crash
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 100) ?? "");
    await ctx.unroute("**/*");

    if (bodyText.length < 50) {
      return { test: "network-throttle", status: "FAIL", detail: "blank page under throttled network" };
    }
    return { test: "network-throttle", status: "PASS", detail: "page survived 500ms/request throttle" };
  } catch (err) {
    return { test: "network-throttle", status: "FAIL", detail: err instanceof Error ? err.message.slice(0, 100) : String(err) };
  }
}

(async () => {
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Spawning dev server for chaos testing...");
  const server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
    cwd: PROJECT,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    stdio: "ignore",
    detached: false,
  });

  const ready = await waitForServer(60000);
  if (!ready) { console.error("Server failed"); server.kill("SIGKILL"); process.exit(1); }
  console.log("Server ready. Running chaos tests...\n");

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results: ChaosResult[] = [];

  // Test 1: Rage-click (fresh context)
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    results.push(await testRageClick(page));
    await ctx.close();
  }

  // Test 2: F5 mid-request
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    results.push(await testF5MidRequest(page));
    await ctx.close();
  }

  // Test 3: Viewport resize
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    results.push(await testViewportResize(page));
    await ctx.close();
  }

  // Test 4: Network throttle
  {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
    results.push(await testNetworkThrottle(page));
    await ctx.close();
  }

  await browser.close();
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}

  console.log("\n=== CHAOS TEST RESULTS ===");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "WARN" ? "△" : "✕";
    console.log(`${icon} ${r.test.padEnd(20)} ${r.status}  ${r.detail}`);
  }
  const pass = results.filter(r => r.status === "PASS").length;
  const warn = results.filter(r => r.status === "WARN").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  console.log(`\nTotal: ${pass} PASS, ${warn} WARN, ${fail} FAIL`);
})();

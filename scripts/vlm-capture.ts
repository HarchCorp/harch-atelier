// ═══════════════════════════════════════════════════════════════
//  VLM Capture Pipeline — screenshot every key route, then the VLM
//  agent analyses each PNG for visual defects.
//
//  Runs in the bash namespace so it CAN reach 127.0.0.1:3000
//  (unlike the agent-browser chrome which is network-isolated).
//
//  Task ID: vlm-cycle-1
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:3000";
const OUT_DIR = "/home/z/my-project/screenshots/vlm-cycle-1";
mkdirSync(OUT_DIR, { recursive: true });

interface RouteSpec {
  path: string;
  name: string;
  auth?: "demo-brand" | "demo-invest" | "demo-alpha" | "demo-market" | "admin";
  viewport?: "desktop" | "mobile";
  wait?: number; // ms to wait for network idle / widgets
}

// ─── Route matrix — covers public + auth-gated + dashboards ────────
const ROUTES: RouteSpec[] = [
  // Public landing + marketing
  { path: "/", name: "root-redirect", viewport: "desktop" },
  { path: "/atelier", name: "atelier-home", viewport: "desktop", wait: 3000 },
  { path: "/atelier/pricing", name: "pricing", viewport: "desktop" },
  { path: "/atelier/pricing", name: "pricing-mobile", viewport: "mobile" },
  { path: "/atelier/resilience", name: "resilience", viewport: "desktop" },
  { path: "/atelier/about", name: "about", viewport: "desktop" },
  { path: "/atelier/contact", name: "contact", viewport: "desktop" },
  { path: "/atelier/method", name: "method", viewport: "desktop" },
  { path: "/atelier/trust", name: "trust", viewport: "desktop" },
  { path: "/atelier/customers", name: "customers", viewport: "desktop" },
  { path: "/atelier/solutions", name: "solutions", viewport: "desktop" },
  { path: "/atelier/products", name: "products", viewport: "desktop" },
  { path: "/atelier/resources", name: "resources", viewport: "desktop" },
  { path: "/atelier/insights", name: "insights", viewport: "desktop" },
  { path: "/atelier/news", name: "news", viewport: "desktop" },
  { path: "/atelier/faq", name: "faq", viewport: "desktop" },
  { path: "/atelier/changelog", name: "changelog", viewport: "desktop" },
  { path: "/atelier/compare", name: "compare", viewport: "desktop" },
  { path: "/atelier/harch-100", name: "harch-100", viewport: "desktop" },
  { path: "/atelier/flagship-report", name: "flagship-report", viewport: "desktop" },
  { path: "/atelier/health", name: "health", viewport: "desktop" },
  { path: "/atelier/api-docs", name: "api-docs", viewport: "desktop" },
  { path: "/atelier/access", name: "access", viewport: "desktop" },
  { path: "/atelier/request-access", name: "request-access", viewport: "desktop" },
  { path: "/atelier/onboarding", name: "onboarding", viewport: "desktop" },
  { path: "/atelier/login", name: "login", viewport: "desktop" },
  { path: "/atelier/login", name: "login-mobile", viewport: "mobile" },
  // Lab pages (public demos)
  { path: "/atelier/lab/whatsapp-inbound", name: "lab-whatsapp", viewport: "desktop", wait: 3000 },
  { path: "/atelier/lab/hespress", name: "lab-hespress", viewport: "desktop", wait: 3000 },
  { path: "/atelier/lab/command-center", name: "lab-command-center", viewport: "desktop", wait: 4000 },
  { path: "/atelier/lab/linguistic-matrix", name: "lab-linguistic", viewport: "desktop", wait: 3000 },
  // Companies (public)
  { path: "/atelier/companies/ocp-group", name: "company-ocp", viewport: "desktop", wait: 3000 },
  { path: "/atelier/companies/attijariwafa-bank", name: "company-attijari", viewport: "desktop", wait: 3000 },
  { path: "/atelier/companies/bank-of-africa", name: "company-boa", viewport: "desktop", wait: 3000 },
  { path: "/atelier/companies/maroc-telecom", name: "company-iam", viewport: "desktop", wait: 3000 },
  { path: "/atelier/companies/royal-air-maroc", name: "company-ram", viewport: "desktop", wait: 3000 },
  // Industries
  { path: "/atelier/industries/banking", name: "industry-banking", viewport: "desktop" },
  { path: "/atelier/industries/telecom", name: "industry-telecom", viewport: "desktop" },
  { path: "/atelier/industries/energy", name: "industry-energy", viewport: "desktop" },
  { path: "/atelier/industries/aviation", name: "industry-aviation", viewport: "desktop" },
  // Expertise
  { path: "/atelier/expertise/reputation-risk", name: "expertise-rep-risk", viewport: "desktop" },
  { path: "/atelier/expertise/esg", name: "expertise-esg", viewport: "desktop" },
  // Console dashboards (need auth)
  { path: "/atelier/console/brand-monitor", name: "console-brand-monitor", auth: "demo-brand", viewport: "desktop", wait: 8000 },
  { path: "/atelier/console/brand-monitor", name: "console-brand-monitor-mobile", auth: "demo-brand", viewport: "mobile", wait: 8000 },
  { path: "/atelier/console/market-competitor", name: "console-market", auth: "demo-market", viewport: "desktop", wait: 8000 },
  { path: "/atelier/console/investment-bank", name: "console-invest", auth: "demo-invest", viewport: "desktop", wait: 8000 },
  { path: "/atelier/console/harch-alpha", name: "console-alpha", auth: "demo-alpha", viewport: "desktop", wait: 8000 },
  // Agency + admin
  { path: "/atelier/agency", name: "agency", auth: "demo-brand", viewport: "desktop", wait: 3000 },
  { path: "/atelier/client-dashboard", name: "client-dashboard", auth: "demo-brand", viewport: "desktop", wait: 3000 },
  // Admin (separate login)
  { path: "/atelier/admin-x7k2m9", name: "admin-login", viewport: "desktop" },
];

const AUTH_EMAILS: Record<NonNullable<RouteSpec["auth"]>, string> = {
  "demo-brand": "demo-brand@harch.atelier",
  "demo-invest": "demo-invest@harch.atelier",
  "demo-alpha": "demo-alpha@harch.atelier",
  "demo-market": "demo-market@harch.atelier",
  "admin": "admin@harch.ma",
};
const DEMO_PWD = "demo";

async function loginDemo(page: import("playwright").Page, email: string) {
  // Navigate to login page, fill the form, submit.
  await page.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);
  // The login form has email + password fields. Use a broad selector.
  const emailSel = 'input[type="email"], input[name="email"], input[autocomplete="email"]';
  const pwdSel = 'input[type="password"], input[name="password"], input[autocomplete="current-password"]';
  await page.fill(emailSel, email).catch(() => {});
  await page.fill(pwdSel, DEMO_PWD).catch(() => {});
  // Submit
  await page.keyboard.press("Enter").catch(() => {});
  // Wait for redirect to /atelier or /atelier/console
  await page.waitForURL(/\/atelier(\/console)?/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function captureRoute(browser: import("playwright").Browser, spec: RouteSpec): Promise<{ name: string; status: "ok" | "error"; error?: string }> {
  const viewport = spec.viewport === "mobile" ? { width: 375, height: 812 } : { width: 1920, height: 1080 };
  const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true });
  const page = await context.newPage();
  page.setDefaultTimeout(45000);
  page.setDefaultNavigationTimeout(45000);

  try {
    if (spec.auth) {
      await loginDemo(page, AUTH_EMAILS[spec.auth]);
    }
    const url = `${BASE}${spec.path}`;
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    if (spec.wait) await page.waitForTimeout(spec.wait);
    // Try to wait for network idle (widgets that fetch)
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

    const status = resp?.status() ?? 0;
    const file = `${OUT_DIR}/${spec.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(`OK  ${spec.name.padEnd(35)} ${status} → ${file}`);
    return { name: spec.name, status: "ok" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`ERR ${spec.name.padEnd(35)} ${msg.slice(0, 200)}`);
    // Still try to screenshot the error state
    try {
      await page.screenshot({ path: `${OUT_DIR}/${spec.name}-error.png`, fullPage: true });
    } catch {}
    return { name: spec.name, status: "error", error: msg };
  } finally {
    await context.close();
  }
}

(async () => {
  console.log(`VLM capture — ${ROUTES.length} routes → ${OUT_DIR}`);
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results: Array<{ name: string; status: "ok" | "error"; error?: string }> = [];
  // Sequential (Next.js cold compiles each route on first hit; parallel overloads it)
  for (const spec of ROUTES) {
    const r = await captureRoute(browser, spec);
    results.push(r);
  }
  await browser.close();
  const ok = results.filter((r) => r.status === "ok").length;
  const err = results.filter((r) => r.status === "error").length;
  console.log(`\n=== SUMMARY ===`);
  console.log(`OK: ${ok} / ${results.length}`);
  console.log(`ERR: ${err} / ${results.length}`);
  if (err > 0) {
    console.log(`\nErrors:`);
    results.filter((r) => r.status === "error").forEach((r) => console.log(`  - ${r.name}: ${r.error?.slice(0, 150)}`));
  }
})();

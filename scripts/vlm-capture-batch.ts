// VLM capture — batch mode (smaller scope per run)
// Usage: bunx tsx scripts/vlm-capture-batch.ts <batch-name>
// batch-name: "public" | "companies" | "auth" | "dashboards"
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = "http://127.0.0.1:3000";
const OUT_DIR = "/home/z/my-project/screenshots/vlm-cycle-1";
mkdirSync(OUT_DIR, { recursive: true });

type Auth = "demo-brand" | "demo-invest" | "demo-alpha" | "demo-market";
interface R { path: string; name: string; auth?: Auth; mobile?: boolean; wait?: number; }

const BATCHES: Record<string, R[]> = {
  public: [
    { path: "/", name: "root" },
    { path: "/atelier", name: "atelier-home", wait: 2000 },
    { path: "/atelier/pricing", name: "pricing" },
    { path: "/atelier/pricing", name: "pricing-mobile", mobile: true },
    { path: "/atelier/resilience", name: "resilience" },
    { path: "/atelier/about", name: "about" },
    { path: "/atelier/contact", name: "contact" },
    { path: "/atelier/method", name: "method" },
    { path: "/atelier/trust", name: "trust" },
    { path: "/atelier/customers", name: "customers" },
    { path: "/atelier/solutions", name: "solutions" },
    { path: "/atelier/products", name: "products" },
    { path: "/atelier/resources", name: "resources" },
    { path: "/atelier/insights", name: "insights" },
    { path: "/atelier/faq", name: "faq" },
    { path: "/atelier/harch-100", name: "harch-100" },
    { path: "/atelier/login", name: "login" },
    { path: "/atelier/login", name: "login-mobile", mobile: true },
  ],
  companies: [
    { path: "/atelier/companies/ocp-group", name: "company-ocp", wait: 2000 },
    { path: "/atelier/companies/attijariwafa-bank", name: "company-attijari", wait: 2000 },
    { path: "/atelier/companies/bank-of-africa", name: "company-boa", wait: 2000 },
    { path: "/atelier/companies/maroc-telecom", name: "company-iam", wait: 2000 },
    { path: "/atelier/companies/royal-air-maroc", name: "company-ram", wait: 2000 },
    { path: "/atelier/industries/banking", name: "industry-banking" },
    { path: "/atelier/industries/telecom", name: "industry-telecom" },
    { path: "/atelier/industries/energy", name: "industry-energy" },
    { path: "/atelier/expertise/reputation-risk", name: "expertise-rep-risk" },
    { path: "/atelier/expertise/esg", name: "expertise-esg" },
    { path: "/atelier/lab/whatsapp-inbound", name: "lab-whatsapp", wait: 2000 },
    { path: "/atelier/lab/hespress", name: "lab-hespress", wait: 2000 },
    { path: "/atelier/lab/command-center", name: "lab-command-center", wait: 3000 },
    { path: "/atelier/lab/linguistic-matrix", name: "lab-linguistic", wait: 2000 },
  ],
  auth: [
    { path: "/atelier/console/brand-monitor", name: "console-brand", auth: "demo-brand", wait: 6000 },
    { path: "/atelier/console/brand-monitor", name: "console-brand-mobile", auth: "demo-brand", mobile: true, wait: 6000 },
    { path: "/atelier/console/market-competitor", name: "console-market", auth: "demo-market", wait: 6000 },
    { path: "/atelier/console/investment-bank", name: "console-invest", auth: "demo-invest", wait: 6000 },
    { path: "/atelier/console/harch-alpha", name: "console-alpha", auth: "demo-alpha", wait: 6000 },
    { path: "/atelier/agency", name: "agency", auth: "demo-brand", wait: 2000 },
    { path: "/atelier/client-dashboard", name: "client-dashboard", auth: "demo-brand", wait: 2000 },
  ],
};

const AUTH_EMAILS: Record<Auth, string> = {
  "demo-brand": "demo-brand@harch.atelier",
  "demo-invest": "demo-invest@harch.atelier",
  "demo-alpha": "demo-alpha@harch.atelier",
  "demo-market": "demo-market@harch.atelier",
};
const DEMO_PWD = "demo";

async function login(page: import("playwright").Page, email: string) {
  await page.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);
  await page.fill('input[type="email"], input[name="email"]', email).catch(() => {});
  await page.fill('input[type="password"], input[name="password"]', DEMO_PWD).catch(() => {});
  await page.keyboard.press("Enter").catch(() => {});
  await page.waitForURL(/\/atelier(\/console)?/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function capture(browser: import("playwright").Browser, spec: R) {
  const vp = spec.mobile ? { width: 375, height: 812 } : { width: 1920, height: 1080 };
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  try {
    if (spec.auth) await login(page, AUTH_EMAILS[spec.auth]);
    const resp = await page.goto(`${BASE}${spec.path}`, { waitUntil: "domcontentloaded", timeout: 35000 });
    if (spec.wait) await page.waitForTimeout(spec.wait);
    await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
    const status = resp?.status() ?? 0;
    await page.screenshot({ path: `${OUT_DIR}/${spec.name}.png`, fullPage: true });
    console.log(`OK  ${spec.name.padEnd(30)} ${status}`);
    return { name: spec.name, ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 120) : String(err);
    console.error(`ERR ${spec.name.padEnd(30)} ${msg}`);
    try { await page.screenshot({ path: `${OUT_DIR}/${spec.name}-err.png`, fullPage: true }); } catch {}
    return { name: spec.name, ok: false, err: msg };
  } finally { await ctx.close(); }
}

const batchName = process.argv[2] ?? "public";
const routes = BATCHES[batchName] ?? [];
console.log(`VLM batch="${batchName}" — ${routes.length} routes`);

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const results: Array<{ name: string; ok: boolean; err?: string }> = [];
  for (const spec of routes) results.push(await capture(browser, spec));
  await browser.close();
  const ok = results.filter((r) => r.ok).length;
  console.log(`\n=== ${batchName}: ${ok}/${results.length} OK ===`);
  if (results.some((r) => !r.ok)) {
    console.log("Errors:");
    results.filter((r) => !r.ok).forEach((r) => console.log(`  - ${r.name}: ${r.err}`));
  }
})();

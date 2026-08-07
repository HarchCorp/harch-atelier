// Capture screenshots with server spawned as child (survives sandbox OOM)
import { chromium } from "playwright";
import { spawn, execSync } from "child_process";

const BASE = "http://127.0.0.1:3000";
const PROJECT = "/home/z/my-project";
const OUT = "/home/z/my-project/screenshots/vlm-final";

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

(async () => {
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
  await new Promise(r => setTimeout(r, 2000));

  console.log("Spawning server...");
  const server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
    cwd: PROJECT,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    stdio: "ignore", detached: false,
  });

  const ready = await waitForServer(60000);
  if (!ready) { console.error("Server failed"); server.kill("SIGKILL"); process.exit(1); }
  console.log("Server ready. Capturing screenshots...\n");

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const pages = [
    { url: "/atelier", name: "home", wait: 3000 },
    { url: "/atelier/pricing", name: "pricing", wait: 2000 },
    { url: "/atelier/companies/ocp-group", name: "company-ocp", wait: 4000 },
    { url: "/atelier/lab", name: "lab-index", wait: 2000 },
    { url: "/atelier/lab/polymorphic", name: "polymorphic", wait: 3000 },
    { url: "/atelier/login", name: "login", wait: 2000 },
    { url: "/atelier/about", name: "about", wait: 2000 },
    { url: "/atelier/contact", name: "contact", wait: 2000 },
    { url: "/atelier/resilience", name: "resilience", wait: 3000 },
    { url: "/atelier/industries/banking", name: "industry-banking", wait: 2000 },
  ];

  for (const p of pages) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${p.url}`, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(p.wait);
      await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
      await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
      const size = execSync(`stat -c %s ${OUT}/${p.name}.png`).toString().trim();
      console.log(`✓ ${p.name.padEnd(20)} ${size}B`);
    } catch (e) {
      console.log(`✗ ${p.name}: ${e instanceof Error ? e.message.slice(0, 80) : e}`);
    }
    await ctx.close();
  }

  await browser.close();
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
  console.log("\nDone. Screenshots in " + OUT);
})();

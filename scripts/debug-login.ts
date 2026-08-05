// Debug login flow — spawn server, inspect login page, attempt login
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

(async () => {
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
  await new Promise((r) => setTimeout(r, 2000));

  console.log("Spawning dev server...");
  const server = spawn("node", ["node_modules/.bin/next", "dev", "-p", "3000"], {
    cwd: PROJECT,
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
    stdio: "ignore",
    detached: false,
  });

  const ready = await waitForServer(60000);
  if (!ready) { console.error("Server failed"); server.kill("SIGKILL"); process.exit(1); }
  console.log("Server ready");

  const b = await chromium.launch({ args: ["--no-sandbox"] });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(25000);

  // 1. Load login page
  await p.goto(`${BASE}/atelier/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await p.waitForTimeout(3000);
  console.log("login page url:", p.url());

  // 2. Inspect form
  const inputs = await p.$$eval("input", els => els.map(e => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, autocomplete: e.autocomplete, visible: e.offsetParent !== null })));
  console.log("inputs:", JSON.stringify(inputs, null, 2));

  const buttons = await p.$$eval("button", els => els.map(e => ({ type: e.type, text: e.textContent?.trim().slice(0, 50), visible: e.offsetParent !== null })));
  console.log("buttons:", JSON.stringify(buttons.slice(0, 15), null, 2));

  // 3. Try login with demo-brand
  console.log("\n--- attempting login ---");
  const emailInput = await p.$('input[type="email"], input[name="email"]');
  const pwdInput = await p.$('input[type="password"]');
  console.log("email input found:", !!emailInput);
  console.log("pwd input found:", !!pwdInput);

  if (emailInput && pwdInput) {
    await emailInput.fill("demo-brand@harch.atelier");
    await pwdInput.fill("demo");
    console.log("filled credentials");

    // Find submit button
    const submitBtn = await p.$('button[type="submit"]') || await p.$('button:not([type="button"])');
    console.log("submit button found:", !!submitBtn);

    if (submitBtn) {
      await submitBtn.click();
      console.log("clicked submit");
    } else {
      await p.keyboard.press("Enter");
      console.log("pressed Enter");
    }

    // Wait for navigation
    await p.waitForTimeout(5000);
    console.log("url after login:", p.url());

    // Check for error messages
    const errors = await p.$$eval("[role=alert], .error, [class*=error]", els => els.map(e => e.textContent?.trim().slice(0, 100)));
    console.log("error messages:", JSON.stringify(errors.filter(Boolean)));

    await p.screenshot({ path: "/tmp/login-result.png" });
    console.log("screenshot saved to /tmp/login-result.png");
  }

  await b.close();
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}
})();

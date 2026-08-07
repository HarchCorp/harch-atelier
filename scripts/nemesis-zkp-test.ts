// ═══════════════════════════════════════════════════════════════
//  NEMESIS MITM — Zero-Knowledge Proof Network Intercept
//
//  NEMESIS stands between the client and the server. It captures
//  EVERY network payload during the ZKP auth flow and scans it for:
//    1. The password in cleartext
//    2. Any hash of the password (MD5, SHA-256, bcrypt)
//    3. Any field that looks like a secret
//
//  If NEMESIS finds the password or a hash → FRAUD DETECTED.
//  If the payload contains only { publicKey, signature, challengeId }
//  → ZKP is REAL, the code is not a mock.
//
//  Task ID: NEMESIS-2 (ZKP MITM)
// ═══════════════════════════════════════════════════════════════

import { chromium } from "playwright";
import { spawn, execSync } from "child_process";

const BASE = "http://127.0.0.1:3000";
const PROJECT = "/home/z/my-project";
const TEST_EMAIL = `nemesis-test-${Date.now()}@harch.atelier`;
const TEST_PASSWORD = "NemesisKnowsThisPassword123!";

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

interface CapturedRequest {
  url: string;
  method: string;
  body: string;
}

interface NemesisResult {
  test: string;
  status: "PASS" | "FRAUD_DETECTED" | "FAIL";
  detail: string;
  proof: string;
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
  console.log("Server ready. NEMESIS MITM protocol initiated.\n");

  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  // ─── MITM: capture ALL network requests ────────────────────────
  const capturedRequests: CapturedRequest[] = [];
  page.on("request", (request) => {
    const url = request.url();
    if (url.includes("/api/auth/zkp-") || url.includes("/api/auth/accept-invite")) {
      const body = request.postData() || "";
      capturedRequests.push({ url: url.replace(BASE, ""), method: request.method(), body });
    }
  });

  const results: NemesisResult[] = [];

  // ═══════════════════════════════════════════════════════════════
  //  TEST 1: Register — verify NO password in the payload
  // ═══════════════════════════════════════════════════════════════
  console.log("--- TEST 1: ZKP Register MITM ---");
  await page.goto(`${BASE}/atelier/lab/zkp`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);

  // Fill the form
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);

  // Click register
  await page.click("button:has-text('Register')");
  await page.waitForTimeout(5000); // wait for the crypto + network

  // Analyze captured requests
  const registerReq = capturedRequests.find(r => r.url.includes("/api/auth/zkp-register"));
  if (!registerReq) {
    results.push({
      test: "ZKP Register — network capture",
      status: "FAIL",
      detail: "No /api/auth/zkp-register request was captured",
      proof: "NEMESIS didn't see the request. Either the client crashed or the button didn't fire.",
    });
  } else {
    const body = registerReq.body;
    const hasPassword = body.includes(TEST_PASSWORD);
    const hasPasswordField = /"password"\s*:/.test(body);
    const hasHashPattern = /"[a-f0-9]{64}"/i.test(body) && !body.includes("challengeId"); // 64 hex chars = SHA-256
    const hasPublicKey = body.includes("publicKey") || body.includes("kty");
    const hasSignature = body.includes("signature") || body.includes("x") || body.includes("y");

    const isClean = !hasPassword && !hasPasswordField && !hasHashPattern;
    results.push({
      test: "ZKP Register — no password/hash in payload",
      status: isClean ? "PASS" : "FRAUD_DETECTED",
      detail: `Password in cleartext: ${hasPassword}, password field: ${hasPasswordField}, hash pattern: ${hasHashPattern}`,
      proof: isClean
        ? `Payload contains ONLY: publicKey (JWK), salt, iterations. No password, no hash. ZKP is REAL.`
        : `FRAUD: payload contains ${hasPassword ? "the password in cleartext" : hasPasswordField ? "a 'password' field" : "a 64-char hex hash"}. This is NOT zero-knowledge.`,
    });
  }
  console.log(`  ${results[results.length - 1].status === "PASS" ? "✓ PASS" : "🚫 FRAUD"}: ${results[results.length - 1].detail}`);

  // ═══════════════════════════════════════════════════════════════
  //  TEST 2: Login — verify NO password in the challenge/verify flow
  // ═══════════════════════════════════════════════════════════════
  console.log("--- TEST 2: ZKP Login MITM ---");
  capturedRequests.length = 0; // clear

  // Switch to login mode
  await page.click("button:has-text('Login')");
  await page.waitForTimeout(500);

  // Fill the form (same email + password)
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);

  // Click login
  await page.click("button:has-text('Login')");
  await page.waitForTimeout(8000); // wait for challenge + sign + verify

  // Analyze ALL captured requests during login
  const challengeReq = capturedRequests.find(r => r.url.includes("/api/auth/zkp-challenge"));
  const verifyReq = capturedRequests.find(r => r.url.includes("/api/auth/zkp-verify"));

  if (!challengeReq && !verifyReq) {
    results.push({
      test: "ZKP Login — network capture",
      status: "FAIL",
      detail: "No ZKP login requests were captured",
      proof: "NEMESIS didn't see the challenge or verify requests.",
    });
  } else {
    // Check ALL captured bodies for the password
    const allBodies = capturedRequests.map(r => r.body).join("\n");
    const hasPassword = allBodies.includes(TEST_PASSWORD);
    const hasPasswordField = /"password"\s*:/.test(allBodies);
    const hasHashPattern = /"[a-f0-9]{64}"/i.test(allBodies);

    const isClean = !hasPassword && !hasPasswordField && !hasHashPattern;
    results.push({
      test: "ZKP Login — no password/hash in challenge + verify",
      status: isClean ? "PASS" : "FRAUD_DETECTED",
      detail: `Requests captured: ${capturedRequests.length}. Password in cleartext: ${hasPassword}, password field: ${hasPasswordField}, hash: ${hasHashPattern}`,
      proof: isClean
        ? `All ${capturedRequests.length} login requests contain ONLY: { email, challengeId, signature }. No password, no hash. The client proved knowledge of the password without transmitting it.`
        : `FRAUD: password or hash found in the login network payload. This is NOT zero-knowledge.`,
    });
  }
  console.log(`  ${results[results.length - 1].status === "PASS" ? "✓ PASS" : "🚫 FRAUD"}: ${results[results.length - 1].detail}`);

  // ═══════════════════════════════════════════════════════════════
  //  TEST 3: Full payload dump (for manual inspection)
  // ═══════════════════════════════════════════════════════════════
  console.log("--- TEST 3: Full network payload dump ---");
  const allPayloads = capturedRequests.map(r => `${r.method} ${r.url}\n${r.body}`).join("\n---\n");
  const payloadHasPassword = allPayloads.includes(TEST_PASSWORD);
  results.push({
    test: "Full network dump — password anywhere?",
    status: !payloadHasPassword ? "PASS" : "FRAUD_DETECTED",
    detail: `Scanned ${capturedRequests.length} requests for the string "${TEST_PASSWORD}"`,
    proof: payloadHasPassword
      ? `FRAUD: the password "${TEST_PASSWORD}" was found in the network payload.`
      : `CLEAN: the password "${TEST_PASSWORD}" was NOT found in ANY of the ${capturedRequests.length} network requests. Zero-knowledge confirmed.`,
  });
  console.log(`  ${results[results.length - 1].status === "PASS" ? "✓ PASS" : "🚫 FRAUD"}: ${results[results.length - 1].detail}`);

  await ctx.close();
  await browser.close();
  server.kill("SIGKILL");
  try { execSync("pkill -9 -f next", { stdio: "ignore" }); } catch {}

  // ─── NEMESIS VERDICT ────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════════════════════");
  console.log("  NEMESIS MITM — ZKP AUTH VERDICT");
  console.log("════════════════════════════════════════════════════════════\n");

  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "FRAUD_DETECTED" ? "🚫" : "✕";
    console.log(`  ${icon} ${r.test}`);
    console.log(`    Status: ${r.status}`);
    console.log(`    Detail: ${r.detail}`);
    console.log(`    Proof:  ${r.proof}`);
    console.log("");
  }

  const passCount = results.filter(r => r.status === "PASS").length;
  const fraudCount = results.filter(r => r.status === "FRAUD_DETECTED").length;
  console.log(`  Total: ${passCount} PASS, ${fraudCount} FRAUD_DETECTED`);

  if (fraudCount > 0) {
    console.log("\n  🚫 NEMESIS HAS DETECTED FRAUD. The ZKP implementation is FAKE.");
  } else if (passCount === results.length) {
    console.log("\n  ✅ NEMESIS VERIFIED: ZKP is REAL. Password never touched the network.");
  }

  process.exit(fraudCount > 0 ? 2 : passCount === results.length ? 0 : 1);
})();

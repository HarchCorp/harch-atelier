// ═══════════════════════════════════════════════════════════════
//  /api/console/mcp/test
//
//  Real connection validation for SIEM connectors (Splunk / QRadar /
//  Microsoft Sentinel) — replaces the legacy Math.random() lie.
//
//  P2-8-MCP-REAL — VORTEX (Principal Systems & Security Engineer).
//
//  ─── POST ──────────────────────────────────────────────────────
//  Body: {
//    connector:  "splunk" | "qradar" | "sentinel",
//    endpoint:   string  (HTTPS URL — for Splunk, full HEC URL),
//    authToken:  string  (HEC token for Splunk, API key for others)
//  }
//
//  Splunk path — REAL HTTP Event Collector probe:
//    • POST {sourcetype:"harchiq_test", event:{test:true, ts: now}}
//      to the HEC URL (endpoint normalised: if it does not already
//      end with /services/collector, the suffix is appended).
//    • Headers: Authorization: Bearer ${authToken},
//               Content-Type: application/json
//    • Timeout: 10s (AbortSignal.timeout)
//    • 2xx → { success: true, latency, eventsSynced: 1 }
//    • non-2xx → { success: false, error: `${status} ${statusText}` }
//    • network error / timeout → { success: false, error: <reason> }
//
//  QRadar / Sentinel path — validation-only (no creds to actually
//  call the SIEM API without risking side effects):
//    • endpoint must parse as URL with protocol === "https:"
//    • authToken length must be > 20
//    • On success → { success: true, latency: 0, eventsSynced: 0,
//                     validated: "url+token" }
//    • On failure → { success: false, error: <reason> }
//
//  Auth: requires session with accountType ∈ {enterprise, agency}
//  (admins bypass — see isAccountTypeAllowed).
//
//  Audit: every call writes an AuditLog row:
//    • action   = "mcp_test"
//    • resource = connector
//    • result   = "success" | "failure"
//    • metadata = { connector, endpoint, latencyMs, eventsSynced,
//                   validated, error }
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { isAccountTypeAllowed } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/logger";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["enterprise", "agency", "investment-bank", "harch-alpha"] as const;

const TIMEOUT_MS = 10_000;
const MIN_TOKEN_LEN = 20;
const VALID_CONNECTORS = new Set(["splunk", "qradar", "sentinel"]);

interface TestRequestBody {
  connector?: unknown;
  endpoint?: unknown;
  authToken?: unknown;
}

interface TestResult {
  success: boolean;
  latency: number;
  eventsSynced: number;
  validated?: "url+token" | "hec-probe";
  error?: string;
}

/** Normalise the Splunk HEC URL — append /services/collector if missing. */
function normaliseHecUrl(endpoint: string): string {
  const trimmed = endpoint.trim();
  if (/\/services\/collector\/?$/i.test(trimmed)) return trimmed.replace(/\/+$/, "");
  if (/\/$/.test(trimmed)) return `${trimmed}services/collector`;
  return `${trimmed}/services/collector`;
}

/** Validate that a string is a well-formed HTTPS URL. */
function isValidHttpsUrl(raw: string): { ok: boolean; reason?: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "URL invalide — format attendu : https://…" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "Protocole non sécurisé — HTTPS requis" };
  }
  if (!parsed.hostname || !parsed.hostname.includes(".")) {
    return { ok: false, reason: "Nom d'hôte manquant ou incomplet" };
  }
  return { ok: true };
}

/** Splunk HEC probe — POST a small test event with the bearer token. */
async function probeSplunkHec(endpoint: string, authToken: string): Promise<TestResult> {
  const url = normaliseHecUrl(endpoint);
  const urlCheck = isValidHttpsUrl(url);
  if (!urlCheck.ok) {
    return { success: false, latency: 0, eventsSynced: 0, error: urlCheck.reason };
  }
  if (authToken.length <= MIN_TOKEN_LEN) {
    return {
      success: false,
      latency: 0,
      eventsSynced: 0,
      error: `Token HEC trop court (${authToken.length} caractères — minimum ${MIN_TOKEN_LEN + 1})`,
    };
  }

  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "Authorization": `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sourcetype: "harchiq_test",
        event: { test: true, ts: new Date().toISOString() },
      }),
    });
    const latency = Date.now() - t0;
    if (res.ok) {
      return {
        success: true,
        latency,
        eventsSynced: 1,
        validated: "hec-probe",
      };
    }
    // 4xx/5xx —Splunk HEC returns JSON like {"text":"Invalid token","code":4}
    let splunkErr = `${res.status} ${res.statusText}`.trim();
    try {
      const body = (await res.json()) as { text?: string; code?: number };
      if (body?.text) splunkErr = `${res.status} ${body.text}`;
    } catch {
      // Body wasn't JSON — fall back to status text.
    }
    return {
      success: false,
      latency,
      eventsSynced: 0,
      error: splunkErr,
    };
  } catch (err) {
    const latency = Date.now() - t0;
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      success: false,
      latency,
      eventsSynced: 0,
      error: isTimeout
        ? `Timeout — aucune réponse sous ${TIMEOUT_MS / 1000}s`
        : `Échec réseau — ${err instanceof Error ? err.message : "erreur inconnue"}`,
    };
  }
}

/** QRadar / Sentinel — validation-only (we don't have a safe no-op probe). */
function validateQradarSentinel(endpoint: string, authToken: string): TestResult {
  const urlCheck = isValidHttpsUrl(endpoint);
  if (!urlCheck.ok) {
    return { success: false, latency: 0, eventsSynced: 0, error: urlCheck.reason };
  }
  if (authToken.length <= MIN_TOKEN_LEN) {
    return {
      success: false,
      latency: 0,
      eventsSynced: 0,
      error: `Token trop court (${authToken.length} caractères — minimum ${MIN_TOKEN_LEN + 1})`,
    };
  }
  return {
    success: true,
    latency: 0,
    eventsSynced: 0,
    validated: "url+token",
  };
}

// ─── POST ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAccountTypeAllowed(session, [...ALLOWED_TYPES])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: TestRequestBody;
  try {
    body = (await req.json()) as TestRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const connector = typeof body.connector === "string" ? body.connector : "";
  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  const authToken = typeof body.authToken === "string" ? body.authToken : "";

  if (!VALID_CONNECTORS.has(connector)) {
    return NextResponse.json(
      { error: "connector must be 'splunk', 'qradar' or 'sentinel'" },
      { status: 400 },
    );
  }
  if (!endpoint || !authToken) {
    return NextResponse.json(
      { error: "endpoint and authToken are required" },
      { status: 400 },
    );
  }

  let result: TestResult;
  if (connector === "splunk") {
    result = await probeSplunkHec(endpoint, authToken);
  } else {
    result = validateQradarSentinel(endpoint, authToken);
  }

  // Append-only audit trail — fire and forget (don't block response on it).
  const auditAction = "mcp_test";
  const auditResource = connector;
  const auditResult = result.success ? "success" : "failure";
  try {
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: auditAction,
        resource: auditResource,
        result: auditResult,
        metadata: {
          connector,
          endpoint,
          latencyMs: result.latency,
          eventsSynced: result.eventsSynced,
          validated: result.validated ?? null,
          error: result.error ?? null,
          decidedBy: (session.user.name ?? session.user.email ?? "—").slice(0, 120),
        },
      },
    });
  } catch (err) {
    // Audit failure must NOT mask the actual test result.
    logError("console.mcp.test.audit", `[mcp/test POST] audit write failed: ${err}`);
  }

  return NextResponse.json(result, { status: result.success ? 200 : 502 });
}

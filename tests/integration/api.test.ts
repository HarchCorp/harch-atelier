// ═══════════════════════════════════════════════════════════════
//  API INTEGRATION TESTS — Harch Atelier
//
//  Tests the critical API endpoints return correct data shapes.
//  These tests hit the real dev server (must be running on :3000).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeAll } from "vitest";

const BASE = "http://localhost:3000";
const TIMEOUT = 30000;

async function fetchJson(path: string): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE}${path}`, { signal: AbortSignal.timeout(TIMEOUT) });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

describe("Public API endpoints", () => {
  beforeAll(() => {
    // Dev server must be running
  });

  it("GET /api/flagship-report returns 200 with correct shape", async () => {
    const { status, data } = await fetchJson("/api/flagship-report");
    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toBeDefined();
    expect(data.data.meta).toBeDefined();
    expect(data.data.meta.title).toContain("Morocco Reputation Intelligence");
    expect(data.data.summary).toBeDefined();
    expect(data.data.summary.totalCompanies).toBeGreaterThan(0);
    expect(data.data.summary.totalPeople).toBeGreaterThanOrEqual(20);
    expect(data.data.companies).toBeInstanceOf(Array);
    expect(data.data.companies.length).toBeGreaterThan(0);
  });

  it("GET /api/companies returns company list", async () => {
    const { status, data } = await fetchJson("/api/companies?limit=5");
    expect(status).toBe(200);
    expect(data).toBeDefined();
    const companies = data.data || data;
    expect(Array.isArray(companies)).toBe(true);
    if (companies.length > 0) {
      expect(companies[0]).toHaveProperty("slug");
      expect(companies[0]).toHaveProperty("name");
    }
  });

  it("GET /api/companies/ocp-group/articles returns articles", async () => {
    const { status, data } = await fetchJson("/api/companies/ocp-group/articles?limit=3");
    expect(status).toBe(200);
    expect(data).toBeDefined();
    const articles = data.data || data;
    expect(Array.isArray(articles)).toBe(true);
  });

  it("GET /api/companies/ocp-group/entities returns entities", async () => {
    const { status, data } = await fetchJson("/api/companies/ocp-group/entities?top=5");
    expect(status).toBe(200);
    expect(data).toBeDefined();
    expect(data.success).toBe(true);
  });

  it("GET /api/companies/ocp-group/sentiment returns sentiment scores", async () => {
    const { status, data } = await fetchJson("/api/companies/ocp-group/sentiment?limit=5");
    expect(status).toBe(200);
    expect(data).toBeDefined();
  });

  it("GET /api/companies/ocp-group/reputation returns reputation data", async () => {
    const { status, data } = await fetchJson("/api/companies/ocp-group/reputation");
    expect([200, 404]).toContain(status);
  });
});

describe("Public pages", () => {
  it("GET /atelier returns 200", async () => {
    const res = await fetch(`${BASE}/atelier`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/flagship-report returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/flagship-report`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/harch-100 returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/harch-100`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/companies/ocp-group returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/companies/ocp-group`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/companies/attijariwafa-bank returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/companies/attijariwafa-bank`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/companies/bank-of-africa returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/companies/bank-of-africa`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/companies/maroc-telecom returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/companies/maroc-telecom`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });

  it("GET /atelier/companies/royal-air-maroc returns 200", async () => {
    const res = await fetch(`${BASE}/atelier/companies/royal-air-maroc`, { signal: AbortSignal.timeout(TIMEOUT) });
    expect(res.status).toBe(200);
  });
});

describe("Auth endpoints", () => {
  it("GET /api/auth/session returns 200", async () => {
    const { status } = await fetchJson("/api/auth/session");
    expect(status).toBe(200);
  });

  it("GET /api/auth/providers returns 200", async () => {
    const { status, data } = await fetchJson("/api/auth/providers");
    expect(status).toBe(200);
    expect(data).toBeDefined();
  });
});

describe("Cron endpoints (expect 401 without secret)", () => {
  it("GET /api/cron/health returns response", async () => {
    const { status } = await fetchJson("/api/cron/health");
    expect([200, 401]).toContain(status);
  });
});

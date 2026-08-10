// ═══════════════════════════════════════════════════════════════
//  DEMO SESSION — DEPRECATED
//
//  Demo accounts have been removed. All users must go through the
//  proper invitation flow. This file exists only as a stub to
//  prevent import errors in the 38 files that still reference it.
//
//  All functions return false/null/empty — no demo data is served.
// ═══════════════════════════════════════════════════════════════

export const DEMO_PASSWORD = "__DISABLED__";

export function isDemoEmail(_email: string | null | undefined): boolean {
  return false;
}

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accountType: string;
  companyId: string | null;
  status: string;
}

export function getDemoUser(_email: string): DemoUser | null {
  return null;
}

export const DEMO_USERS: DemoUser[] = [];

// Stub for getDemoTeam (referenced by team-activity API)
export function getDemoTeam(_email: string): any[] {
  return [];
}

// Stub for DEMO_COMPANIES (if referenced)
export const DEMO_COMPANIES: any[] = [];

// Stub for createDemoUser (if referenced)
export async function createDemoUser(_email: string, _name: string, _accountType: string): Promise<DemoUser | null> {
  return null;
}

// Stub for getDemoArticles (if referenced)
export function getDemoArticles(_companyId: string, _limit: number): any[] {
  return [];
}

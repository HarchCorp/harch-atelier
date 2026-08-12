// ═══════════════════════════════════════════════════════════════
//  ZAI SDK WRAPPER — reads config from env vars (Vercel-compatible)
//
//  The z-ai-web-dev-sdk reads config from a .z-ai-config file, which
//  doesn't work on Vercel (no filesystem). This wrapper creates the
//  file at runtime from env vars, then calls ZAI.create().
//
//  Required env vars (set on Vercel):
//    ZAI_API_KEY  — the API key
//    ZAI_BASE_URL — the base URL (e.g. https://api.z.ai/api/paas/v4)
// ═══════════════════════════════════════════════════════════════

import ZAI from "z-ai-web-dev-sdk";
import { writeFileSync, existsSync } from "fs";
import { join } from "path";

let initialized = false;

function ensureConfigFile(): void {
  if (initialized) return;

  const apiKey = process.env.ZAI_API_KEY;
  const baseUrl = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/paas/v4";

  if (apiKey && !existsSync(join(process.cwd(), ".z-ai-config"))) {
    try {
      writeFileSync(
        join(process.cwd(), ".z-ai-config"),
        JSON.stringify({ apiKey, baseUrl }),
        { encoding: "utf-8" },
      );
      initialized = true;
    } catch {
      // If write fails (read-only filesystem), fall back to SDK error
    }
  }
}

export async function createZAI(): Promise<any> {
  ensureConfigFile();
  return ZAI.create();
}

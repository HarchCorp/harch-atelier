// ═══════════════════════════════════════════════════════════════
//  CRON AUTH HELPER — PROJECT AEGIS v4.0
//
//  Shared `authorizeCron` used by every /api/cron/* route. Validates
//  the `Authorization: Bearer ${CRON_SECRET}` header in constant
//  time so external callers can't brute-force the secret via timing
//  side-channels.
//
//  Returns true iff:
//   • CRON_SECRET is configured in the environment
//   • The request carries an `Authorization: Bearer <token>` header
//   • `<token>` byte-equals CRON_SECRET (timing-safe)
// ═══════════════════════════════════════════════════════════════

import { timingSafeEqual } from "crypto";

export function authorizeCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = req.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return false;

  const provided = auth.slice("Bearer ".length).trim();
  if (provided.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

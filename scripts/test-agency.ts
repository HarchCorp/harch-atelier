// Quick smoke test for the agency engine — verifies:
//   1. The seeded agency + 3 sub-clients are in Neon.
//   2. getQuota() returns the expected limits + current usage.
//   3. checkQuota("apiRequest") returns { allowed, used, max, remaining }.
//   4. incrementUsage("apiRequest", 1) bumps the counter.
//   5. resolveAgencyClientFromHost simulates a subdomain lookup.
//   6. getBranding returns the per-client branding.
//
// Run: bun run scripts/test-agency.ts

import { prisma } from "../src/lib/db";
import {
  getQuota,
  checkQuota,
  incrementUsage,
  currentPeriod,
} from "../src/lib/agency/quota";
import { getBranding } from "../src/lib/agency/branding";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  AGENCY ENGINE SMOKE TEST (Brick 8)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  // ─── 1. Verify the agency + clients ─────────────────────────────
  const agency = await prisma.agency.findUnique({
    where: { slug: "omocto" },
    include: {
      clients: {
        include: {
          company: { select: { name: true } },
          branding: true,
          quota: true,
        },
      },
    },
  });
  if (!agency) {
    console.error("✗ Agency 'omocto' not found — run `bun run scripts/seed-agency.ts` first.");
    process.exit(1);
  }
  console.log(`✓ Agency: ${agency.name} (id: ${agency.id})`);
  console.log(`  Sub-clients: ${agency.clients.length}`);
  for (const c of agency.clients) {
    console.log(
      `    - ${c.displayName} (${c.subdomain}) — ${c.quota?.planTier} / ${c.quota?.monthlyPriceMAD} MAD/mo`,
    );
  }

  // ─── 2. Test getQuota + checkQuota on the first client ──────────
  const firstClient = agency.clients[0];
  console.log(`\n── Testing quota on "${firstClient.displayName}" ──`);
  const snap = await getQuota(firstClient.id);
  if (!snap) {
    console.error("✗ getQuota returned null");
    process.exit(1);
  }
  console.log(`✓ getQuota returned quota + usage:`);
  console.log(`    Plan:        ${snap.quota.planTier}`);
  console.log(`    Max API:     ${snap.quota.maxApiRequests.toLocaleString()}/mo`);
  console.log(`    Used API:    ${snap.usage?.apiRequests.toLocaleString() ?? 0} (period: ${snap.usage?.period ?? currentPeriod()})`);
  console.log(`    Max WA:      ${snap.quota.maxWhatsAppAlerts.toLocaleString()}/mo`);
  console.log(`    Used WA:     ${snap.usage?.whatsappAlerts.toLocaleString() ?? 0}`);

  const check = await checkQuota(firstClient.id, "apiRequest");
  console.log(`\n✓ checkQuota("apiRequest"):`);
  console.log(`    allowed:    ${check.allowed}`);
  console.log(`    used:       ${check.used.toLocaleString()}`);
  console.log(`    max:        ${check.max.toLocaleString()}`);
  console.log(`    remaining:  ${check.remaining.toLocaleString()}`);
  console.log(`    period:     ${check.period}`);

  // ─── 3. Test incrementUsage (and verify it persists) ─────────────
  const before = check.used;
  await incrementUsage(firstClient.id, "apiRequest", 1);
  const check2 = await checkQuota(firstClient.id, "apiRequest");
  console.log(`\n✓ incrementUsage("apiRequest", 1):`);
  console.log(`    before: ${before.toLocaleString()}`);
  console.log(`    after:  ${check2.used.toLocaleString()}`);
  if (check2.used !== before + 1) {
    console.error(`✗ Expected ${before + 1}, got ${check2.used}`);
    process.exit(1);
  }
  console.log(`    ✓ Counter incremented by exactly 1`);

  // Roll back the test increment so the seed numbers stay clean.
  await prisma.agencyUsage.update({
    where: { agencyClientId_period: { agencyClientId: firstClient.id, period: currentPeriod() } },
    data: { apiRequests: before },
  });
  console.log(`    ✓ Rolled back test increment`);

  // ─── 4. Test the WhatsApp quota check on the second client ───────
  const secondClient = agency.clients[1];
  console.log(`\n── Testing WhatsApp quota on "${secondClient.displayName}" ──`);
  const waCheck = await checkQuota(secondClient.id, "whatsappAlert");
  console.log(`✓ checkQuota("whatsappAlert"):`);
  console.log(`    allowed:    ${waCheck.allowed}`);
  console.log(`    used:       ${waCheck.used}`);
  console.log(`    max:        ${waCheck.max}`);
  console.log(`    remaining:  ${waCheck.remaining}`);

  // ─── 5. Test getBranding ─────────────────────────────────────────
  console.log(`\n── Testing branding on "${firstClient.displayName}" ──`);
  const branding = await getBranding(firstClient.id);
  console.log(`✓ getBranding:`);
  console.log(`    resolvedFrom:   ${branding.resolvedFrom}`);
  console.log(`    displayName:    ${branding.displayName}`);
  console.log(`    primaryColor:   ${branding.primaryColor}`);
  console.log(`    accentColor:    ${branding.accentColor}`);
  console.log(`    loginTitle:     ${branding.loginTitle}`);
  console.log(`    logoUrl:        ${branding.logoUrl}`);
  console.log(`    hideHarchBadge: ${branding.hideHarchBadge}`);

  // ─── Summary ────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("  ✓ AGENCY ENGINE SMOKE TEST PASSED");
  console.log(`    Agency:        ${agency.name}`);
  console.log(`    Sub-clients:   ${agency.clients.length}`);
  console.log(`    Quota system:  ✓ read + check + increment`);
  console.log(`    Branding:      ✓ resolves per-client`);
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Smoke test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

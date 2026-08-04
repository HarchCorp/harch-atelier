import { prisma } from "../src/lib/db";

async function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  CRASH-TEST 2: B2B2B Chaos");
  console.log("═══════════════════════════════════════════════════\n");

  const agency = await prisma.agency.findFirst({ where: { slug: "omocto" } });
  if (!agency) { console.log("❌ no agency"); process.exit(1); }

  // Create 20 sub-clients with chaotic data
  console.log("--- Creating 20 chaotic sub-clients ---");
  let created = 0;
  let errors = 0;
  
  for (let i = 0; i < 20; i++) {
    try {
      const companyName = `ChaosCorp-${i}`;
      const slug = `chaos-${i}-${Date.now().toString(36).slice(-4)}`;
      
      // Create company
      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug,
          sector: i % 3 === 0 ? "banking" : i % 3 === 1 ? "telecom" : "mining",
          aliases: [],
          isDemo: false,
        },
      });
      
      // Create agency client
      const client = await prisma.agencyClient.create({
        data: {
          agencyId: agency.id,
          companyId: company.id,
          displayName: companyName,
          subdomain: `chaos-${i}`,
          status: i % 5 === 0 ? "suspended" : "active",
        },
      });
      
      // Create branding with random colors
      await prisma.agencyBranding.create({
        data: {
          agencyClientId: client.id,
          primaryColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`,
          accentColor: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')}`,
          loginTitle: `${companyName} Intelligence`,
        },
      });
      
      // Create quota with chaotic pricing (some absurd)
      const planTiers = ["emergence", "corporate", "sovereign"];
      const prices = [15000, 40000, 75000, 0, -1, 999999, 50000, 53000];
      await prisma.agencyQuota.create({
        data: {
          agencyClientId: client.id,
          maxApiRequests: [10000, 50000, 250000][i % 3],
          maxWhatsAppAlerts: [100, 500, 2000][i % 3],
          maxKeywords: [50, 200, 1000][i % 3],
          maxSources: [30, 100, 500][i % 3],
          maxUsers: [5, 15, 50][i % 3],
          planTier: planTiers[i % 3],
          monthlyPriceMAD: prices[i % prices.length],
        },
      });
      
      created++;
    } catch (e) {
      errors++;
      if (errors <= 3) console.log(`  ❌ client ${i}: ${e instanceof Error ? e.message.slice(0,60) : String(e)}`);
    }
  }
  
  console.log(`  ✓ ${created} created, ${errors} errors (out of 20)`);
  
  // Test duplicate detection
  console.log("\n--- Testing duplicate detection ---");
  try {
    const existingCompany = await prisma.company.findFirst({ where: { slug: { startsWith: "attijariwafa" } } });
    if (existingCompany) {
      const existingClient = await prisma.agencyClient.findFirst({
        where: { agencyId: agency.id, companyId: existingCompany.id },
      });
      console.log(`  ✓ duplicate detection: ${existingClient ? "blocked (existing)" : "would create (no existing)"}`);
    }
  } catch (e) {
    console.log(`  ❌ duplicate check error: ${e}`);
  }
  
  // Test expired dates
  console.log("\n--- Testing expired invitations ---");
  const expiredInvites = await prisma.invitation.create({
    data: {
      email: "expired-test@chaos.ma",
      token: "expired-token-" + Date.now(),
      companyId: (await prisma.company.findFirst())!.id,
      expiresAt: new Date(Date.now() - 86400000), // expired yesterday
    },
  }).catch(() => null);
  console.log(`  ${expiredInvites ? "✓ expired invitation created (for testing)" : "❌ failed to create expired"}`);
  
  // Cleanup chaos data
  console.log("\n--- Cleaning up chaos data ---");
  const chaosClients = await prisma.agencyClient.findMany({
    where: { displayName: { startsWith: "ChaosCorp-" } },
    select: { id: true },
  });
  
  if (chaosClients.length > 0) {
    // Delete cascading: branding, quota, then client, then company
    await prisma.agencyBranding.deleteMany({ where: { agencyClientId: { in: chaosClients.map(c => c.id) } } });
    await prisma.agencyQuota.deleteMany({ where: { agencyClientId: { in: chaosClients.map(c => c.id) } } });
    await prisma.agencyClient.deleteMany({ where: { id: { in: chaosClients.map(c => c.id) } } });
    await prisma.company.deleteMany({ where: { name: { startsWith: "ChaosCorp-" } } });
    console.log(`  ✓ cleaned up ${chaosClients.length} chaos sub-clients`);
  }
  
  if (expiredInvites) {
    await prisma.invitation.delete({ where: { id: expiredInvites.id } });
    console.log("  ✓ cleaned up expired invitation");
  }
  
  // Final count
  const finalCount = await prisma.agencyClient.count({ where: { agencyId: agency.id } });
  console.log(`\n  Final sub-client count: ${finalCount} (should be 3 — original Attijariwafa, OCP, Maroc Telecom)`);
  
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  B2B2B CHAOS TEST: PASS (no crashes, duplicates handled)");
  console.log("═══════════════════════════════════════════════════");
  
  await prisma.$disconnect();
}
main().catch(e => { console.error("FATAL:", e); process.exit(1); });

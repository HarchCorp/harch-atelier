// ═══════════════════════════════════════════════════════════════
//  SEED COMPANY DOMAINS — populate Company.domain for self-reg
//
//  Adds the official website domain to the 5 real Moroccan companies
//  created by scripts/seed.ts so the /api/auth/register-company
//  domain-matching flow can auto-attach new users to their employer.
//
//  Only REAL companies get a domain — the demo competitor companies
//  created by /api/auth/demo-seed are deliberately left without a
//  domain so a real BCP employee can't accidentally attach to the
//  demo-created BCP row.
//
//  Usage:
//    bun --ts scripts/seed-company-domains.ts
//
//  Task: domain-matching-demo-isolation
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import { normalizeDomain } from "../src/lib/harchiq/domain-extract";

// ─── Company slug → official website domain ─────────────────────
// Source: the websites already stored in the seed.ts COMPANIES table,
// normalized to the bare domain (no protocol, no www, no path).
//
// We intentionally hardcode the normalized form here rather than
// deriving it from the existing Company.website column at runtime —
// that way the seed is auditable and a future website change doesn't
// silently break domain matching for existing users.
const COMPANY_DOMAINS: Array<{ slug: string; domain: string; website: string }> = [
  { slug: "ocp-group", domain: "ocp.com", website: "https://www.ocp.com" },
  { slug: "attijariwafa-bank", domain: "attijariwafa.com", website: "https://www.attijariwafa.com" },
  { slug: "bank-of-africa", domain: "bankofafrica.ma", website: "https://www.bankofafrica.ma" },
  { slug: "maroc-telecom", domain: "iam.ma", website: "https://www.iam.ma" },
  { slug: "royal-air-maroc", domain: "royalairmaroc.com", website: "https://www.royalairmaroc.com" },
];

async function main() {
  console.log("Seeding company domains...\n");

  let updated = 0;
  let skipped = 0;

  for (const entry of COMPANY_DOMAINS) {
    const normalized = normalizeDomain(entry.domain);
    if (!normalized) {
      console.warn(`  SKIP ${entry.slug}: empty domain after normalization`);
      skipped++;
      continue;
    }

    // Find the real (non-demo) company by slug.
    const company = await prisma.company.findUnique({
      where: { slug: entry.slug },
      select: { id: true, name: true, domain: true, isDemo: true, website: true },
    });

    if (!company) {
      console.warn(`  SKIP ${entry.slug}: company not found in DB (run scripts/seed.ts first)`);
      skipped++;
      continue;
    }

    if (company.isDemo) {
      console.warn(`  SKIP ${entry.slug}: company is marked isDemo=true (demo data)`);
      skipped++;
      continue;
    }

    if (company.domain === normalized) {
      console.log(`  OK   ${entry.slug}: domain already set to "${normalized}"`);
      skipped++;
      continue;
    }

    // Check for collision — another real company already owns this domain.
    const collision = await prisma.company.findUnique({
      where: { domain: normalized },
      select: { id: true, slug: true, isDemo: true },
    });
    if (collision && collision.id !== company.id) {
      console.warn(
        `  SKIP ${entry.slug}: domain "${normalized}" already owned by company slug="${collision.slug}" (isDemo=${collision.isDemo})`,
      );
      skipped++;
      continue;
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        domain: normalized,
        // Also normalize the website if it was missing or different.
        website: company.website ?? entry.website,
      },
    });
    console.log(`  SET  ${entry.slug}: domain = "${normalized}" (was ${company.domain ?? "null"})`);
    updated++;
  }

  // ─── Summary ─────────────────────────────────────────────────
  const total = await prisma.company.count({ where: { isDemo: false } });
  const withDomain = await prisma.company.count({
    where: { isDemo: false, domain: { not: null } },
  });

  console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
  console.log(`Real companies with domain: ${withDomain}/${total}.`);

  // List all real companies + their domains for verification.
  const all = await prisma.company.findMany({
    where: { isDemo: false },
    select: { slug: true, name: true, domain: true },
    orderBy: { name: "asc" },
  });
  console.log("\nReal company domain directory:");
  for (const c of all) {
    console.log(`  ${c.name.padEnd(28)}  ${c.domain ?? "(no domain)"}`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });

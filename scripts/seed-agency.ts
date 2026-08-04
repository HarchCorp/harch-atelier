// ═══════════════════════════════════════════════════════════════
//  SEED AGENCY — Brick 8 — demo agency "Omocto"
//
//  Creates:
//    • Agency "Omocto" (slug: omocto, commissionPct: 30,
//      primaryColor: #4A5D6E)
//    • Agency admin user: agency@omocto.ma / agency123
//      (role: agency-admin, linked to Omocto)
//    • 3 AgencyClients:
//        - Attijariwafa Bank (subdomain: attijari, planTier: sovereign, 75K MAD/mo)
//        - OCP Group        (subdomain: ocp,       planTier: corporate, 40K MAD/mo)
//        - Maroc Telecom    (subdomain: iam,       planTier: corporate, 40K MAD/mo)
//    • AgencyBranding for each (custom primaryColor, logo placeholder,
//      loginTitle)
//    • AgencyQuota for each (plan-tier defaults)
//    • AgencyUsage for the current month with some sample numbers
//
//  Idempotent: re-running updates existing rows rather than duplicating.
//
//  Run: bun run scripts/seed-agency.ts
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";
import { PLAN_DEFAULTS, currentPeriod } from "../src/lib/agency/quota";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  Seeding agency: Omocto (Brick 8 — Tier 4 White-Label)");
  console.log("═══════════════════════════════════════════════════════════════");

  // ─── 1. Agency ──────────────────────────────────────────────────
  const agency = await prisma.agency.upsert({
    where: { slug: "omocto" },
    create: {
      name: "Omocto",
      slug: "omocto",
      legalName: "Omocto SARL",
      contactEmail: "agency@omocto.ma",
      commissionPct: 30,
      primaryColor: "#4A5D6E",
      logoUrl: null,
      status: "active",
    },
    update: {
      name: "Omocto",
      legalName: "Omocto SARL",
      contactEmail: "agency@omocto.ma",
      commissionPct: 30,
      primaryColor: "#4A5D6E",
      status: "active",
    },
  });
  console.log(`✓ Agency: ${agency.name} (slug: ${agency.slug}, id: ${agency.id})`);

  // ─── 2. Agency admin user ──────────────────────────────────────
  const adminEmail = "agency@omocto.ma";
  const adminPassword = "agency123";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: "Omocto Agency Admin",
        passwordHash,
        role: "agency-admin",
        accountType: "brand-monitor",
        status: "active",
        agencyId: agency.id,
      },
    });
    console.log(`✓ Agency admin (updated): ${adminEmail}`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Omocto Agency Admin",
        passwordHash,
        role: "agency-admin",
        accountType: "brand-monitor",
        status: "active",
        agencyId: agency.id,
        onboardingCompleted: true,
      },
    });
    console.log(`✓ Agency admin (created): ${adminEmail}`);
  }
  console.log(`  Password: ${adminPassword}`);

  // ─── 3. Sub-clients ────────────────────────────────────────────
  interface SubClientSpec {
    companySlug: string;
    displayName: string;
    subdomain: string;
    planTier: "emergence" | "corporate" | "sovereign";
    monthlyPriceMAD: number;
    primaryColor: string;
    accentColor: string;
    loginTitle: string;
    logoUrl: string;
    // Sample usage numbers for the current period.
    sampleUsage: {
      apiRequests: number;
      whatsappAlerts: number;
      keywordsUsed: number;
      sourcesUsed: number;
      usersActive: number;
    };
  }

  const specs: SubClientSpec[] = [
    {
      companySlug: "attijariwafa-bank",
      displayName: "Attijariwafa Bank — RP",
      subdomain: "attijari",
      planTier: "sovereign",
      monthlyPriceMAD: 75_000,
      primaryColor: "#0F3D5C",        // Attijari deep blue
      accentColor: "#D4A24E",          // Attijari gold
      loginTitle: "Attijariwafa — Reputation Intelligence",
      logoUrl: "https://placehold.co/200x48/0F3D5C/FFFFFF.png?text=Attijariwafa",
      sampleUsage: {
        apiRequests: 184_520,
        whatsappAlerts: 1_247,
        keywordsUsed: 612,
        sourcesUsed: 188,
        usersActive: 23,
      },
    },
    {
      companySlug: "ocp-group",
      displayName: "OCP Group — Comms Team",
      subdomain: "ocp",
      planTier: "corporate",
      monthlyPriceMAD: 40_000,
      primaryColor: "#006A4E",        // OCP green
      accentColor: "#84BD00",
      loginTitle: "OCP Group — HarchIQ",
      logoUrl: "https://placehold.co/200x48/006A4E/FFFFFF.png?text=OCP+Group",
      sampleUsage: {
        apiRequests: 42_318,
        whatsappAlerts: 384,
        keywordsUsed: 142,
        sourcesUsed: 56,
        usersActive: 11,
      },
    },
    {
      companySlug: "maroc-telecom",
      displayName: "Maroc Telecom — Dircom",
      subdomain: "iam",
      planTier: "corporate",
      monthlyPriceMAD: 40_000,
      primaryColor: "#003DA5",        // IAM blue
      accentColor: "#00A0E3",
      loginTitle: "Maroc Telecom — Console RP",
      logoUrl: "https://placehold.co/200x48/003DA5/FFFFFF.png?text=Maroc+Telecom",
      sampleUsage: {
        apiRequests: 38_902,
        whatsappAlerts: 412,
        keywordsUsed: 167,
        sourcesUsed: 62,
        usersActive: 9,
      },
    },
  ];

  for (const spec of specs) {
    // Lookup the company by slug.
    const company = await prisma.company.findUnique({
      where: { slug: spec.companySlug },
      select: { id: true, name: true },
    });
    if (!company) {
      console.warn(`  ⚠ Company "${spec.companySlug}" not found — skipping sub-client`);
      continue;
    }

    // Upsert the AgencyClient (unique constraint on subdomain).
    const defaults = PLAN_DEFAULTS[spec.planTier];
    const client = await prisma.agencyClient.upsert({
      where: { subdomain: spec.subdomain },
      create: {
        agencyId: agency.id,
        companyId: company.id,
        displayName: spec.displayName,
        subdomain: spec.subdomain,
        status: "active",
      },
      update: {
        agencyId: agency.id,
        companyId: company.id,
        displayName: spec.displayName,
        status: "active",
      },
    });

    // Branding.
    await prisma.agencyBranding.upsert({
      where: { agencyClientId: client.id },
      create: {
        agencyClientId: client.id,
        logoUrl: spec.logoUrl,
        primaryColor: spec.primaryColor,
        accentColor: spec.accentColor,
        fontFamily: "'Inter', system-ui, sans-serif",
        loginTitle: spec.loginTitle,
        loginSubtitle: `Sign in to your ${spec.displayName} workspace`,
        footerText: "Powered by Omocto + Harch",
        hideHarchBadge: false,
      },
      update: {
        logoUrl: spec.logoUrl,
        primaryColor: spec.primaryColor,
        accentColor: spec.accentColor,
        loginTitle: spec.loginTitle,
        loginSubtitle: `Sign in to your ${spec.displayName} workspace`,
        footerText: "Powered by Omocto + Harch",
      },
    });

    // Quota.
    await prisma.agencyQuota.upsert({
      where: { agencyClientId: client.id },
      create: {
        agencyClientId: client.id,
        maxApiRequests: defaults.maxApiRequests,
        maxWhatsAppAlerts: defaults.maxWhatsAppAlerts,
        maxKeywords: defaults.maxKeywords,
        maxSources: defaults.maxSources,
        maxUsers: defaults.maxUsers,
        planTier: spec.planTier,
        monthlyPriceMAD: spec.monthlyPriceMAD,
      },
      update: {
        maxApiRequests: defaults.maxApiRequests,
        maxWhatsAppAlerts: defaults.maxWhatsAppAlerts,
        maxKeywords: defaults.maxKeywords,
        maxSources: defaults.maxSources,
        maxUsers: defaults.maxUsers,
        planTier: spec.planTier,
        monthlyPriceMAD: spec.monthlyPriceMAD,
      },
    });

    // Current-period usage (sample numbers).
    const period = currentPeriod();
    await prisma.agencyUsage.upsert({
      where: { agencyClientId_period: { agencyClientId: client.id, period } },
      create: {
        agencyClientId: client.id,
        period,
        apiRequests: spec.sampleUsage.apiRequests,
        whatsappAlerts: spec.sampleUsage.whatsappAlerts,
        keywordsUsed: spec.sampleUsage.keywordsUsed,
        sourcesUsed: spec.sampleUsage.sourcesUsed,
        usersActive: spec.sampleUsage.usersActive,
        lastResetAt: new Date(),
      },
      update: {
        apiRequests: spec.sampleUsage.apiRequests,
        whatsappAlerts: spec.sampleUsage.whatsappAlerts,
        keywordsUsed: spec.sampleUsage.keywordsUsed,
        sourcesUsed: spec.sampleUsage.sourcesUsed,
        usersActive: spec.sampleUsage.usersActive,
      },
    });

    // Also seed the previous month with a slightly lower sample so the
    // usage history tab has more than one row.
    const now = new Date();
    const prevDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const prevPeriod = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, "0")}`;
    await prisma.agencyUsage.upsert({
      where: { agencyClientId_period: { agencyClientId: client.id, period: prevPeriod } },
      create: {
        agencyClientId: client.id,
        period: prevPeriod,
        apiRequests: Math.round(spec.sampleUsage.apiRequests * 0.85),
        whatsappAlerts: Math.round(spec.sampleUsage.whatsappAlerts * 0.9),
        keywordsUsed: Math.round(spec.sampleUsage.keywordsUsed * 0.8),
        sourcesUsed: Math.round(spec.sampleUsage.sourcesUsed * 0.85),
        usersActive: Math.max(1, Math.round(spec.sampleUsage.usersActive * 0.75)),
        lastResetAt: prevDate,
      },
      update: {
        apiRequests: Math.round(spec.sampleUsage.apiRequests * 0.85),
        whatsappAlerts: Math.round(spec.sampleUsage.whatsappAlerts * 0.9),
        keywordsUsed: Math.round(spec.sampleUsage.keywordsUsed * 0.8),
        sourcesUsed: Math.round(spec.sampleUsage.sourcesUsed * 0.85),
        usersActive: Math.max(1, Math.round(spec.sampleUsage.usersActive * 0.75)),
      },
    });

    console.log(`✓ Sub-client: ${spec.displayName} (${spec.subdomain}, ${spec.planTier})`);
    console.log(`    Company: ${company.name}`);
    console.log(`    Plan:    ${spec.planTier} — ${spec.monthlyPriceMAD.toLocaleString()} MAD/mo`);
    console.log(`    Usage:   ${spec.sampleUsage.apiRequests.toLocaleString()} API reqs, ${spec.sampleUsage.whatsappAlerts} WhatsApp alerts`);
  }

  // ─── Summary ───────────────────────────────────────────────────
  const allClients = await prisma.agencyClient.findMany({
    where: { agencyId: agency.id },
    select: {
      id: true,
      displayName: true,
      subdomain: true,
      quota: { select: { planTier: true, monthlyPriceMAD: true } },
    },
  });
  const totalRevenue = allClients.reduce((s, c) => s + (c.quota?.monthlyPriceMAD ?? 0), 0);
  const commission = Math.round((totalRevenue * agency.commissionPct) / 100);

  console.log("");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ✓ AGENCY SEEDED — Omocto white-label engine ready");
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  Agency:        ${agency.name} (slug: ${agency.slug})`);
  console.log(`  Sub-clients:   ${allClients.length}`);
  console.log(`  Monthly rev:   ${totalRevenue.toLocaleString()} MAD`);
  console.log(`  Commission:    ${commission.toLocaleString()} MAD (${agency.commissionPct}%)`);
  console.log("");
  console.log("  Agency admin login:");
  console.log(`    Email:        ${adminEmail}`);
  console.log(`    Password:     ${adminPassword}`);
  console.log(`    Dashboard:    /atelier/agency`);
  console.log("═══════════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

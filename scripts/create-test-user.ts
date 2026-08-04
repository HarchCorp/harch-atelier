import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "test-real@harchcorp.com";
  const password = "test1234";
  const hash = await bcrypt.hash(password, 10);

  // Find a company to attach the user to (OCP Group)
  const company = await prisma.company.findFirst({ where: { slug: "ocp-group" } });
  if (!company) {
    console.log("✗ OCP Group not found");
    process.exit(1);
  }

  // Upsert the test user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hash,
      role: "user",
      accountType: "brand-monitor",
      companyId: company.id,
      status: "active",
      onboardingCompleted: true,
      isDemo: false,
    },
    create: {
      email,
      name: "Test Real User",
      passwordHash: hash,
      role: "user",
      accountType: "brand-monitor",
      companyId: company.id,
      status: "active",
      onboardingCompleted: true,
      isDemo: false,
    },
  });

  console.log(`✓ test user created: ${user.email} | company: ${company.name} | accountType: ${user.accountType} | isDemo: ${user.isDemo}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

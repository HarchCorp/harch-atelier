// Create admin user directly via Prisma (bypass the HTTP route)
// Usage: env -u DATABASE_URL -u DIRECT_URL bun run scripts/create-admin.ts

import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "amine@harchcorp.com";
  const name = "Amine Harch El Korane";
  const password = "HarchAtelier2026!";
  const plan = "investor";
  const role = "admin";
  const accountType = "enterprise";  // admin can access all consoles via /atelier/admin

  // Check if admin exists
  const existing = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    console.log("Updating password + accountType...");
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, name, plan, role, accountType },
    });
    console.log("Admin updated:", email);
    return;
  }

  // Check if email is taken
  const emailTaken = await prisma.user.findUnique({ where: { email } });
  if (emailTaken) {
    console.log("Email already in use by non-admin:", email);
    return;
  }

  // Create admin
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role, plan, accountType },
    select: { id: true, email: true, name: true, role: true, plan: true, accountType: true, createdAt: true },
  });

  console.log("Admin created successfully:");
  console.log(JSON.stringify(user, null, 2));
  console.log("\nYou can now sign in at /atelier/login with:");
  console.log("  Email:    " + email);
  console.log("  Password: " + password);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

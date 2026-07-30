import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "amine@harchcorp.com";
  const name = "Amine Harch El Korane";
  const password = "HarchAtelier2026!";
  const role = "admin";
  const accountType = "brand-monitor";

  const existing = await prisma.user.findFirst({ where: { role: "admin" } });
  if (existing) {
    console.log("Admin already exists:", existing.email);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash, name, role, accountType },
    });
    console.log("Admin updated:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, role, accountType },
    select: { id: true, email: true, name: true, role: true, accountType: true, createdAt: true },
  });

  console.log("Admin created:");
  console.log(JSON.stringify(user, null, 2));
  console.log("\nEmail:    " + email);
  console.log("Password: " + password);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

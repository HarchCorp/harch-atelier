// ═══════════════════════════════════════════════════════════════
//  CREATE OWNER SUPER_ADMIN ACCOUNT — YGGDRASIL Nœud 0e
//
//  This script creates the permanent super_admin account for the
//  platform owner. Run it ONCE. The credentials below are the
//  master login — change the password after first sign-in.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

const OWNER_EMAIL = "amine@harchcorp.com";
const OWNER_NAME = "Amine Harchelkorane";
const OWNER_PASSWORD = "Harch-Yggdrasil-2026!";
const MASTER_CODE = "HARCH-R7BEU-T66SW-MZRQY";

(async () => {
  try {
    const existing = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });
    if (existing) {
      console.log("Owner already exists:", existing.email, "role:", existing.role);
      if (existing.role !== "super_admin") {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: "super_admin", status: "active", onboardingCompleted: true },
        });
        console.log("Upgraded to super_admin.");
      }
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
    const owner = await prisma.user.create({
      data: {
        name: OWNER_NAME,
        email: OWNER_EMAIL,
        passwordHash,
        role: "super_admin",
        status: "active",
        onboardingCompleted: true,
      },
    });

    console.log("╔══════════════════════════════════════════════════════════════╗");
    console.log("║  SUPER_ADMIN OWNER ACCOUNT CREATED                          ║");
    console.log("╠══════════════════════════════════════════════════════════════╣");
    console.log(`║  Email:    ${OWNER_EMAIL.padEnd(48)}║`);
    console.log(`║  Password: ${OWNER_PASSWORD.padEnd(48)}║`);
    console.log(`║  Role:     super_admin${" ".repeat(39)}║`);
    console.log(`║  User ID:  ${owner.id.slice(0, 24).padEnd(48)}║`);
    console.log("╚══════════════════════════════════════════════════════════════╝");
    console.log("\nLogin at: /atelier/login");
    console.log("Admin panel: /atelier/admin-x7k2m9");
    console.log("\nMaster Code (for generating more super_admin codes):");
    console.log(`  ${MASTER_CODE}`);
    console.log("\n⚠ Change the password after first login.");
  } catch (err) {
    console.error("Failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  }
})();

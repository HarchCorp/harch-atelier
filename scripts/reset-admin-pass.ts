import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "amine@harchcorp.com";
  const newPassword = "Harch2026!";
  const hash = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email },
    data: { 
      passwordHash: hash,
      role: "admin",
      status: "active",
    },
  });
  
  console.log("✓ admin password reset");
  console.log("  email:", user.email);
  console.log("  role:", user.role);
  console.log("  password: Harch2026!");
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

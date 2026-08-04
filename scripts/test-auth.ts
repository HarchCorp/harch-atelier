import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "test-real@harchcorp.com";
  const password = "test1234";
  
  console.log("=== Direct authorize test ===");
  const user = await prisma.user.findUnique({ where: { email } });
  console.log("user found:", !!user, "| has passwordHash:", !!user?.passwordHash, "| status:", user?.status);
  
  if (user?.passwordHash) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("password valid:", valid);
    console.log("user details:", { id: user.id, email: user.email, role: user.role, accountType: user.accountType, isDemo: user.isDemo, companyId: user.companyId });
  }
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });

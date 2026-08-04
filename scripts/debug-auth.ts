import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = "amine@harchcorp.com";
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, passwordHash: true, status: true, isDemo: true }
  });
  
  console.log("=== user in DB ===");
  console.log("id:", user?.id);
  console.log("email:", user?.email);
  console.log("role:", user?.role);
  console.log("status:", user?.status);
  console.log("isDemo:", user?.isDemo);
  console.log("has passwordHash:", !!user?.passwordHash);
  console.log("hash preview:", user?.passwordHash?.slice(0, 20) + "...");
  
  // Test bcrypt compare
  const testPassword = "Harch2026!";
  if (user?.passwordHash) {
    const valid = await bcrypt.compare(testPassword, user.passwordHash);
    console.log("bcrypt compare:", valid ? "✓ MATCH" : "✗ NO MATCH");
    
    if (!valid) {
      // Reset again
      const newHash = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email },
        data: { passwordHash: newHash, role: "admin", status: "active" },
      });
      console.log("✓ password reset again");
      
      const valid2 = await bcrypt.compare(testPassword, newHash);
      console.log("bcrypt compare after reset:", valid2 ? "✓ MATCH" : "✗ NO MATCH");
    }
  }
  
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
